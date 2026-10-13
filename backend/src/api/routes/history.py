"""
MHD Real Estate Tech - AI Valuation Model
API Route: /api/v1/history
Xem lịch sử định giá và danh sách leads khách hàng
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Request
from pydantic import BaseModel, Field
from config.settings import settings
from src.services.spatial_service import spatial_service
from psycopg2.extras import RealDictCursor
import json

router = APIRouter(prefix="/api/v1", tags=["History"])

class ConsultationLeadRequest(BaseModel):
    customer_name: Optional[str] = Field(default="Khách hàng", description="Họ và tên")
    customer_phone: str = Field(..., description="Số điện thoại liên hệ")
    consultation_need: Optional[str] = Field(default="Thẩm định chi tiết", description="Nhu cầu tư vấn")
    notes: Optional[str] = Field(default="", description="Ghi chú thêm")
    property_type: Optional[str] = Field(default="Nhà riêng", description="Loại hình BĐS")
    area: Optional[float] = Field(default=50.0, description="Diện tích")
    district_name: Optional[str] = Field(default="", description="Quận/Huyện")
    province_name: Optional[str] = Field(default="", description="Tỉnh/Thành")
    latitude: Optional[float] = Field(default=None, description="Vĩ độ")
    longitude: Optional[float] = Field(default=None, description="Kinh độ")


@router.post("/consultation")
async def create_consultation_lead(payload: ConsultationLeadRequest, request: Request):
    """
    Tiếp nhận yêu cầu tư vấn thẩm định giá chuyên sâu từ khách hàng tại tab So Sánh Giá
    Lưu vết trực tiếp vào cơ sở dữ liệu để bộ phận Thẩm định viên MHD liên hệ
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        with spatial_service.get_db_connection() as conn:
            with conn.cursor() as cur:
                geom_expr = "ST_SetSRID(ST_MakePoint(%s, %s), 4326)" if (payload.longitude and payload.latitude) else "NULL"
            
            lead_info = {
                "customer_name": payload.customer_name,
                "consultation_need": payload.consultation_need,
                "notes": payload.notes,
                "district_name": payload.district_name,
                "province_name": payload.province_name
            }
            
            query = f"""
                INSERT INTO valuation_history (
                    client_ip, customer_phone, property_type, area,
                    geom, input_payload, predicted_price, price_low, price_high,
                    confidence_score, model_version
                )
                VALUES (
                    %s, %s, %s, %s,
                    {geom_expr}, %s, %s, %s, %s,
                    %s, %s
                )
                RETURNING id, created_at;
            """
            
            params = [
                client_ip,
                payload.customer_phone,
                payload.property_type or "Nhà riêng",
                payload.area or 50.0
            ]
            if payload.longitude and payload.latitude:
                params.extend([payload.longitude, payload.latitude])
            
            params.extend([
                json.dumps(lead_info, ensure_ascii=False),
                0, 0, 0, 0.95,
                "mhd-lead-consultation"
            ])
            
            cur.execute(query, tuple(params))
            row = cur.fetchone()
            conn.commit()
            
            return {
                "status": "success",
                "message": "Đã tiếp nhận yêu cầu tư vấn thẩm định giá thành công! Chuyên viên MHD sẽ liên hệ bạn trong 15 phút.",
                "lead_id": row[0],
                "created_at": str(row[1])
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tiếp nhận tư vấn: {str(e)}")


@router.get("/history")
async def get_valuation_history(
    limit: int = Query(default=20, ge=1, le=100),
    phone: Optional[str] = None
):
    try:
        with spatial_service.get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if phone:
                    cur.execute("""
                        SELECT id, client_ip, customer_phone, property_type, area,
                               predicted_price, price_low, price_high, confidence_score,
                               model_version, created_at,
                               ST_X(geom) as longitude, ST_Y(geom) as latitude
                        FROM valuation_history
                        WHERE customer_phone = %s
                        ORDER BY created_at DESC
                        LIMIT %s;
                    """, (phone, limit))
                else:
                    cur.execute("""
                        SELECT id, client_ip, customer_phone, property_type, area,
                               predicted_price, price_low, price_high, confidence_score,
                               model_version, created_at,
                               ST_X(geom) as longitude, ST_Y(geom) as latitude
                        FROM valuation_history
                        ORDER BY created_at DESC
                        LIMIT %s;
                    """, (limit,))
                
                rows = cur.fetchall()
                return {"status": "success", "count": len(rows), "data": [dict(r) for r in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy lịch sử: {str(e)}")
