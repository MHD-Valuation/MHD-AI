"""
MHD Real Estate Tech - AI Valuation Model
API Route: /api/v1/predict-price
Thẩm định giá 100% bằng CatBoost AVM, TreeSHAP thật và truy vấn không gian PostGIS
"""

import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from config.settings import settings
from src.services.valuation_service import valuation_service
from src.services.spatial_service import spatial_service
import psycopg2

router = APIRouter(prefix="/api/v1", tags=["Valuation"])

class PropertyValuationRequest(BaseModel):
    property_type: Optional[str] = Field(default="Nhà riêng", description="Loại hình BĐS")
    province_name: Optional[str] = Field(default="Thành phố Hồ Chí Minh", description="Tỉnh/Thành phố")
    district_name: Optional[str] = Field(default="Quận 1", description="Quận/Huyện")
    ward_name: Optional[str] = Field(default="", description="Phường/Xã")
    street_name: Optional[str] = Field(default="", description="Tên đường phố")
    area: float = Field(default=50.0, gt=0, le=5000, description="Diện tích sử dụng m²")
    bedroom_count: Optional[int] = Field(default=2, ge=0, le=50, description="Số phòng ngủ")
    bathroom_count: Optional[int] = Field(default=2, ge=0, le=50, description="Số phòng vệ sinh")
    floor_count: Optional[int] = Field(default=1, ge=1, le=50, description="Số tầng")
    road_width: Optional[float] = Field(default=3.0, ge=0.0, le=100.0, description="Độ rộng ngõ vào (m)")
    frontage_width: Optional[float] = Field(default=4.0, ge=0.0, le=100.0, description="Chiều ngang mặt tiền (m)")
    house_direction: Optional[str] = Field(default="Đông Nam", description="Hướng nhà chính")
    
    # 4 Yếu tố nhạy cảm NLP
    has_so_do: bool = Field(default=True, description="Sổ đỏ/hồng")
    is_lo_goc: bool = Field(default=False, description="Vị trí lô góc")
    is_no_hau: bool = Field(default=False, description="Thế đất nở hậu")
    is_oto_do: bool = Field(default=False, description="Ngõ ô tô vào được")
    
    # Tọa độ WGS84
    latitude: float = Field(default=10.7769, description="Vĩ độ WGS84")
    longitude: float = Field(default=106.7009, description="Kinh độ WGS84")
    
    customer_phone: Optional[str] = Field(default=None, description="Số điện thoại khách hàng")

def save_valuation_history_task(
    client_ip: str,
    customer_phone: Optional[str],
    property_type: str,
    area: float,
    longitude: float,
    latitude: float,
    input_payload: dict,
    predicted_price: float,
    price_low: float,
    price_high: float,
    confidence_score: float,
    model_version: str
):
    try:
        with spatial_service.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO valuation_history (
                        client_ip, customer_phone, property_type, area,
                        geom, input_payload, predicted_price, price_low,
                        price_high, confidence_score, model_version
                    ) VALUES (
                        %s, %s, %s, %s,
                        ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                        %s, %s, %s, %s, %s, %s
                    );
                """, (
                    client_ip, customer_phone, property_type, area,
                    longitude, latitude, json.dumps(input_payload),
                    predicted_price, price_low, price_high,
                    confidence_score, model_version
                ))
                conn.commit()
    except Exception as e:
        print(f"[CẢNH BÁO] Không thể lưu lịch sử định giá: {e}")

@router.post("/predict-price")
async def predict_property_price(
    request_data: PropertyValuationRequest,
    req: Request,
    background_tasks: BackgroundTasks
):
    payload = request_data.model_dump()
    
    # 1. Truy vấn 5 BĐS tương đồng THẬT trong bán kính từ CSDL PostGIS (hoặc Parquet fallback)
    try:
        comparables = spatial_service.find_comparable_properties(
            longitude=request_data.longitude,
            latitude=request_data.latitude,
            property_type=request_data.property_type,
            target_area=request_data.area,
            province_name=request_data.province_name,
            district_name=request_data.district_name,
            radius_meters=2000,
            limit=5
        )
    except Exception as e:
        print(f"[CẢNH BÁO] Lỗi tìm BĐS đối chứng: {e}")
        comparables = []
    
    # 2. Thống kê giá thị trường THẬT quanh khu vực
    try:
        market_stats = spatial_service.get_market_density_stats(
            longitude=request_data.longitude,
            latitude=request_data.latitude,
            radius_meters=2000
        )
    except Exception as e:
        print(f"[CẢNH BÁO] Lỗi thống kê thị trường: {e}")
        market_stats = {"total_samples": 0, "avg_price_per_m2": 0, "min_price_per_m2": 0, "max_price_per_m2": 0}

    # 3. Định giá THẬT bằng CatBoost AVM kết hợp hiệu chuẩn không gian tương đồng
    valuation_res = valuation_service.predict_property_valuation(payload, nearby_comps=comparables)
    
    # 4. Ghi nhận nhật ký & Leads ngầm
    client_ip = req.client.host if req.client else "127.0.0.1"
    background_tasks.add_task(
        save_valuation_history_task,
        client_ip=client_ip,
        customer_phone=request_data.customer_phone,
        property_type=request_data.property_type,
        area=request_data.area,
        longitude=request_data.longitude,
        latitude=request_data.latitude,
        input_payload=payload,
        predicted_price=valuation_res["predicted_price"],
        price_low=valuation_res["price_low"],
        price_high=valuation_res["price_high"],
        confidence_score=valuation_res["confidence_score"],
        model_version=valuation_res["model_version"]
    )
    
    # 5. Tính toán xu hướng giá 12 tháng & dự báo AI
    price_trend = spatial_service.get_price_trend_12m(
        district_name=request_data.district_name,
        province_name=request_data.province_name,
        property_type=request_data.property_type,
        current_price_m2=valuation_res.get("price_per_m2", 0)
    )

    return {
        "status": "success",
        "valuation": valuation_res,
        "comparable_properties": comparables,
        "market_stats": market_stats,
        "price_trend": price_trend
    }

@router.get("/comparables")
async def get_comparables(
    longitude: float,
    latitude: float,
    province_name: Optional[str] = None,
    district_name: Optional[str] = None,
    property_type: str = "Nhà riêng",
    target_area: float = 50.0,
    radius_meters: int = 2000,
    limit: int = 5
):
    """Truy vấn nhanh 5 BĐS tương đồng lân cận chuẩn hóa theo khu vực (bán kính tối đa 2km)"""
    try:
        comps = spatial_service.find_comparable_properties(
            longitude=longitude,
            latitude=latitude,
            property_type=property_type,
            target_area=target_area,
            province_name=province_name,
            district_name=district_name,
            radius_meters=min(radius_meters, 2000),
            limit=limit
        )
    except Exception as e:
        print(f"[CẢNH BÁO] Lỗi truy vấn /comparables: {e}")
        comps = []
    return {
        "status": "success",
        "comparable_properties": comps
    }

@router.get("/spatial-heatmap")
async def get_spatial_heatmap(
    longitude: float,
    latitude: float,
    radius_meters: int = 4000,
    limit: int = 350
):
    """Lấy danh sách các điểm bất động sản thực tế kèm đơn giá để vẽ Bản đồ nhiệt (Price Heatmap)"""
    try:
        points = spatial_service.get_heatmap_points(
            longitude=longitude,
            latitude=latitude,
            radius_meters=radius_meters,
            limit=limit
        )
    except Exception as e:
        print(f"[CẢNH BÁO] Lỗi truy vấn heatmap: {e}")
        points = []
    return {
        "status": "success",
        "total_points": len(points),
        "heatmap_points": points
    }

_cached_all_clusters_json: Optional[str] = None

@router.get("/all-clusters")
async def get_all_clusters(max_points: int = 35000):
    """
    Trả về toàn bộ danh sách điểm giá BĐS thực tế toàn quốc (tối đa 35.000 điểm)
    Định dạng mảng nén [lat, lng, price_m2, price, area, type] siêu nhẹ, load nhanh
    Tối ưu hóa Pre-serialized String & Gzip để phản hồi ngay lập tức (<10ms).
    """
    global _cached_all_clusters_json
    from fastapi.responses import Response

    if _cached_all_clusters_json is not None and max_points >= 35000:
        return Response(content=_cached_all_clusters_json, media_type="application/json")

    points = spatial_service.get_all_cluster_points(max_points=max_points)
    payload = {
        "status": "success",
        "total": len(points),
        "points": points
    }
    serialized = json.dumps(payload, separators=(',', ':'), ensure_ascii=False)
    if max_points >= 35000:
        _cached_all_clusters_json = serialized

    return Response(content=serialized, media_type="application/json")

@router.get("/price-trend")
async def get_price_trend(
    district_name: Optional[str] = None,
    province_name: Optional[str] = None,
    property_type: str = "Nhà riêng",
    current_price_m2: float = 0.0
):
    """Xu hướng giá 12 tháng qua và dự báo 3-6 tháng tới"""
    trend = spatial_service.get_price_trend_12m(
        district_name=district_name or "",
        province_name=province_name or "",
        property_type=property_type,
        current_price_m2=current_price_m2
    )
    return {
        "status": "success",
        "price_trend": trend
    }

@router.get("/geocode")
async def geocode_address(
    province: Optional[str] = None,
    district: Optional[str] = None,
    ward: Optional[str] = None,
    street: Optional[str] = None
):
    """
    Chuẩn hóa tọa độ địa lý WGS84 và định dạng địa chỉ hành chính Việt Nam
    Đảm bảo địa chỉ nhập liệu và vị trí bản đồ luôn đồng nhất 100%
    """
    from src.vietnam_admin_coords import get_real_coordinates
    lat, lng = get_real_coordinates(province, district)
    
    std_addr = spatial_service.format_standard_address(street, ward, district, province)
    return {
        "status": "success",
        "latitude": lat,
        "longitude": lng,
        "standard_address": std_addr
    }


@router.get("/reverse-geocode")
async def reverse_geocode_location(
    latitude: float,
    longitude: float
):
    """
    Truy vấn ngược địa chỉ hành chính chính xác từ tọa độ GPS WGS84
    Sử dụng PostGIS KNN trên 35,000 BĐS thực tế, tránh hoàn toàn sai lệch quận/huyện
    """
    admin_info = spatial_service.resolve_admin_location(longitude, latitude)
    std_addr = spatial_service.format_standard_address(
        admin_info.get("street_name"),
        admin_info.get("ward_name"),
        admin_info.get("district_name"),
        admin_info.get("province_name")
    )
    return {
        "status": "success",
        "province_name": admin_info.get("province_name"),
        "district_name": admin_info.get("district_name"),
        "ward_name": admin_info.get("ward_name"),
        "street_name": admin_info.get("street_name"),
        "standard_address": std_addr,
        "distance_to_nearest_m": admin_info.get("distance_to_nearest_m")
    }


@router.post("/reload-model")
async def reload_model():
    """
    HOT-RELOAD: Trigger nạp lại mô hình CatBoost thủ công.
    Gọi endpoint này sau khi train xong mà không muốn đợi auto-watcher (10s).
    """
    try:
        from datetime import datetime
        old_count = valuation_service._reload_count
        valuation_service.load_model()
        new_count = valuation_service._reload_count

        return {
            "status": "success",
            "message": "Đã nạp lại mô hình thành công!" if new_count > old_count else "Mô hình đã được nạp (có thể không có thay đổi)",
            "reload_count": valuation_service._reload_count,
            "model_mtime": valuation_service._model_mtime,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi reload mô hình: {str(e)}")


@router.get("/model-status")
async def model_status():
    """Kiểm tra trạng thái mô hình hiện tại và hot-reload watcher"""
    from datetime import datetime
    return {
        "status": "active" if valuation_service.model is not None else "inactive",
        "reload_count": valuation_service._reload_count,
        "model_mtime": valuation_service._model_mtime,
        "hot_reload_interval_seconds": 10,
        "metadata": valuation_service.metadata,
        "timestamp": datetime.now().isoformat()
    }


# In-memory POI cache
_poi_cache: Dict[str, Any] = {}

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

@router.get("/nearby-pois")
async def get_nearby_pois(
    latitude: float,
    longitude: float,
    radius: int = 1500,
    limit: int = 35
):
    """
    Truy vấn các địa điểm hành chính, thương mại, dịch vụ, khách sạn, y tế, giáo dục lân cận
    Phân loại rõ ràng cho bản đồ & thẩm định giá không gian:
    - admin: Tòa nhà hành chính, UBND, Tòa án, Công an, Cơ quan nhà nước
    - commercial: Trung tâm thương mại, Siêu thị, TTTM
    - hospitality: Khách sạn, Resort, Tổ hợp lưu trú cao cấp
    - education_health: Bệnh viện, Trường học, Đại học
    """
    import urllib.request
    import json

    cache_key = f"{round(latitude, 4)}_{round(longitude, 4)}_{radius}"
    if cache_key in _poi_cache:
        return _poi_cache[cache_key]

    pois = []
    try:
        overpass_query = f"""[out:json][timeout:6];
(
  node["amenity"~"townhall|courthouse|post_office|police|community_centre"](around:{radius},{latitude},{longitude});
  way["amenity"~"townhall|courthouse|post_office|police|community_centre"](around:{radius},{latitude},{longitude});
  
  node["shop"~"mall|supermarket|department_store"](around:{radius},{latitude},{longitude});
  way["shop"~"mall|supermarket|department_store"](around:{radius},{latitude},{longitude});
  
  node["tourism"~"hotel|guest_house|motel|resort"](around:{radius},{latitude},{longitude});
  way["tourism"~"hotel|guest_house|motel|resort"](around:{radius},{latitude},{longitude});
  
  node["amenity"~"hospital|clinic"](around:{radius},{latitude},{longitude});
  way["amenity"~"hospital|clinic"](around:{radius},{latitude},{longitude});

  node["amenity"~"school|university|college|kindergarten"](around:{radius},{latitude},{longitude});
  way["amenity"~"school|university|college|kindergarten"](around:{radius},{latitude},{longitude});

  node["railway"~"station|subway_entrance"](around:{radius},{latitude},{longitude});
  node["amenity"~"bus_station|ferry_terminal"](around:{radius},{latitude},{longitude});

  node["amenity"~"bank|atm"](around:{radius},{latitude},{longitude});

  node["leisure"~"park|garden"](around:{radius},{latitude},{longitude});
  way["leisure"~"park|garden"](around:{radius},{latitude},{longitude});

  node["amenity"~"restaurant|cafe|cinema"](around:1200,{latitude},{longitude});
);
out center {limit};
"""
        req = urllib.request.Request(
            "https://overpass-api.de/api/interpreter",
            data=overpass_query.encode('utf-8'),
            headers={"User-Agent": "MHD-AVM-SpatialService/2.0"}
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            elements = res_data.get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("name:vi") or tags.get("name:en")
                if not name:
                    continue

                p_lat = el.get("lat") or (el.get("center", {}).get("lat"))
                p_lng = el.get("lon") or (el.get("center", {}).get("lon"))
                if not p_lat or not p_lng:
                    continue

                amenity = tags.get("amenity", "")
                shop = tags.get("shop", "")
                tourism = tags.get("tourism", "")
                railway = tags.get("railway", "")
                leisure = tags.get("leisure", "")

                category = "admin"
                category_name = "Cơ quan & Tòa nhà"
                if shop in ["mall", "supermarket", "department_store"]:
                    category = "commercial"
                    category_name = "TTTM & Siêu thị"
                elif tourism in ["hotel", "guest_house", "motel", "resort"]:
                    category = "hospitality"
                    category_name = "Khách sạn & Dịch vụ"
                elif amenity in ["hospital", "clinic"]:
                    category = "health"
                    category_name = "Y tế & Bệnh viện"
                elif amenity in ["school", "university", "college", "kindergarten"]:
                    category = "education"
                    category_name = "Giáo dục & Trường học"
                elif railway or amenity in ["bus_station", "ferry_terminal"]:
                    category = "transit"
                    category_name = "Giao thông & Metro"
                elif amenity in ["bank", "atm"]:
                    category = "finance"
                    category_name = "Tài chính & Ngân hàng"
                elif leisure in ["park", "garden"]:
                    category = "green"
                    category_name = "Công viên & Cảnh quan"
                elif amenity in ["restaurant", "cafe", "cinema"]:
                    category = "lifestyle"
                    category_name = "Ẩm thực & Giải trí"

                dist = calculate_haversine_distance(latitude, longitude, p_lat, p_lng)
                pois.append({
                    "id": str(el.get("id")),
                    "name": name,
                    "category": category,
                    "category_name": category_name,
                    "type": shop or amenity or tourism or railway or leisure,
                    "lat": round(p_lat, 6),
                    "lng": round(p_lng, 6),
                    "distance_m": dist
                })
    except Exception as e:
        print(f"[CẢNH BÁO] Không thể truy vấn Overpass API: {e}")

    pois.sort(key=lambda x: x["distance_m"])
    result = {
        "status": "success",
        "total": len(pois),
        "pois": pois
    }

    if len(pois) > 0:
        _poi_cache[cache_key] = result
        if len(_poi_cache) > 200:
            _poi_cache.clear()
            _poi_cache[cache_key] = result

    return result
