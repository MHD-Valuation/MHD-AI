# HƯỚNG DẪN DEPLOY MHD AI LÊN COOLIFY (CHUẨN PRODUCTION)

Tài liệu này hướng dẫn chi tiết cách đưa toàn bộ hệ thống **MHD Real Estate Tech (MHD AVM)** lên **Coolify** (Self-hosted PaaS) một cách trơn tru, bảo mật và tự động hóa CI/CD.

---

## 1. Cấu trúc Kiến trúc trên Coolify

Hệ thống được đóng gói thành 4 services nội bộ kết nối qua Docker bridge network:
1. **`frontend` (Cổng vào chính):** Nginx + React SPA. Cung cấp giao diện bản đồ, xử lý nén Gzip, cache tĩnh và làm Reverse Proxy định tuyến `/api/` về backend.
2. **`backend` (Dịch vụ lõi):** FastAPI chạy 4 Uvicorn workers. Tích hợp mô hình máy học **CatBoost** (`models/mhd_smart_v2.cbm`), dataset Parquet 35k BĐS, RAM cache và PostGIS Connection Pool.
3. **`postgis`:** PostgreSQL 16 + PostGIS 3.4 lưu trữ dữ liệu không gian, danh sách BĐS đối chứng và lịch sử định giá. Tự động chạy script khởi tạo `01_init_postgis.sql`.
4. **`redis`:** Redis 7 xử lý bộ đệm và lưu vết session/cache nhanh.

---

## 2. Cách 1: Deploy qua Docker Compose trên Coolify (KHUYẾN NGHỊ NHẤT)

Đây là cách đơn giản và đồng bộ nhất để chạy cả 4 services cùng lúc:

1. Đăng nhập vào giao diện **Coolify**.
2. Chọn **Projects** -> Chọn hoặc tạo một **Environment**.
3. Bấm **+ Add Resource** -> Chọn **Docker Compose**.
4. Chọn nguồn triển khai:
   - **Git Source (GitHub / GitLab):** Trỏ tới repository của bạn.
   - Tại ô **Docker Compose Location**, điền: `docker-compose.coolify.yml` (hoặc copy toàn bộ nội dung file [docker-compose.coolify.yml](file:///d:/MHD%20AI/docker-compose.coolify.yml) dán vào ô Compose Content).
5. **Cấu hình Environment Variables (Biến môi trường):**
   Mở tab **Environment Variables** trong Coolify và dán các biến từ file [.env.coolify.example](file:///d:/MHD%20AI/.env.coolify.example):
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=MatKhauBaoMatCuaBan2026!
   POSTGRES_DB=mhd_valuation
   MARKET_DISCOUNT_FACTOR=0.93
   PORT=80
   ```
6. **Cấu hình Domain (FQDN):**
   - Trong Coolify, gán domain/subdomain của bạn (ví dụ: `https://dinhgia.mhd.com.vn`) vào service **`frontend`** (cổng `80`).
   - Coolify sẽ tự động cấp phát SSL miễn phí (Let's Encrypt) qua Traefik.
7. Bấm **Deploy**.

---

## 3. Cách 2: Deploy thành từng Application riêng biệt

Nếu bạn muốn tách riêng Frontend và Backend trên Coolify:

### Service 1: Database (PostGIS)
- Chọn **+ Add Resource** -> **PostgreSQL**.
- Chọn phiên bản hoặc nhập Docker Image: `postgis/postgis:16-3.4`.
- Mount file `database/01_init_postgis.sql` vào `/docker-entrypoint-initdb.d/01_init_postgis.sql`.

### Service 2: Redis
- Chọn **+ Add Resource** -> **Redis** (chọn `redis:7-alpine`).

### Service 3: Backend (FastAPI)
- Chọn **+ Add Resource** -> **Public/Private Git Repository**.
- **Base Directory:** `/backend`
- **Build Pack:** `Dockerfile`
- **Port:** `8000`
- **Environment Variables:**
  - `POSTGRES_HOST`: IP hoặc tên service PostGIS nội bộ
  - `POSTGRES_PORT`: `5432`
  - `POSTGRES_USER`: `postgres`
  - `POSTGRES_PASSWORD`: `<mật khẩu postgis>`
  - `POSTGRES_DB`: `mhd_valuation`
  - `REDIS_HOST`: IP hoặc tên service Redis nội bộ
  - `REDIS_PORT`: `6379`
  - `MARKET_DISCOUNT_FACTOR`: `0.93`

### Service 4: Frontend (React + Nginx)
- **Base Directory:** `/frontend`
- **Build Pack:** `Dockerfile`
- **Port:** `80`
- Gán domain chính cho service này. Nginx trong container sẽ tự động proxy các request `/api/` sang backend.

---

## 4. Các điểm lưu ý quan trọng khi chạy Production

1. **File Dữ Liệu Lớn (`.parquet` & `.cbm`):**
   - File mô hình máy học `models/mhd_smart_v2.cbm` và dữ liệu `data/processed/data_mhd_clean.parquet` đã được cấu hình trong [backend/Dockerfile](file:///d:/MHD%20AI/backend/Dockerfile).
   - Hãy chắc chắn các file này đã được commit lên Git repo (không bị gitignore chặn).
2. **Khởi tạo Database PostGIS lần đầu:**
   - Khi container `postgis` chạy lần đầu tiên, file `01_init_postgis.sql` sẽ tự động tạo các bảng `real_estate_listings`, `valuation_history`, `spatial_poi_cache` và các index không gian `GIST`.
3. **Bộ nhớ RAM khuyến nghị:**
   - Server tối thiểu: **2GB RAM** (Khuyến nghị **4GB RAM** nếu phục vụ đồng thời nhiều kết nối định giá và bản đồ 35.000 điểm).
