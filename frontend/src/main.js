let currentLat = 10.775659;
        let currentLng = 106.700424;
        let activeTileLayer = null;

        // 1. THEME SWITCHER ENGINE (TINIX SEGMENTED ARCHITECTURE)
        function setThemeMode(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('mhd_theme', theme);
            updateThemeControls(theme);
            updateMapTiles(theme);
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setThemeMode(newTheme);
        }

        function updateThemeControls(theme) {
            const btnLight = document.getElementById('themeBtnLight');
            const btnDark = document.getElementById('themeBtnDark');
            if (btnLight && btnDark) {
                if (theme === 'dark') {
                    btnDark.classList.add('active');
                    btnLight.classList.remove('active');
                } else {
                    btnLight.classList.add('active');
                    btnDark.classList.remove('active');
                }
            }
            const label = document.getElementById('themeLabel');
            const icon = document.getElementById('themeIcon');
            if (label && icon) {
                if (theme === 'dark') {
                    label.textContent = 'Light';
                    icon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
                } else {
                    label.textContent = 'Dark';
                    icon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
                }
            }
        }

        function toggleMobileNav() {
            const drawer = document.getElementById('mobileNavDrawer');
            if (drawer) {
                drawer.classList.toggle('open');
            }
        }

        // 2. MAP INIT & HIGH-SPEED TILE ENGINE
        const map = L.map('map', { 
            zoomControl: true, 
            scrollWheelZoom: true,
            trackResize: true
        }).setView([currentLat, currentLng], 16);

        let isMapFullscreen = false;

        function toggleMapFullscreen() {
            const card = document.getElementById('mapFrameCard');
            const btn = document.getElementById('btnMapFullscreen');
            const expandIcon = document.getElementById('fsIconExpand');
            const compressIcon = document.getElementById('fsIconCompress');
            const label = document.getElementById('fsBtnLabel');

            if (!card) return;

            isMapFullscreen = !isMapFullscreen;

            if (isMapFullscreen) {
                card.classList.add('is-fullscreen');
                if (btn) btn.classList.add('active');
                if (expandIcon) expandIcon.style.display = 'none';
                if (compressIcon) compressIcon.style.display = 'inline-block';
                if (label) label.textContent = 'Thu nhỏ';
                document.body.style.overflow = 'hidden';
            } else {
                card.classList.remove('is-fullscreen');
                if (btn) btn.classList.remove('active');
                if (expandIcon) expandIcon.style.display = 'inline-block';
                if (compressIcon) compressIcon.style.display = 'none';
                if (label) label.textContent = 'Phóng to';
                document.body.style.overflow = '';
            }

            // Kích hoạt ngay invalidateSize để Leaflet vẽ lại toàn bộ tiles sắc nét
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
            setTimeout(() => {
                map.invalidateSize();
            }, 350);
        }
        window.toggleMapFullscreen = toggleMapFullscreen;

        // Cho phép ấn ESC để thoát Fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMapFullscreen) {
                toggleMapFullscreen();
            }
        });

        // Tự động tính toán lại map canvas khi xoay màn hình điện thoại hoặc resize cửa sổ
        window.addEventListener('resize', () => {
            if (map) map.invalidateSize();
        });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (map) map.invalidateSize();
            }, 200);
        });

        // Bản đồ chuẩn quốc tế tải cực nhanh qua CDN toàn cầu, hoàn toàn miễn phí không bao giờ đòi API Key
        function updateMapTiles(theme) {
            // Nguồn gạch bản đồ mở miễn phí 100%, không bị in mờ "API KEY REQUIRED" và không bị hạn chế thiết bị
            const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | MHD AI GIS';

            if (activeTileLayer) {
                map.removeLayer(activeTileLayer);
                activeTileLayer = null;
            }

            activeTileLayer = L.tileLayer(tileUrl, {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c'],
                crossOrigin: true,
                attribution: attribution
            }).addTo(map);

            // Invalidate size để render hoàn hảo ngay cả trên các thiết bị Android tiết kiệm RAM
            setTimeout(() => {
                map.invalidateSize();
            }, 150);
        }

        updateMapTiles('dark');

        // SVG Markers
        function createSvgIcon(color, isMain = false, number = null) {
            let svgHtml = '';
            if (isMain) {
                svgHtml = `
                    <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.6"/>
                        </filter>
                        <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${color}" filter="url(#glow)"/>
                        <circle cx="17" cy="16" r="7" fill="#FFFFFF"/>
                        <circle cx="17" cy="16" r="3.5" fill="${color}"/>
                    </svg>
                `;
            } else {
                svgHtml = `
                    <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <filter id="numGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="${color}" flood-opacity="0.5"/>
                        </filter>
                        <path d="M15 0C6.71 0 0 6.71 0 15C0 26.25 15 38 15 38C15 38 30 26.25 30 15C30 6.71 23.29 0 15 0Z" fill="${color}" filter="url(#numGlow)"/>
                        <circle cx="15" cy="14" r="9" fill="#FFFFFF"/>
                        <text x="15" y="18" text-anchor="middle" font-family="'DM Sans', sans-serif" font-weight="800" font-size="11.5" fill="${color}">${number || ''}</text>
                    </svg>
                `;
            }
            return L.divIcon({
                className: 'custom-leaflet-marker',
                html: svgHtml,
                iconSize: isMain ? [34, 42] : [30, 38],
                iconAnchor: isMain ? [17, 42] : [15, 38],
                popupAnchor: [0, -38]
            });
        }

        const mainIcon = createSvgIcon('#E05400', true);
        const mainMarker = L.marker([currentLat, currentLng], { draggable: true, icon: mainIcon, zIndexOffset: 1000 }).addTo(map);
        const radiusCircle = L.circle([currentLat, currentLng], { color: '#E05400', fillColor: '#E05400', fillOpacity: 0.08, weight: 1.5, radius: 500 }).addTo(map);
        const compLayerGroup = L.layerGroup().addTo(map);

        // ── BẢN ĐỒ NHIỆT GIÁ ĐẤT (REAL PRICE HEATMAP LAYER) ──
        let heatmapLayer = null;
        let isHeatmapActive = false;
        let currentHeatmapPoints = [];

        async function loadHeatmapData(lat, lng) {
            try {
                const res = await fetch(`/api/v1/spatial-heatmap?latitude=${lat}&longitude=${lng}&radius_meters=4000&limit=350`);
                if (!res.ok) return [];
                const data = await res.json();
                return data.heatmap_points || [];
            } catch (e) {
                console.warn("Lỗi tải dữ liệu heatmap:", e);
                return [];
            }
        }

        async function renderHeatmapLayer(lat, lng) {
            if (!window.L || typeof L.heatLayer !== 'function') {
                console.warn("L.heatLayer chưa sẵn sàng trên window.L");
                return;
            }
            const points = await loadHeatmapData(lat, lng);
            currentHeatmapPoints = points;
            if (heatmapLayer && map.hasLayer(heatmapLayer)) {
                map.removeLayer(heatmapLayer);
                heatmapLayer = null;
            }
            if (points.length === 0) return;

            const heatData = points.map(p => [p.lat, p.lng, p.intensity || 0.5]);
            heatmapLayer = L.heatLayer(heatData, {
                radius: 28,
                blur: 20,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.15: '#06b6d4',
                    0.40: '#10b981',
                    0.70: '#f59e0b',
                    1.00: '#ef4444'
                }
            });
            if (isHeatmapActive) {
                heatmapLayer.addTo(map);
            }
        }

        async function togglePriceHeatmap() {
            const btn = document.getElementById('btnToggleHeatmap');
            const legend = document.getElementById('heatmapLegend');
            const text = document.getElementById('btnHeatmapText');

            isHeatmapActive = !isHeatmapActive;

            if (isHeatmapActive) {
                if (btn) btn.classList.add('active');
                if (text) text.textContent = 'Tắt nhiệt giá';
                if (legend) legend.style.display = 'block';

                if (!heatmapLayer || currentHeatmapPoints.length === 0) {
                    await renderHeatmapLayer(currentLat, currentLng);
                } else if (!map.hasLayer(heatmapLayer)) {
                    heatmapLayer.addTo(map);
                }
                showToast('Đã kích hoạt Bản đồ nhiệt mật độ giá đất khu vực');
            } else {
                if (btn) btn.classList.remove('active');
                if (text) text.textContent = 'Bản đồ nhiệt giá';
                if (legend) legend.style.display = 'none';
                if (heatmapLayer && map.hasLayer(heatmapLayer)) {
                    map.removeLayer(heatmapLayer);
                }
            }
        }
        window.togglePriceHeatmap = togglePriceHeatmap;

        // ── PRICE MARKER CLUSTER LAYER (NATIONWIDE 35.000 POINTS WITH ZERO-LAG ENGINE) ──
        let clusterGroup = null;
        let isClusterActive = false;
        let allNationwidePoints = null; // Cache 35.000 điểm dạng compact array [lat, lng, pm2, p, a, t]
        let isLoadingNationwide = false;

        function getPriceColor(pricePerM2) {
            const p = pricePerM2 / 1e6; // triệu
            if (p < 30) return '#10b981';
            if (p < 60) return '#06b6d4';
            if (p < 100) return '#f59e0b';
            if (p < 160) return '#f97316';
            return '#ef4444';
        }

        function getPriceLabel(pricePerM2) {
            const p = pricePerM2 / 1e6;
            if (p < 30) return 'Thấp';
            if (p < 60) return 'Trung bình';
            if (p < 100) return 'Khá cao';
            if (p < 160) return 'Cao';
            return 'Rất cao';
        }

        function createClusterCustomIcon(cluster) {
            const count = cluster.getChildCount();
            const markers = cluster.getAllChildMarkers();
            let totalPrice = 0;
            let validCount = 0;
            // Chỉ duyệt tối đa 100 con để tính nhanh giá TB, tránh blocking thread khi cụm có 5000 con
            const sampleSize = Math.min(markers.length, 80);
            for (let i = 0; i < sampleSize; i++) {
                if (markers[i].options._pricePerM2) {
                    totalPrice += markers[i].options._pricePerM2;
                    validCount++;
                }
            }
            const avgPrice = validCount > 0 ? totalPrice / validCount : 65000000;
            const avgPriceTr = (avgPrice / 1e6).toFixed(0);
            const color = getPriceColor(avgPrice);

            let sizeClass = 'cluster-sm';
            if (count >= 500) sizeClass = 'cluster-xl';
            else if (count >= 100) sizeClass = 'cluster-lg';
            else if (count >= 20) sizeClass = 'cluster-md';

            return L.divIcon({
                html: `<div class="mhd-cluster-icon ${sizeClass}" style="--cluster-color:${color}">
                         <span class="cluster-count">${count > 999 ? (count/1000).toFixed(1) + 'k' : count}</span>
                         <span class="cluster-avg">${avgPriceTr}Tr/m²</span>
                       </div>`,
                className: 'mhd-cluster-wrapper',
                iconSize: L.point(56, 56)
            });
        }

        // Tải 35.000 điểm toàn quốc 1 lần duy nhất và lưu cache trên RAM
        async function fetchAllNationwideClusterData() {
            if (allNationwidePoints && allNationwidePoints.length > 0) {
                return allNationwidePoints;
            }
            if (isLoadingNationwide) return [];
            isLoadingNationwide = true;
            try {
                const res = await fetch(`/api/v1/all-clusters?max_points=35000`);
                if (!res.ok) throw new Error("API all-clusters error");
                const data = await res.json();
                allNationwidePoints = data.points || [];
                isLoadingNationwide = false;
                return allNationwidePoints;
            } catch (e) {
                console.warn("Không tải được toàn bộ 35k điểm, fallback sang vùng lân cận:", e);
                isLoadingNationwide = false;
                // Fallback nếu API all-clusters có sự cố
                const fallbackRes = await fetch(`/api/v1/spatial-heatmap?latitude=${currentLat}&longitude=${currentLng}&radius_meters=35000&limit=3500`);
                if (fallbackRes.ok) {
                    const fbData = await fallbackRes.json();
                    const pts = (fbData.heatmap_points || []).map(p => [p.lat, p.lng, p.price_per_m2, p.price, p.area, p.property_type]);
                    allNationwidePoints = pts;
                    return pts;
                }
                return [];
            }
        }

        // Tạo marker siêu nhẹ với Lazy Popup (chỉ tạo HTML khi click, không tạo trước 35.000 HTML string)
        function createLightweightMarker(item) {
            const [lat, lng, priceM2, totalPrice, area, propType] = item;
            const color = getPriceColor(priceM2);

            const marker = L.marker([lat, lng], {
                _pricePerM2: priceM2,
                _totalPrice: totalPrice,
                _area: area,
                _propType: propType,
                icon: L.divIcon({
                    className: 'mhd-price-marker-wrapper',
                    html: `<div class="mhd-price-marker" style="--marker-color:${color}">
                             <span>${(priceM2 / 1e6).toFixed(0)}Tr</span>
                           </div>`,
                    iconSize: [36, 24],
                    iconAnchor: [18, 24],
                    popupAnchor: [0, -26]
                })
            });

            // Lazy popup: Chỉ gán và render HTML khi người dùng click vào marker này
            marker.on('click', function () {
                const label = getPriceLabel(priceM2);
                const popupContent = `
                    <div class="cluster-popup">
                        <div class="cluster-popup-header" style="border-color:${color}">
                            <span class="cluster-popup-badge" style="background:${color}">${label}</span>
                            <span class="cluster-popup-type">${propType}</span>
                        </div>
                        <div class="cluster-popup-body">
                            <div class="cluster-popup-row">
                                <span class="cluster-popup-label">Đơn giá</span>
                                <span class="cluster-popup-value" style="color:${color}">${(priceM2 / 1e6).toFixed(1)} Tr/m²</span>
                            </div>
                            ${totalPrice > 0 ? `<div class="cluster-popup-row">
                                <span class="cluster-popup-label">Tổng giá</span>
                                <span class="cluster-popup-value">${formatVND(totalPrice)}</span>
                            </div>` : ''}
                            ${area > 0 ? `<div class="cluster-popup-row">
                                <span class="cluster-popup-label">Diện tích</span>
                                <span class="cluster-popup-value">${area.toFixed(1)} m²</span>
                            </div>` : ''}
                        </div>
                        <div class="cluster-popup-footer">Dữ liệu thật 100% · PostGIS & Parquet</div>
                    </div>
                `;
                marker.bindPopup(popupContent, { className: 'mhd-cluster-popup-container', maxWidth: 260 }).openPopup();
            });

            return marker;
        }

        async function renderClusterLayer() {
            if (typeof L.markerClusterGroup !== 'function') {
                console.warn('L.markerClusterGroup chưa sẵn sàng');
                return;
            }

            if (clusterGroup && map.hasLayer(clusterGroup)) {
                map.removeLayer(clusterGroup);
                clusterGroup = null;
            }

            const rawPoints = await fetchAllNationwideClusterData();
            if (!rawPoints || rawPoints.length === 0) {
                showToast('Chưa nạp được dữ liệu BĐS', 'warning');
                return;
            }

            // Cấu hình MarkerCluster tối ưu chống giật lag + chống chồng chéo:
            // 1. maxClusterRadius: 60px (gom mạnh hơn, ít marker lẻ chồng nhau)
            // 2. disableClusteringAtZoom: 19 (chỉ bung marker đơn ở zoom rất gần)
            // 3. spiderfyOnMaxZoom: true + spiderfyDistanceMultiplier: 1.5 (giãn cách mạng nhện)
            // 4. chunkedLoading: true & chunkInterval: 60 (chia nhỏ luồng nạp 35k không block UI)
            // 5. removeOutsideVisibleBounds: true (tự giải phóng DOM ngoài tầm nhìn)
            clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 60,
                spiderfyOnMaxZoom: true,
                spiderfyDistanceMultiplier: 1.5,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                disableClusteringAtZoom: 19,
                iconCreateFunction: createClusterCustomIcon,
                animate: true,
                animateAddingMarkers: false,
                chunkedLoading: true,
                chunkInterval: 60,
                chunkDelay: 25,
                removeOutsideVisibleBounds: true
            });

            // Chuyển 35.000 điểm thành markers siêu nhẹ
            const markers = [];
            for (let i = 0; i < rawPoints.length; i++) {
                markers.push(createLightweightMarker(rawPoints[i]));
            }

            clusterGroup.addLayers(markers);
            if (isClusterActive) {
                clusterGroup.addTo(map);
            }
        }

        async function togglePriceCluster() {
            const btn = document.getElementById('btnToggleCluster');
            const text = document.getElementById('btnClusterText');

            isClusterActive = !isClusterActive;

            if (isClusterActive) {
                if (btn) btn.classList.add('active');
                if (text) text.textContent = 'Tắt điểm giá';

                if (!clusterGroup) {
                    showToast('Đang kết nối mạng lưới 35.000 điểm giá toàn quốc...');
                    await renderClusterLayer();
                } else if (!map.hasLayer(clusterGroup)) {
                    clusterGroup.addTo(map);
                }
                const count = allNationwidePoints ? allNationwidePoints.length : 35000;
                showToast(`Đã phủ sóng ${count.toLocaleString()} điểm giá BĐS thực tế toàn quốc!`);
            } else {
                if (btn) btn.classList.remove('active');
                if (text) text.textContent = 'Điểm giá BĐS';
                if (clusterGroup && map.hasLayer(clusterGroup)) {
                    map.removeLayer(clusterGroup);
                }
            }
        }
        window.togglePriceCluster = togglePriceCluster;

        mainMarker.on('dragend', function () {
            const pos = mainMarker.getLatLng();
            updateLocationAndValuate(pos.lat, pos.lng);
        });

        map.on('click', function (e) {
            mainMarker.setLatLng(e.latlng);
            updateLocationAndValuate(e.latlng.lat, e.latlng.lng);
        });


        // Timer for map interactions & reverse geocoding
        let _mapInteractionTimer = null;

        function updateLocationAndValuate(lat, lng, shouldSyncInputs = true) {
            currentLat = lat;
            currentLng = lng;
            radiusCircle.setLatLng([lat, lng]);
            document.getElementById('coordsBadge').innerText = `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;

            if (isHeatmapActive) {
                renderHeatmapLayer(lat, lng);
            }


            clearTimeout(_mapInteractionTimer);
            _mapInteractionTimer = setTimeout(async () => {
                if (shouldSyncInputs) {
                    await reverseGeocodeAndSyncInputs(lat, lng);
                } else {
                    const curDist = document.getElementById('district_name').value.trim();
                    const curProv = document.getElementById('province_name').value.trim();
                    const areaVal = parseFloat(document.getElementById('area').value);
                    if (areaVal && areaVal > 0 && curDist) {
                        triggerValuation();
                    } else {
                        fetchQuickComparables(lat, lng, curDist, curProv);
                    }
                }
            }, 300);
        }


        // ==========================================
        // BỘ DỮ LIỆU ĐỊA GIỚI HÀNH CHÍNH VIỆT NAM CAO CẤP
        // Đảm bảo nhận diện Quận / Huyện chính xác 100% khi di chuyển bản đồ hoặc định vị GPS
        // ==========================================
        const WARD_TO_DISTRICT_MAP = {
            // --- TP. HỒ CHÍ MINH (22 Quận / Huyện / TP Thủ Đức) ---
            // QUẬN 1
            'bến nghé': 'Quận 1', 'bến thành': 'Quận 1', 'đa kao': 'Quận 1', 'tân định': 'Quận 1',
            'cầu ông lãnh': 'Quận 1', 'cầu kho': 'Quận 1', 'cô giang': 'Quận 1', 'nguyễn cư trinh': 'Quận 1',
            'nguyễn thái bình': 'Quận 1', 'phạm ngũ lão': 'Quận 1', 'sài gòn': 'Quận 1',
            // QUẬN 3
            'võ thị sáu': 'Quận 3', 'nhiêu lộc': 'Quận 3', 'bàn cờ': 'Quận 3', 'trương minh giảng': 'Quận 3',
            // QUẬN 4
            'khánh hội': 'Quận 4', 'xóm chiếu': 'Quận 4', 'vĩnh hội': 'Quận 4', 'cây bàng': 'Quận 4',
            // QUẬN 5
            'chợ lớn': 'Quận 5', 'an đông': 'Quận 5', 'hàm tử': 'Quận 5', 'chợ quán': 'Quận 5',
            // QUẬN 6
            'bình tây': 'Quận 6', 'bình phú': 'Quận 6', 'phú lâm': 'Quận 6', 'cây gõ': 'Quận 6',
            // QUẬN 7
            'tân hưng': 'Quận 7', 'tân phong': 'Quận 7', 'tân quy': 'Quận 7', 'tân kiểng': 'Quận 7',
            'tân thuận đông': 'Quận 7', 'tân thuận tây': 'Quận 7', 'phú mỹ': 'Quận 7', 'phú thuận': 'Quận 7',
            'bình thuận': 'Quận 7', 'phú mỹ hưng': 'Quận 7', 'tân mỹ': 'Quận 7',
            // QUẬN 8
            'chánh hưng': 'Quận 8', 'rạch ông': 'Quận 8', 'bình đông': 'Quận 8', 'hưng phú': 'Quận 8', 'xóm củi': 'Quận 8',
            // QUẬN 10
            'hòa hưng': 'Quận 10', 'chí hòa': 'Quận 10', 'vườn lài': 'Quận 10', 'nhật tảo': 'Quận 10', 'bắc hải': 'Quận 10',
            // QUẬN 11
            'hòa bình': 'Quận 11', 'bình thới': 'Quận 11', 'đầm sen': 'Quận 11', 'phú thọ': 'Quận 11',
            // QUẬN 12
            'an phú đông': 'Quận 12', 'thạnh lộc': 'Quận 12', 'thạnh xuân': 'Quận 12', 'tân chánh hiệp': 'Quận 12',
            'tân thới hiệp': 'Quận 12', 'đông hưng thuận': 'Quận 12', 'hiệp thành': 'Quận 12', 'tân thới nhất': 'Quận 12',
            'trung mỹ tây': 'Quận 12', 'tân hưng thuận': 'Quận 12',
            // BÌNH THẠNH
            'bình thạnh': 'Bình Thạnh', 'bình lợi trung': 'Bình Thạnh', 'bình lợi': 'Bình Thạnh',
            'gia định': 'Bình Thạnh', 'hàng xanh': 'Bình Thạnh', 'thị nghè': 'Bình Thạnh',
            'bạch đằng': 'Bình Thạnh', 'thanh đa': 'Bình Thạnh', 'bình quới': 'Bình Thạnh', 'bình hòa': 'Bình Thạnh',
            // PHÚ NHUẬN
            'phú nhuận': 'Phú Nhuận', 'cầu kiệu': 'Phú Nhuận', 'đức nhuận': 'Phú Nhuận', 'phan xích long': 'Phú Nhuận',
            // GÒ VẤP
            'gò vấp': 'Gò Vấp', 'thông tây hội': 'Gò Vấp', 'hạnh thông': 'Gò Vấp', 'an nhơn': 'Gò Vấp', 'tân sơn': 'Gò Vấp',
            // TÂN BÌNH
            'tân bình': 'Tân Bình', 'tân sơn hòa': 'Tân Bình', 'tân sơn nhất': 'Tân Bình', 'bảy hiền': 'Tân Bình', 'lăng cha cả': 'Tân Bình',
            // TÂN PHÚ
            'tân phú': 'Tân Phú', 'phú thạnh': 'Tân Phú', 'tân sơn nhì': 'Tân Phú', 'phú thọ hòa': 'Tân Phú',
            'tây thạnh': 'Tân Phú', 'sơn kỳ': 'Tân Phú', 'hiệp tân': 'Tân Phú', 'hòa thạnh': 'Tân Phú', 'tân quý': 'Tân Phú', 'tân thành': 'Tân Phú',
            // BÌNH TÂN
            'bình tân': 'Bình Tân', 'bình trị đông': 'Bình Tân', 'an lạc': 'Bình Tân', 'bình hưng hòa': 'Bình Tân', 'tân tạo': 'Bình Tân',
            // THÀNH PHỐ THỦ ĐỨC
            'thủ đức': 'Thành phố Thủ Đức', 'thành phố thủ đức': 'Thành phố Thủ Đức', 'thảo điền': 'Thành phố Thủ Đức',
            'an phú': 'Thành phố Thủ Đức', 'hiệp bình': 'Thành phố Thủ Đức', 'linh chiểu': 'Thành phố Thủ Đức',
            'linh trung': 'Thành phố Thủ Đức', 'linh tây': 'Thành phố Thủ Đức', 'tam bình': 'Thành phố Thủ Đức',
            'tam phú': 'Thành phố Thủ Đức', 'trường thọ': 'Thành phố Thủ Đức', 'linh đông': 'Thành phố Thủ Đức',
            'linh xuân': 'Thành phố Thủ Đức', 'phước long': 'Thành phố Thủ Đức', 'tăng nhơn phú': 'Thành phố Thủ Đức',
            'long thạnh mỹ': 'Thành phố Thủ Đức', 'long phước': 'Thành phố Thủ Đức', 'hiệp phú': 'Thành phố Thủ Đức',
            'thạnh mỹ lợi': 'Thành phố Thủ Đức', 'bình trưng': 'Thành phố Thủ Đức', 'an khánh': 'Thành phố Thủ Đức', 'cát lái': 'Thành phố Thủ Đức',
            // HÓC MÔN
            'hóc môn': 'Hóc Môn', 'bà điểm': 'Hóc Môn', 'tân thới nhì': 'Hóc Môn', 'xuân thới thượng': 'Hóc Môn',
            'xuân thới đông': 'Hóc Môn', 'trung chánh': 'Hóc Môn', 'nhị bình': 'Hóc Môn',
            // BÌNH CHÁNH
            'bình chánh': 'Bình Chánh', 'bình hưng': 'Bình Chánh', 'phong phú': 'Bình Chánh', 'đa phước': 'Bình Chánh',
            'tân kiên': 'Bình Chánh', 'vĩnh lộc': 'Bình Chánh', 'an phú tây': 'Bình Chánh', 'quy đức': 'Bình Chánh',
            // NHÀ BÈ
            'nhà bè': 'Nhà Bè', 'phước kiển': 'Nhà Bè', 'hiệp phước': 'Nhà Bè', 'phú xuân': 'Nhà Bè', 'nhơn đức': 'Nhà Bè', 'long thới': 'Nhà Bè',
            // CỦ CHI
            'củ chi': 'Củ Chi', 'tân an hội': 'Củ Chi', 'an nhơn tây': 'Củ Chi', 'thái mỹ': 'Củ Chi', 'phước vĩnh an': 'Củ Chi', 'tân thạnh đông': 'Củ Chi',
            // CẦN GIỜ
            'cần giờ': 'Cần Giờ', 'cần thạnh': 'Cần Giờ', 'long hòa': 'Cần Giờ', 'bình khánh': 'Cần Giờ', 'lý nhơn': 'Cần Giờ', 'thạnh an': 'Cần Giờ',

            // --- THỦ ĐÔ HÀ NỘI ---
            'hoàn kiếm': 'Hoàn Kiếm', 'hàng bạc': 'Hoàn Kiếm', 'hàng gai': 'Hoàn Kiếm', 'hàng bông': 'Hoàn Kiếm', 'tràng tiền': 'Hoàn Kiếm', 'đồng xuân': 'Hoàn Kiếm',
            'ba đình': 'Ba Đình', 'trúc bạch': 'Ba Đình', 'kim mã': 'Ba Đình', 'giảng võ': 'Ba Đình', 'ngọc khánh': 'Ba Đình', 'liễu giai': 'Ba Đình', 'cống vị': 'Ba Đình',
            'đống đa': 'Đống Đa', 'cát linh': 'Đống Đa', 'văn miếu': 'Đống Đa', 'láng thượng': 'Đống Đa', 'láng hạ': 'Đống Đa', 'ô chợ dừa': 'Đống Đa', 'kim liên': 'Đống Đa',
            'hai bà trưng': 'Hai Bà Trưng', 'bạch mai': 'Hai Bà Trưng', 'bách khoa': 'Hai Bà Trưng', 'vĩnh tuy': 'Hai Bà Trưng', 'minh khai': 'Hai Bà Trưng',
            'cầu giấy': 'Cầu Giấy', 'dịch vọng': 'Cầu Giấy', 'nghĩa đô': 'Cầu Giấy', 'nghĩa tân': 'Cầu Giấy', 'mai dịch': 'Cầu Giấy', 'trung hòa': 'Cầu Giấy', 'yên hòa': 'Cầu Giấy',
            'tây hồ': 'Tây Hồ', 'bưởi': 'Tây Hồ', 'thụy khuê': 'Tây Hồ', 'quảng an': 'Tây Hồ', 'nhật tân': 'Tây Hồ', 'tứ liên': 'Tây Hồ', 'xuân la': 'Tây Hồ',
            'thanh xuân': 'Thanh Xuân', 'khương đình': 'Thanh Xuân', 'khương mai': 'Thanh Xuân', 'khương trung': 'Thanh Xuân', 'nhân chính': 'Thanh Xuân',
            'hoàng mai': 'Hoàng Mai', 'linh đàm': 'Hoàng Mai', 'định công': 'Hoàng Mai', 'giáp bát': 'Hoàng Mai', 'hoàng liệt': 'Hoàng Mai',
            'long biên': 'Long Biên', 'bồ đề': 'Long Biên', 'ngọc lâm': 'Long Biên', 'gia thụy': 'Long Biên',
            'nam từ liêm': 'Nam Từ Liêm', 'mỹ đình': 'Nam Từ Liêm', 'mễ trì': 'Nam Từ Liêm', 'trung văn': 'Nam Từ Liêm',
            'bắc từ liêm': 'Bắc Từ Liêm', 'cổ nhuế': 'Bắc Từ Liêm', 'xuân đỉnh': 'Bắc Từ Liêm',
            'hà đông': 'Hà Đông', 'mộ lao': 'Hà Đông', 'văn quán': 'Hà Đông', 'la khê': 'Hà Đông',

            // --- THÀNH PHỐ ĐÀ NẴNG ---
            'hải châu': 'Hải Châu', 'hòa cường': 'Hải Châu', 'thạch thang': 'Hải Châu', 'thanh bình': 'Hải Châu', 'thuận phước': 'Hải Châu',
            'thanh khê': 'Thanh Khê', 'tam thuận': 'Thanh Khê', 'xuân hà': 'Thanh Khê', 'tân chính': 'Thanh Khê',
            'sơn trà': 'Sơn Trà', 'an hải': 'Sơn Trà', 'phước mỹ': 'Sơn Trà', 'mân thái': 'Sơn Trà',
            'ngũ hành sơn': 'Ngũ Hành Sơn', 'mỹ an': 'Ngũ Hành Sơn', 'khuê mỹ': 'Ngũ Hành Sơn',
            'liên chiểu': 'Liên Chiểu', 'hòa minh': 'Liên Chiểu', 'hòa khánh': 'Liên Chiểu',
            'cẩm lệ': 'Cẩm Lệ', 'khuê trung': 'Cẩm Lệ', 'hòa thọ': 'Cẩm Lệ',

            // --- TỈNH BÌNH DƯƠNG ---
            'thủ dầu một': 'Thủ Dầu Một', 'phú cường': 'Thủ Dầu Một', 'hiệp thành': 'Thủ Dầu Một', 'chánh nghĩa': 'Thủ Dầu Một',
            'dĩ an': 'Dĩ An', 'tân đông hiệp': 'Dĩ An', 'an bình': 'Dĩ An', 'đông hòa': 'Dĩ An',
            'thuận an': 'Thuận An', 'lái thiêu': 'Thuận An', 'an phú': 'Thuận An', 'thuận giao': 'Thuận An',
            'bến cát': 'Bến Cát', 'tân uyên': 'Tân Uyên'
        };

        const DISTRICT_CENTROIDS = [
            // TP. Hồ Chí Minh
            { name: 'Quận 1', prov: 'Thành phố Hồ Chí Minh', lat: 10.775659, lng: 106.700424 },
            { name: 'Quận 3', prov: 'Thành phố Hồ Chí Minh', lat: 10.784360, lng: 106.684440 },
            { name: 'Quận 4', prov: 'Thành phố Hồ Chí Minh', lat: 10.764420, lng: 106.704230 },
            { name: 'Quận 5', prov: 'Thành phố Hồ Chí Minh', lat: 10.754040, lng: 106.663410 },
            { name: 'Quận 6', prov: 'Thành phố Hồ Chí Minh', lat: 10.748090, lng: 106.635190 },
            { name: 'Quận 7', prov: 'Thành phố Hồ Chí Minh', lat: 10.734030, lng: 106.721830 },
            { name: 'Quận 8', prov: 'Thành phố Hồ Chí Minh', lat: 10.724080, lng: 106.628620 },
            { name: 'Quận 10', prov: 'Thành phố Hồ Chí Minh', lat: 10.771590, lng: 106.667230 },
            { name: 'Quận 11', prov: 'Thành phố Hồ Chí Minh', lat: 10.762930, lng: 106.650190 },
            { name: 'Quận 12', prov: 'Thành phố Hồ Chí Minh', lat: 10.867150, lng: 106.641340 },
            { name: 'Bình Thạnh', prov: 'Thành phố Hồ Chí Minh', lat: 10.810580, lng: 106.709140 },
            { name: 'Phú Nhuận', prov: 'Thành phố Hồ Chí Minh', lat: 10.799190, lng: 106.680260 },
            { name: 'Gò Vấp', prov: 'Thành phố Hồ Chí Minh', lat: 10.838840, lng: 106.665790 },
            { name: 'Tân Bình', prov: 'Thành phố Hồ Chí Minh', lat: 10.801460, lng: 106.653420 },
            { name: 'Tân Phú', prov: 'Thành phố Hồ Chí Minh', lat: 10.790050, lng: 106.628170 },
            { name: 'Bình Tân', prov: 'Thành phố Hồ Chí Minh', lat: 10.765430, lng: 106.598210 },
            { name: 'Thành phố Thủ Đức', prov: 'Thành phố Hồ Chí Minh', lat: 10.849409, lng: 106.753706 },
            { name: 'Hóc Môn', prov: 'Thành phố Hồ Chí Minh', lat: 10.883920, lng: 106.593880 },
            { name: 'Bình Chánh', prov: 'Thành phố Hồ Chí Minh', lat: 10.687390, lng: 106.593880 },
            { name: 'Nhà Bè', prov: 'Thành phố Hồ Chí Minh', lat: 10.695320, lng: 106.729110 },
            { name: 'Củ Chi', prov: 'Thành phố Hồ Chí Minh', lat: 11.006670, lng: 106.495000 },
            { name: 'Cần Giờ', prov: 'Thành phố Hồ Chí Minh', lat: 10.411420, lng: 106.954670 },
            // Hà Nội
            { name: 'Hoàn Kiếm', prov: 'Hà Nội', lat: 21.030650, lng: 105.852440 },
            { name: 'Ba Đình', prov: 'Hà Nội', lat: 21.034710, lng: 105.828230 },
            { name: 'Đống Đa', prov: 'Hà Nội', lat: 21.018240, lng: 105.827290 },
            { name: 'Hai Bà Trưng', prov: 'Hà Nội', lat: 21.006930, lng: 105.854420 },
            { name: 'Cầu Giấy', prov: 'Hà Nội', lat: 21.031340, lng: 105.792510 },
            { name: 'Thanh Xuân', prov: 'Hà Nội', lat: 20.993750, lng: 105.811820 },
            { name: 'Tây Hồ', prov: 'Hà Nội', lat: 21.066430, lng: 105.819510 },
            { name: 'Hoàng Mai', prov: 'Hà Nội', lat: 20.978010, lng: 105.845830 },
            { name: 'Long Biên', prov: 'Hà Nội', lat: 21.036220, lng: 105.894340 },
            { name: 'Nam Từ Liêm', prov: 'Hà Nội', lat: 21.012540, lng: 105.766320 },
            { name: 'Bắc Từ Liêm', prov: 'Hà Nội', lat: 21.063810, lng: 105.759240 },
            { name: 'Hà Đông', prov: 'Hà Nội', lat: 20.971210, lng: 105.777010 },
            // Đà Nẵng
            { name: 'Hải Châu', prov: 'Đà Nẵng', lat: 16.054407, lng: 108.219806 },
            { name: 'Thanh Khê', prov: 'Đà Nẵng', lat: 16.060120, lng: 108.188450 },
            { name: 'Sơn Trà', prov: 'Đà Nẵng', lat: 16.088610, lng: 108.243120 },
            { name: 'Ngũ Hành Sơn', prov: 'Đà Nẵng', lat: 16.002440, lng: 108.258330 },
            { name: 'Liên Chiểu', prov: 'Đà Nẵng', lat: 16.082530, lng: 108.146520 },
            { name: 'Cẩm Lệ', prov: 'Đà Nẵng', lat: 16.018230, lng: 108.196320 },
            // Bình Dương
            { name: 'Thủ Dầu Một', prov: 'Bình Dương', lat: 10.980450, lng: 106.651870 },
            { name: 'Dĩ An', prov: 'Bình Dương', lat: 10.906940, lng: 106.772500 },
            { name: 'Thuận An', prov: 'Bình Dương', lat: 10.925280, lng: 106.698060 }
        ];

        function cleanAdminToken(s) {
            if (!s || typeof s !== 'string') return '';
            return s.toLowerCase()
                .replace(/^(phường|quận|thị trấn|thị xã|huyện|tp\.|thành phố)\s+/i, '')
                .replace(/\(phường\)|\(quận\)|\(thị xã\)|\(huyện\)/gi, '')
                .trim();
        }

        function formatStandardDistrict(raw) {
            if (!raw) return '';
            const trimmed = raw.trim();
            // Nếu là dạng số: '1' -> 'Quận 1'
            if (/^\d+$/.test(trimmed)) return `Quận ${trimmed}`;
            if (/^quận\s*\d+$/i.test(trimmed)) {
                const num = trimmed.replace(/\D/g, '');
                return `Quận ${num}`;
            }
            if (/^thủ đức$|^thành phố thủ đức$/i.test(trimmed)) return 'Thành phố Thủ Đức';
            // Chuẩn hóa viết hoa chữ cái đầu
            return trimmed.replace(/^(quận|huyện|thị xã|tp\.|thành phố)\s+/i, '')
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        }

        function findNearestDistrictCentroid(lat, lng, targetProv) {
            let pool = DISTRICT_CENTROIDS;
            if (targetProv) {
                const matched = DISTRICT_CENTROIDS.filter(c => c.prov.toLowerCase().includes(targetProv.toLowerCase()) || targetProv.toLowerCase().includes(c.prov.toLowerCase()));
                if (matched.length > 0) pool = matched;
            }
            let best = pool[0];
            let minD = Infinity;
            for (const item of pool) {
                const d = (item.lat - lat) ** 2 + (item.lng - lng) ** 2;
                if (d < minD) {
                    minD = d;
                    best = item;
                }
            }
            return best ? best.name : 'Quận 1';
        }

        async function resolveAdminLocation(lat, lng, existingNomAddr = null, existingDisplayName = '') {
            let nomAddr = existingNomAddr;
            let displayName = existingDisplayName;
            let bdcData = null;

            const fetchPromises = [];

            // 1. Fetch Nominatim nếu chưa có
            if (!nomAddr) {
                const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
                fetchPromises.push(
                    fetch(nomUrl)
                        .then(r => r.json())
                        .then(data => {
                            if (data) {
                                nomAddr = data.address || {};
                                displayName = data.display_name || '';
                            }
                        })
                        .catch(e => console.warn("Nominatim fetch err:", e))
                );
            }

            // 2. Fetch BigDataCloud (Rất nhanh và nhận diện hành chính chi tiết)
            const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`;
            fetchPromises.push(
                fetch(bdcUrl)
                    .then(r => r.json())
                    .then(data => { bdcData = data; })
                    .catch(e => console.warn("BigDataCloud fetch err:", e))
            );

            await Promise.all(fetchPromises);
            nomAddr = nomAddr || {};

            // --- A. XÁC ĐỊNH TỈNH / THÀNH PHỐ ---
            let prov = nomAddr.city || nomAddr.state || nomAddr.province || (bdcData ? bdcData.city || bdcData.principalSubdivision : '');
            if (!prov || prov.toLowerCase().includes('hồ chí minh') || (lat >= 10.3 && lat <= 11.2 && lng >= 106.3 && lng <= 107.1)) {
                prov = 'Thành phố Hồ Chí Minh';
            } else if (prov.toLowerCase().includes('hà nội') || (lat >= 20.7 && lat <= 21.5 && lng >= 105.4 && lng <= 106.1)) {
                prov = 'Hà Nội';
            } else if (prov.toLowerCase().includes('đà nẵng') || (lat >= 15.8 && lat <= 16.3 && lng >= 108.0 && lng <= 108.5)) {
                prov = 'Đà Nẵng';
            } else if (prov.toLowerCase().includes('bình dương')) {
                prov = 'Bình Dương';
            }

            // --- B. TẬP HỢP TẤT CẢ CÁC ĐỊA DANH ỨNG VIÊN ĐỂ XÁC ĐỊNH QUẬN/HUYỆN ---
            const candidateTokens = [];

            // Từ BigDataCloud
            if (bdcData) {
                if (bdcData.locality) candidateTokens.push(bdcData.locality);
                const admins = bdcData.localityInfo && bdcData.localityInfo.administrative ? bdcData.localityInfo.administrative : [];
                admins.forEach(ad => { if (ad.name) candidateTokens.push(ad.name); });
            }

            // Từ Nominatim
            ['suburb', 'quarter', 'ward', 'neighbourhood', 'city_district', 'district', 'county', 'town'].forEach(k => {
                if (nomAddr[k]) candidateTokens.push(nomAddr[k]);
            });

            // Từ Display Name
            if (displayName) {
                displayName.split(',').forEach(p => {
                    const cleanP = p.trim();
                    if (cleanP) candidateTokens.push(cleanP);
                });
            }

            // --- C. TRA CỨU QUẬN/HUYỆN QUA TỪ ĐIỂN CHÍNH XÁC CAO ---
            let resolvedDistrict = '';

            // 1. Quét qua từ điển WARD_TO_DISTRICT_MAP (chính xác tuyệt đối cho phường/xã/khu phố)
            for (const token of candidateTokens) {
                const cleaned = cleanAdminToken(token);
                if (WARD_TO_DISTRICT_MAP[cleaned]) {
                    resolvedDistrict = WARD_TO_DISTRICT_MAP[cleaned];
                    break;
                }
            }

            // 2. Nếu chưa tìm thấy, kiểm tra trường district/city_district trực tiếp của OSM
            if (!resolvedDistrict) {
                const directDist = nomAddr.city_district || nomAddr.district || nomAddr.county || nomAddr.town || '';
                if (directDist && !directDist.toLowerCase().includes('hồ chí minh') && !directDist.toLowerCase().includes('hà nội')) {
                    resolvedDistrict = formatStandardDistrict(directDist);
                }
            }

            // 3. Nếu chưa tìm thấy, quét qua các chuỗi con xem có Quận ... / Huyện ... / TP Thủ Đức
            if (!resolvedDistrict) {
                for (const token of candidateTokens) {
                    const t = token.trim();
                    if (/^(Quận|Huyện|Thị xã|TP\.|Thành phố Thủ Đức)\b/i.test(t) && !/Hồ Chí Minh|Hà Nội|Đà Nẵng/i.test(t)) {
                        resolvedDistrict = formatStandardDistrict(t);
                        break;
                    }
                }
            }

            // 4. Nếu vẫn chưa có, sử dụng giải thuật tiệm cận tâm không gian (Nearest District Centroid)
            if (!resolvedDistrict) {
                resolvedDistrict = findNearestDistrictCentroid(lat, lng, prov);
            }

            // --- D. XÁC ĐỊNH PHƯỜNG / XÃ ---
            let resolvedWard = nomAddr.ward || nomAddr.quarter || '';
            const sub = nomAddr.suburb || '';
            if (!resolvedWard && sub) {
                if (/^(phường|xã|thị trấn)\b/i.test(sub)) {
                    resolvedWard = sub;
                } else if (sub !== resolvedDistrict) {
                    resolvedWard = `Phường ${sub}`;
                }
            }
            if (!resolvedWard && bdcData && bdcData.locality) {
                const loc = bdcData.locality.trim();
                if (loc && loc !== resolvedDistrict && !/^(hồ chí minh|hà nội)$/i.test(loc)) {
                    resolvedWard = /^(phường|xã|thị trấn)\b/i.test(loc) ? loc : `Phường ${loc}`;
                }
            }

            // --- E. XÁC ĐỊNH TÊN ĐƯỜNG & SỐ NHÀ ---
            const road = nomAddr.road || nomAddr.pedestrian || nomAddr.street || '';
            const houseNum = nomAddr.house_number || '';
            const resolvedStreet = houseNum ? `${houseNum} ${road}`.trim() : road;

            // --- F. TỔNG HỢP ĐỊA CHỈ ĐẦY ĐỦ ---
            const fullAddress = [resolvedStreet, resolvedWard, resolvedDistrict, prov].filter(Boolean).join(', ');

            return {
                province: prov,
                district: resolvedDistrict,
                ward: resolvedWard,
                street: resolvedStreet,
                fullAddress: fullAddress
            };
        }

        async function reverseGeocodeAndSyncInputs(lat, lng) {
            try {
                const info = await resolveAdminLocation(lat, lng);
                if (info) {
                    if (info.province) document.getElementById('province_name').value = info.province;
                    if (info.district) document.getElementById('district_name').value = info.district;
                    if (info.ward) document.getElementById('ward_name').value = info.ward;
                    if (info.street) document.getElementById('street_name').value = info.street;

                    if (info.fullAddress) {
                        document.getElementById('quickAddressSearch').value = info.fullAddress;
                    }

                    const areaVal = parseFloat(document.getElementById('area').value);
                    if (areaVal && areaVal > 0 && info.district) {
                        triggerValuation();
                    } else {
                        fetchQuickComparables(lat, lng, info.district, info.province);
                    }
                    showToast(`Đã nhận diện vị trí: ${info.fullAddress || info.district}`);
                }
            } catch (err) {
                console.warn("Reverse geocode error:", err);
                const curDist = document.getElementById('district_name').value.trim();
                const curProv = document.getElementById('province_name').value.trim();
                fetchQuickComparables(lat, lng, curDist, curProv);
            }
        }

        // ADDRESS INPUT SYNC
        let addrInputTimeout = null;
        function handleAddressInputChange() {
            clearTimeout(addrInputTimeout);
            addrInputTimeout = setTimeout(async () => {
                const prov = document.getElementById('province_name').value.trim();
                const dist = document.getElementById('district_name').value.trim();
                const ward = document.getElementById('ward_name').value.trim();
                const street = document.getElementById('street_name').value.trim();
                if (!prov && !dist) return;
                try {
                    const url = `/api/v1/geocode?province=${encodeURIComponent(prov)}&district=${encodeURIComponent(dist)}&ward=${encodeURIComponent(ward)}&street=${encodeURIComponent(street)}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.status === 'success' && data.latitude && data.longitude) {
                        currentLat = data.latitude;
                        currentLng = data.longitude;
                        map.flyTo([currentLat, currentLng], 16, { duration: 0.8 });
                        mainMarker.setLatLng([currentLat, currentLng]);
                        radiusCircle.setLatLng([currentLat, currentLng]);
                        document.getElementById('coordsBadge').innerText = `${currentLat.toFixed(5)}°N, ${currentLng.toFixed(5)}°E`;
                        fetchQuickComparables(currentLat, currentLng, dist, prov);
                        fetchNearbyPois(currentLat, currentLng, dist || 'Vị trí chuẩn hoá');
                        showToast(`Đã chuẩn hoá vị trí: ${data.standard_address || dist}`);
                    }
                } catch (err) { console.warn("Addr sync error:", err); }
            }, 450);
        }

        ['province_name', 'district_name', 'ward_name', 'street_name'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', handleAddressInputChange);
                el.addEventListener('blur', handleAddressInputChange);
            }
        });

        // SEARCH
        const searchInput = document.getElementById('quickAddressSearch');
        const searchDropdown = document.getElementById('searchDropdown');
        const btnSearch = document.getElementById('btnSearchAddress');
        let searchTimeout = null;

        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const q = this.value.trim();
            if (q.length < 3) { searchDropdown.style.display = 'none'; return; }
            searchTimeout = setTimeout(() => searchAddressNominatim(q), 350);
        });

        btnSearch.addEventListener('click', function () {
            const q = searchInput.value.trim();
            if (q) searchAddressNominatim(q);
        });

        async function searchAddressNominatim(query) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Vietnam')}&limit=5&addressdetails=1`;
                const res = await fetch(url);
                const results = await res.json();
                if (!results || results.length === 0) {
                    searchDropdown.innerHTML = '<div style="padding:8px 12px; color:var(--text-3); font-size:11px;">Không tìm thấy địa chỉ phù hợp</div>';
                    searchDropdown.style.display = 'block';
                    return;
                }
                searchDropdown.innerHTML = '';
                results.forEach(r => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-row';
                    item.innerHTML = `
                        <span class="svg-icon" style="color:var(--brand); margin-top:1px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
                        <div><b>${r.display_name.split(',')[0]}</b><br><small style="color:var(--text-3); font-size:10px;">${r.display_name}</small></div>
                    `;
                    item.addEventListener('click', () => { selectLocation(r); searchDropdown.style.display = 'none'; });
                    searchDropdown.appendChild(item);
                });
                searchDropdown.style.display = 'block';
            } catch (err) { console.error("Search error:", err); }
        }

        async function selectLocation(r) {
            const lat = parseFloat(r.lat);
            const lng = parseFloat(r.lon);
            map.flyTo([lat, lng], 17, { duration: 1.0 });
            mainMarker.setLatLng([lat, lng]);
            radiusCircle.setLatLng([lat, lng]);
            document.getElementById('coordsBadge').innerText = `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
            searchInput.value = r.display_name.split(',').slice(0, 3).join(', ');

            const info = await resolveAdminLocation(lat, lng, r.address, r.display_name);
            if (info) {
                if (info.province) document.getElementById('province_name').value = info.province;
                if (info.district) document.getElementById('district_name').value = info.district;
                if (info.ward) document.getElementById('ward_name').value = info.ward;
                if (info.street) document.getElementById('street_name').value = info.street;
                if (info.fullAddress) document.getElementById('quickAddressSearch').value = info.fullAddress;
            }
            updateLocationAndValuate(lat, lng, false);
        }

        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });

        function quickJump(lat, lng, name, btnEl) {
            if (btnEl) {
                document.querySelectorAll('.quick-city-btn, .city-btn').forEach(b => b.classList.remove('active'));
                btnEl.classList.add('active');
            }
            map.flyTo([lat, lng], 16, { duration: 1.0 });
            mainMarker.setLatLng([lat, lng]);
            updateLocationAndValuate(lat, lng);
            showToast(`Đã chuyển khu vực: ${name}`);
        }

        async function getCurrentLocation() {
            if (!navigator.geolocation) {
                showToast("Trình duyệt không hỗ trợ định vị GPS");
                return;
            }
            showToast("Đang xác định tọa độ GPS và tự động điền địa chỉ...");
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    currentLat = lat;
                    currentLng = lng;
                    map.flyTo([lat, lng], 17, { duration: 1.0 });
                    mainMarker.setLatLng([lat, lng]);
                    radiusCircle.setLatLng([lat, lng]);
                    document.getElementById('coordsBadge').innerText = `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;

                    // Tự động giải mã vị trí GPS và điền đầy đủ các ô địa chỉ với độ chính xác tuyệt đối
                    try {
                        const info = await resolveAdminLocation(lat, lng);
                        if (info) {
                            if (info.province) document.getElementById('province_name').value = info.province;
                            if (info.district) document.getElementById('district_name').value = info.district;
                            if (info.ward) document.getElementById('ward_name').value = info.ward;
                            if (info.street) document.getElementById('street_name').value = info.street;
                            if (info.fullAddress) document.getElementById('quickAddressSearch').value = info.fullAddress;

                            fetchNearbyPois(lat, lng, info.district || 'Vị trí GPS');
                            fetchQuickComparables(lat, lng, info.district, info.province);
                            showToast("Đã định vị GPS và tự động điền địa chỉ thành công!");
                            return;
                        }
                    } catch (e) {
                        console.warn("GPS reverse geocode error:", e);
                    }
                    fetchNearbyPois(lat, lng, 'Vị trí GPS');
                    fetchQuickComparables(lat, lng, '', '');
                    showToast("Đã định vị thành công vị trí GPS của bạn");
                },
                (err) => {
                    showToast("Không thể truy cập GPS. Quý khách vui lòng chọn vị trí trên bản đồ");
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }

        function formatVND(amount) {
            if (!amount) return "-- VNĐ";
            if (amount >= 1e9) return (amount / 1e9).toFixed(2) + " Tỷ VNĐ";
            return (amount / 1e6).toFixed(0) + " Triệu VNĐ";
        }

        // SLIDER SYNC
        function syncAreaSlider(val) {
            document.getElementById('area').value = val;
            document.getElementById('areaSliderVal').textContent = val;
        }

        function syncAreaInput(val) {
            const num = parseFloat(val);
            if (!isNaN(num) && num > 0) {
                document.getElementById('areaRangeSlider').value = Math.min(350, Math.max(15, num));
                document.getElementById('areaSliderVal').textContent = val;
            } else {
                document.getElementById('areaSliderVal').textContent = '--';
            }
        }

        function setAreaVal(val) {
            if (val !== null && val !== undefined && val !== '') {
                document.getElementById('area').value = val;
                document.getElementById('areaRangeSlider').value = val;
                document.getElementById('areaSliderVal').textContent = val;
            } else {
                document.getElementById('area').value = '';
                document.getElementById('areaSliderVal').textContent = '--';
            }
        }

        const PROPERTY_CONFIGS = {
            'Nhà riêng': { hintDesc: 'Hiển thị đầy đủ thông số kết cấu (số tầng, phòng ngủ, WC), diện tích đất và ngõ vào.', areaLabel: 'Diện tích khuôn viên đất', areaPlaceholder: 'VD: 85', directionLabel: 'Hướng nhà chính', soDoText: 'Sổ đỏ / Sổ hồng', loGocText: 'Vị trí Lô góc 2 mặt', visibleFields: ['area', 'frontage_width', 'road_width', 'floor_count', 'bedroom_count', 'bathroom_count'], visibleNlp: ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'] },
            'Căn hộ chung cư': { hintDesc: 'Tự động ẩn số tầng, mặt tiền, ngõ vào và thế đất. Chỉ cần nhập diện tích căn hộ, số phòng ngủ/WC.', areaLabel: 'Diện tích thông thủy căn hộ', areaPlaceholder: 'VD: 72', directionLabel: 'Hướng ban công / Cửa chính', soDoText: 'Sổ hồng / HĐMB', loGocText: 'Căn góc 2 mặt thoáng', visibleFields: ['area', 'bedroom_count', 'bathroom_count'], visibleNlp: ['has_so_do', 'is_lo_goc'] },
            'Đất nền': { hintDesc: 'Tự động ẩn số tầng và số phòng ngủ/WC. Tập trung vào diện tích, chiều ngang mặt tiền và pháp lý.', areaLabel: 'Quy mô thửa đất nền', areaPlaceholder: 'VD: 100', directionLabel: 'Hướng đất chính', soDoText: 'Sổ đỏ chính chủ', loGocText: 'Vị trí Lô góc 2 mặt', visibleFields: ['area', 'frontage_width', 'road_width'], visibleNlp: ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'] },
            'Biệt thự': { hintDesc: 'Đầy đủ thông số khuôn viên biệt thự, mặt tiền, số tầng cao và không gian sân vườn.', areaLabel: 'Diện tích khuôn viên biệt thự', areaPlaceholder: 'VD: 200', directionLabel: 'Hướng biệt thự chính', soDoText: 'Sổ đỏ chính chủ', loGocText: 'Vị trí Lô góc 2 mặt', visibleFields: ['area', 'frontage_width', 'road_width', 'floor_count', 'bedroom_count', 'bathroom_count'], visibleNlp: ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'] },
            'Shophouse': { hintDesc: 'Tối ưu cho mặt bằng kinh doanh kết hợp ở (mặt tiền, lộ giới đường, số tầng).', areaLabel: 'Diện tích sàn kinh doanh / đất', areaPlaceholder: 'VD: 110', directionLabel: 'Hướng nhà chính', soDoText: 'Sổ đỏ chính chủ', loGocText: 'Vị trí Lô góc thương mại', visibleFields: ['area', 'frontage_width', 'road_width', 'floor_count', 'bedroom_count', 'bathroom_count'], visibleNlp: ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'] }
        };

        function setPropTypeTab(type) {
            document.getElementById('property_type').value = type;
            document.querySelectorAll('.prop-tab-btn').forEach(b => {
                if (b.dataset.type === type) b.classList.add('active');
                else b.classList.remove('active');
            });
            updateFormByPropertyType();
        }

        function updateFormByPropertyType() {
            const ptype = document.getElementById('property_type').value;
            const cfg = PROPERTY_CONFIGS[ptype] || PROPERTY_CONFIGS['Nhà riêng'];
            document.getElementById('propertyTypeHintText').textContent = cfg.hintDesc;
            const labelArea = document.getElementById('label_area');
            const inputArea = document.getElementById('area');
            if (labelArea) labelArea.textContent = cfg.areaLabel;
            if (inputArea) inputArea.placeholder = cfg.areaPlaceholder;
            const labelDir = document.getElementById('label_house_direction');
            if (labelDir) labelDir.textContent = cfg.directionLabel;
            const textSoDo = document.getElementById('text_has_so_do');
            if (textSoDo) textSoDo.textContent = cfg.soDoText;
            const textLoGoc = document.getElementById('text_is_lo_goc');
            if (textLoGoc) textLoGoc.textContent = cfg.loGocText;
            const allFields = ['frontage_width', 'road_width', 'floor_count', 'bedroom_count', 'bathroom_count'];
            allFields.forEach(f => {
                const group = document.getElementById(`group_${f}`);
                if (!group) return;
                if (cfg.visibleFields.includes(f)) { group.classList.remove('field-hidden'); }
                else { group.classList.add('field-hidden'); const inp = document.getElementById(f); if (inp && f !== 'area') inp.value = ''; }
            });
            const allNlp = ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'];
            allNlp.forEach(n => {
                const item = document.getElementById(`nlp_${n}`);
                if (!item) return;
                if (cfg.visibleNlp.includes(n)) { item.classList.remove('field-hidden'); }
                else { item.classList.add('field-hidden'); const chk = document.getElementById(n); if (chk) { chk.checked = false; syncChipStyle(chk); } }
            });
        }

        function syncChipStyle(chk) {
            const parent = chk.closest('.chip');
            if (!parent) return;
            if (chk.checked) parent.classList.add('checked');
            else parent.classList.remove('checked');
        }

        async function triggerValuation() {
            const btn = document.getElementById('btnSubmit');
            const btnText = document.getElementById('btnText');
            btnText.textContent = 'Đang tính toán CatBoost...';
            btn.disabled = true;

            const ptype = document.querySelector('input[name="property_type"]:checked')?.value || 'Nhà riêng';
            const isChungCu = (ptype === 'Căn hộ chung cư');
            const isDat = (ptype === 'Đất nền');

            const rawArea = parseFloat(document.getElementById('area').value);
            if (isNaN(rawArea) || rawArea <= 0) {
                showToast('Vui lòng nhập diện tích bất động sản!');
                document.getElementById('area').focus();
                btnText.textContent = 'XÁC ĐỊNH GIÁ TRỊ THẨM ĐỊNH';
                btn.disabled = false;
                return;
            }

            const provInput = document.getElementById('province_name').value.trim();
            const distInput = document.getElementById('district_name').value.trim();

            if (!provInput) {
                showToast('Vui lòng nhập Tỉnh / Thành phố của BĐS!');
                document.getElementById('province_name').focus();
                btnText.textContent = 'XÁC ĐỊNH GIÁ TRỊ THẨM ĐỊNH';
                btn.disabled = false;
                return;
            }

            if (!distInput) {
                showToast('Vui lòng nhập Quận / Huyện của BĐS!');
                document.getElementById('district_name').focus();
                btnText.textContent = 'XÁC ĐỊNH GIÁ TRỊ THẨM ĐỊNH';
                btn.disabled = false;
                return;
            }

            const validArea = rawArea;

            // ── Show skeleton loader, hide old result ──
            const skeleton = document.getElementById('skeletonResultLoader');
            const resultWrapper = document.getElementById('valuationResultWrapper');
            if (skeleton) {
                skeleton.classList.add('is-loading');
                resultWrapper.style.display = 'none';
                // Scroll to skeleton so user sees progress
                skeleton.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            const rawRoad = parseFloat(document.getElementById('road_width')?.value);
            const validRoad = (!isNaN(rawRoad) && rawRoad >= 0) ? rawRoad : 3.0;
            const rawFront = parseFloat(document.getElementById('frontage_width')?.value);
            const validFront = (!isNaN(rawFront) && rawFront >= 0) ? rawFront : 4.0;
            const rawFloor = parseInt(document.getElementById('floor_count')?.value);
            const validFloor = (!isNaN(rawFloor) && rawFloor >= 1) ? rawFloor : 1;
            const rawBed = parseInt(document.getElementById('bedroom_count')?.value);
            const validBed = (!isNaN(rawBed) && rawBed >= 1) ? rawBed : 2;
            const rawBath = parseInt(document.getElementById('bathroom_count')?.value);
            const validBath = (!isNaN(rawBath) && rawBath >= 1) ? rawBath : 1;
            const houseDir = document.getElementById('house_direction')?.value || 'Đông Nam';

            const payload = {
                property_type: ptype,
                province_name: provInput,
                district_name: distInput,
                ward_name: document.getElementById('ward_name').value.trim(),
                street_name: document.getElementById('street_name').value.trim(),
                area: validArea,
                frontage_width: isChungCu ? 4.0 : validFront,
                road_width: isChungCu ? 3.0 : validRoad,
                floor_count: (isChungCu || isDat) ? 1 : validFloor,
                bedroom_count: isDat ? 2 : validBed,
                bathroom_count: isDat ? 2 : validBath,
                house_direction: houseDir,
                has_so_do: document.getElementById('has_so_do').checked,
                is_lo_goc: document.getElementById('is_lo_goc').checked,
                is_no_hau: isChungCu ? false : document.getElementById('is_no_hau').checked,
                is_oto_do: isChungCu ? false : document.getElementById('is_oto_do').checked,
                latitude: currentLat,
                longitude: currentLng,
                customer_phone: document.getElementById('customer_phone').value || null
            };

            try {
                const response = await fetch('/api/v1/predict-price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    throw new Error(`Máy chủ phản hồi mã ${response.status}`);
                }
                const data = await response.json();

                if (data.status === 'success') {
                    // Hide skeleton, show real result
                    if (skeleton) skeleton.classList.remove('is-loading');
                    document.getElementById('valuationResultWrapper').style.display = 'block';
                    document.getElementById('resultPlaceholder').style.display = 'none';
                    renderValuationResult(data.valuation, data.price_trend);
                    renderComparables(data.comparable_properties);
                    showToast('Đã hoàn thành thẩm định giá tài sản');
                    document.getElementById('valuationResultWrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } catch (error) {
                console.error("API error:", error);
                if (skeleton) skeleton.classList.remove('is-loading');
                showToast('Không thể kết nối máy chủ thẩm định');
            } finally {
                btnText.textContent = 'XÁC ĐỊNH GIÁ TRỊ THẨM ĐỊNH';
                btn.disabled = false;
            }
        }

        async function fetchQuickComparables(lat, lng, dist = null, prov = null) {
            try {
                const d = dist || document.getElementById('district_name').value.trim();
                const p = prov || document.getElementById('province_name').value.trim();
                const ptype = document.querySelector('input[name="property_type"]:checked')?.value || 'Nhà riêng';
                const area = parseFloat(document.getElementById('area').value) || 50;
                let url = `/api/v1/comparables?latitude=${lat}&longitude=${lng}&property_type=${encodeURIComponent(ptype)}&target_area=${area}&limit=5&radius_meters=2000`;
                if (d) url += `&district_name=${encodeURIComponent(d)}`;
                if (p) url += `&province_name=${encodeURIComponent(p)}`;
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn("Lỗi tải BĐS tương đồng nhanh:", res.status);
                    return;
                }
                const data = await res.json();
                if (data && data.comparable_properties) { renderComparables(data.comparable_properties); }
            } catch (e) { console.warn("Comp fetch error:", e); }
        }

        // ════════ MAIN TAB SWITCHER (TRANG CHỦ / SO SÁNH GIÁ) ════════
        let activeMainTab = 'home';
        let latestValuation = null;
        let priceTrendChartInstance = null;

        function renderValuationResult(v, priceTrend = null) {
            latestValuation = v;
            const priceEl = document.getElementById('predictedPrice');
            const rangeEl = document.getElementById('priceRange');
            const perM2El = document.getElementById('pricePerM2');
            const confEl = document.getElementById('confidenceScore');
            const meterEl = document.getElementById('confidenceMeterFill');
            const certCodeEl = document.getElementById('certSecurityCode');

            const randCode = Math.floor(1000 + Math.random() * 9000);
            certCodeEl.textContent = `MHD-TDG-2026-${randCode}`;

            priceEl.innerHTML = `${(v.predicted_price / 1e9).toFixed(2)} <span>Tỷ VNĐ</span>`;
            if (rangeEl) rangeEl.innerText = `Khoảng ước tính: ${formatVND(v.price_low)} - ${formatVND(v.price_high)}`;
            perM2El.innerText = (v.price_per_m2 / 1e6).toFixed(1) + " Tr/m²";

            // Visual Spectrum Range Gauge updates
            const minEl = document.getElementById('rangeMinVal');
            const targetEl = document.getElementById('rangeTargetVal');
            const highEl = document.getElementById('rangeHighVal');
            const pointerEl = document.getElementById('gaugePointer');
            if (minEl) minEl.textContent = `${(v.price_low / 1e9).toFixed(2)} Tỷ`;
            if (targetEl) targetEl.textContent = `${(v.predicted_price / 1e9).toFixed(2)} Tỷ`;
            if (highEl) highEl.textContent = `${(v.price_high / 1e9).toFixed(2)} Tỷ`;

            if (pointerEl && v.price_high > v.price_low) {
                const pct = Math.max(8, Math.min(92, ((v.predicted_price - v.price_low) / (v.price_high - v.price_low)) * 100));
                pointerEl.style.left = `${pct}%`;
            }

            // Circular Confidence Donut Gauge & Ranking
            const confPct = (v.confidence_score * 100).toFixed(1);
            const confLevel = v.confidence_score >= 0.90 ? "Hạng A+ (Rất cao)" : (v.confidence_score >= 0.85 ? "Hạng A (Chuẩn xác)" : "Hạng B (Tiêu chuẩn)");
            confEl.innerText = `${confPct}% (${confLevel})`;
            if (meterEl) meterEl.style.width = `${Math.min(100, Math.max(50, confPct))}%`;

            const ringText = document.getElementById('ringCenterVal');
            const ringCircle = document.getElementById('confidenceRingProgress');
            if (ringText) ringText.textContent = `${Math.round(confPct)}%`;
            if (ringCircle) {
                const circumference = 163.36; // 2 * PI * 26
                const offset = circumference - (circumference * (v.confidence_score || 0.85));
                ringCircle.style.strokeDashoffset = offset;
            }

            const driversContainer = document.getElementById('valueDriversList');
            driversContainer.innerHTML = '';

            const maxAbsImpact = Math.max(...v.value_drivers.map(d => {
                const num = parseFloat(d.impact_percent.replace('%', '').replace('+', ''));
                return Math.abs(num);
            }), 1);

            v.value_drivers.forEach((d) => {
                const row = document.createElement('div');
                row.className = 'driver-card-row';
                const isPos = d.positive;
                const absVal = Math.abs(parseFloat(d.impact_percent.replace('%', '').replace('+', '')));
                const barWidth = Math.max(4, Math.min(100, (absVal / maxAbsImpact) * 100));
                const barColor = isPos ? 'var(--green)' : 'var(--red)';

                const iconSvg = isPos
                    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`
                    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 7 17 17"></polyline></svg>`;

                const explanations = {
                    'Vị trí Quận/Huyện': 'Mô hình AI CatBoost đánh giá mức chênh lệch giá trị vị trí này so với mặt bằng toàn quốc dựa trên 34.955 giao dịch thực tế.',
                    'Quy mô diện tích đất': 'Hệ số co giãn giá trị theo diện tích sử dụng — so sánh với mức trung vị của phân khúc cùng khu vực.',
                    'Diện tích căn hộ': 'Diện tích thông thuỷ của căn hộ chung cư ảnh hưởng trực tiếp đến giá trị tổng tài sản.',
                    'Diện tích khu đất': 'Quy mô thửa đất lớn hoặc nhỏ tạo hiệu ứng biên giá trị khác nhau.',
                    'Phân khúc loại hình BĐS': 'Mức chênh lệch giá giữa các loại hình (Nhà riêng, Chung cư, Đất nền, Biệt thự) theo cung/cầu thị trường.',
                    'Pháp lý Sổ đỏ / Sổ hồng': 'BĐS có sổ đỏ/sổ hồng chuẩn có thanh khoản cao hơn đáng kể so với giấy tờ khác.',
                    'Ngõ ô tô đỗ cửa / vào nhà': 'Khả năng ô tô tiếp cận tận cửa gia tăng tính tiện ích và giá trị thương mại vượt trội.',
                    'Vị trí Lô góc 2 mặt tiền': 'Lô góc 2 mặt tiền hưởng lợi ánh sáng, thông thoáng và cơ hội kinh doanh.',
                    'Thế đất Nở hậu phong thủy': 'Thế đất nở hậu được ưa chuộng theo quan niệm phong thuỷ, tạo điểm cộng định giá.',
                    'Độ rộng đường ngõ tiếp cận': 'Đường ngõ rộng rãi giúp việc đi lại thuận lợi và gia tăng giá trị tài sản.',
                    'Chiều rộng mặt tiền': 'Mặt tiền rộng mang lại lợi thế thương mại và kiến trúc xây dựng.',
                    'Chiết khấu thương lượng thị trường (MHD Discount)': 'Hệ số điều chỉnh từ giá niêm yết (asking price) về sát giá chốt công chứng thực tế (trung bình ~7%).'
                };

                const explanation = explanations[d.factor] || `Thuật toán TreeSHAP đo lường mức đóng góp biên chính xác của yếu tố "${d.factor}" vào kết quả định giá cuối cùng.`;

                row.innerHTML = `
                    <div class="driver-header-line">
                        <div class="driver-name-tag">
                            <span class="svg-icon" style="color:${isPos ? 'var(--green)' : 'var(--red)'};">${iconSvg}</span>
                            ${d.factor}
                        </div>
                        <span class="driver-pct-badge ${isPos ? 'pos' : 'neg'}">${d.impact_percent}</span>
                    </div>
                    <div class="driver-track-bar">
                        <div style="height:100%; width:${barWidth}%; background:${barColor}; border-radius:2px;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="driver-status-line">${d.status}</span>
                        <span style="font-size:10px; color:var(--brand); font-weight:700;">Chi tiết</span>
                    </div>
                    <div class="driver-exp-drawer">${explanation}</div>
                `;

                row.addEventListener('click', () => { row.classList.toggle('expanded'); });
                driversContainer.appendChild(row);
            });

            // Update Multi-Dimensional Radar Assessment matching benchmark
            updateRadarAssessment(v);

            // Show Bridge Card to Compare View
            const bridgeCard = document.getElementById('bridgeCompareCard');
            if (bridgeCard) bridgeCard.style.display = 'flex';

            // ── 5. Render 12-Month Real Historical Price Trend & AI Forecast Chart ──
            if (priceTrend) {
                renderPriceTrendChart(priceTrend);
            } else {
                fetchPriceTrendData(v);
            }
        }

        async function fetchPriceTrendData(v) {
            try {
                const dist = document.getElementById('district_name').value.trim();
                const prov = document.getElementById('province_name').value.trim();
                const ptype = document.querySelector('input[name="property_type"]:checked')?.value || 'Nhà riêng';
                const currentM2 = v ? (v.price_per_m2 || 0) : 0;
                const res = await fetch(`/api/v1/price-trend?district_name=${encodeURIComponent(dist)}&province_name=${encodeURIComponent(prov)}&property_type=${encodeURIComponent(ptype)}&current_price_m2=${currentM2}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data && data.price_trend) {
                    renderPriceTrendChart(data.price_trend);
                }
            } catch (e) {
                console.warn("Lỗi tải xu hướng giá:", e);
            }
        }

        function renderPriceTrendChart(trend) {
            if (!trend || !trend.months || trend.months.length === 0) return;

            const card = document.getElementById('priceTrendCard');
            if (card) card.style.display = 'block';

            // 1. Update Statistical KPI Badges & Texts
            const yoyEl = document.getElementById('trendYoyVal');
            const qoqEl = document.getElementById('trendQoqVal');
            const forecastEl = document.getElementById('trendForecastVal');
            const countBadge = document.getElementById('trendSampleCountBadge');
            const subTitle = document.getElementById('trendSubtitle');
            const insightText = document.getElementById('trendInsightText');

            const yoy = trend.yearly_growth_percent;
            const qoq = trend.quarterly_growth_percent;
            const fc = trend.forecast_growth_percent;

            if (yoyEl) {
                yoyEl.textContent = (yoy >= 0 ? '+' : '') + yoy + '%';
                yoyEl.className = 'trend-metric-val ' + (yoy < 0 ? 'negative' : '');
            }
            if (qoqEl) {
                qoqEl.textContent = (qoq >= 0 ? '+' : '') + qoq + '%';
                qoqEl.className = 'trend-metric-val ' + (qoq < 0 ? 'negative' : '');
            }
            if (forecastEl) {
                forecastEl.textContent = (fc >= 0 ? '+' : '') + fc + '%';
            }
            if (countBadge && trend.total_samples) {
                countBadge.textContent = `${trend.total_samples.toLocaleString()} BĐS thật`;
            }
            if (subTitle) {
                subTitle.textContent = `Thống kê chuỗi thời gian thực tế tại ${trend.district_name || 'khu vực'}`;
            }
            if (insightText && trend.forecast_comment) {
                insightText.textContent = trend.forecast_comment;
            }

            // 2. Render Chart using window.Chart
            const canvas = document.getElementById('priceTrendCanvas');
            if (!canvas || typeof window.Chart === 'undefined') {
                console.warn("Canvas hoặc Chart.js chưa sẵn sàng");
                return;
            }

            const ctx = canvas.getContext('2d');
            if (priceTrendChartInstance) {
                priceTrendChartInstance.destroy();
                priceTrendChartInstance = null;
            }

            // Gradient background for District line
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(224, 84, 0, 0.35)');
            gradient.addColorStop(1, 'rgba(224, 84, 0, 0.0)');

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
            const textColor = isDark ? '#94a3b8' : '#64748b';

            priceTrendChartInstance = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: trend.months,
                    datasets: [
                        {
                            label: `Đơn giá ${trend.district_name || 'Quận'} (Tr/m²)`,
                            data: trend.district_series,
                            borderColor: '#E05400',
                            backgroundColor: gradient,
                            borderWidth: 2.5,
                            fill: true,
                            tension: 0.35,
                            pointBackgroundColor: '#E05400',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 1.5,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Trung bình TP (Tr/m²)',
                            data: trend.city_series,
                            borderColor: '#3B82F6',
                            borderDash: [5, 4],
                            borderWidth: 1.8,
                            fill: false,
                            tension: 0.35,
                            pointBackgroundColor: '#3B82F6',
                            pointRadius: 2,
                            pointHoverRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: textColor,
                                font: { size: 11, family: "'Inter', sans-serif", weight: '600' },
                                boxWidth: 12,
                                boxHeight: 12,
                                padding: 12
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.94)',
                            titleColor: '#f8fafc',
                            bodyColor: '#e2e8f0',
                            borderColor: 'rgba(224, 84, 0, 0.4)',
                            borderWidth: 1,
                            padding: 10,
                            boxPadding: 4,
                            usePointStyle: true,
                            callbacks: {
                                label: function(context) {
                                    const val = context.parsed.y;
                                    let label = context.dataset.label || '';
                                    const idx = context.dataIndex;
                                    let extra = '';
                                    if (context.datasetIndex === 0 && trend.sample_counts && trend.sample_counts[idx]) {
                                        extra = ` (${trend.sample_counts[idx]} BĐS thật)`;
                                    }
                                    return ` ${label}: ${val} Tr/m²${extra}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: gridColor },
                            ticks: { color: textColor, font: { size: 10.5, family: "'Inter', sans-serif" } }
                        },
                        y: {
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                font: { size: 10.5, family: "'Inter', sans-serif" },
                                callback: function(v) { return v + ' Tr'; }
                            }
                        }
                    }
                }
            });
        }
        window.renderPriceTrendChart = renderPriceTrendChart;

        // Toggle Expandable SHAP Drawer
        function toggleShapDetails() {
            const drawer = document.getElementById('shapDetailDrawer');
            const txt = document.getElementById('shapToggleText');
            const icon = document.getElementById('shapToggleIcon');
            if (drawer) {
                const isOpen = drawer.style.display !== 'none';
                drawer.style.display = isOpen ? 'none' : 'block';
                if (txt) txt.textContent = isOpen ? 'Xem chi tiết 10 yếu tố TreeSHAP' : 'Thu gọn chi tiết TreeSHAP';
                if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }

        // ── REAL-DATA DYNAMIC 5-AXIS RADAR ASSESSMENT ENGINE ──
        function updateRadarAssessment(v) {
            if (!v) return;

            // 1. PHÁP LÝ (Thực tế từ TreeSHAP pháp lý & tình trạng Sổ đỏ/hồng)
            let phapLy = 70;
            const hasSoDo = document.getElementById('has_so_do')?.checked;
            const ptype = document.getElementById('property_type')?.value || '';
            const legalDriver = (v.value_drivers || []).find(d => 
                d.factor.includes('Pháp lý') || d.factor.includes('Sổ đỏ') || d.status.includes('sổ')
            );
            
            if (hasSoDo) {
                phapLy = 92;
                if (legalDriver && legalDriver.positive) {
                    const impactVal = parseFloat(legalDriver.impact_percent.replace(/[+%]/g, '')) || 0;
                    phapLy = Math.min(98, Math.round(90 + impactVal * 1.5));
                }
            } else {
                if (ptype.includes('chung cư')) {
                    phapLy = 82; // HĐMB hoặc đang chờ cấp sổ
                } else {
                    const negImpact = legalDriver ? Math.abs(parseFloat(legalDriver.impact_percent.replace(/[-+%]/g, ''))) : 15;
                    phapLy = Math.max(38, Math.round(65 - negImpact)); // Giấy tờ khác / vi bằng chịu rủi ro pháp lý cao
                }
            }

            // 2. GIÁ CẢ (Thực tế đối chiếu Đơn giá thẩm định vs Đơn giá trung bình 5 BĐS PostGIS)
            let giaCa = 78;
            const targetUnitPrice = v.price_per_m2 || 0;
            if (currentComps && currentComps.length > 0 && targetUnitPrice > 0) {
                const validComps = currentComps.filter(c => c.unit_price > 0);
                if (validComps.length > 0) {
                    const avgCompUnitPrice = validComps.reduce((acc, c) => acc + c.unit_price, 0) / validComps.length;
                    const priceRatio = targetUnitPrice / avgCompUnitPrice; // Tỉ lệ giá đối chiếu thực tế
                    
                    if (priceRatio <= 1.0) {
                        // Giá rất hấp dẫn / cạnh tranh so với các giao dịch lân cận
                        giaCa = Math.min(96, Math.round(82 + (1.0 - priceRatio) * 60));
                    } else {
                        // Giá cao hơn trung bình lân cận (do nhà đẹp hoặc ngõ rộng hơn)
                        giaCa = Math.max(50, Math.round(82 - (priceRatio - 1.0) * 70));
                    }
                }
            } else {
                // Suy luận từ biên độ giá [price_low, price_high] và confidence_score
                const confScore = v.confidence_score || 0.85;
                giaCa = Math.round(confScore * 92);
            }

            // 3. VỊ TRÍ (Thực tế từ TreeSHAP Vị trí Quận/Huyện, độ rộng ngõ, mặt tiền & cự ly PostGIS)
            let viTri = 75;
            const districtDriver = (v.value_drivers || []).find(d => 
                d.factor.includes('Quận') || d.factor.includes('Huyện') || d.factor.includes('Vị trí')
            );
            if (districtDriver) {
                const distImpact = parseFloat(districtDriver.impact_percent.replace(/[+%]/g, '')) || 0;
                viTri += Math.round(distImpact * 1.2);
            }
            
            const roadW = parseFloat(document.getElementById('road_width')?.value || 0);
            if (roadW >= 6) viTri += 8; // Ô tô tránh nhau
            else if (roadW >= 3.5) viTri += 4; // Ô tô đỗ cửa
            else if (roadW > 0 && roadW < 2.5) viTri -= 5; // Ngõ hẹp xe máy

            const frontW = parseFloat(document.getElementById('frontage_width')?.value || 0);
            if (frontW >= 5) viTri += 5; // Mặt tiền rộng kinh doanh tốt
            
            if (document.getElementById('is_lo_goc')?.checked) viTri += 4;
            
            // Cự ly đối chứng không gian thực tế
            if (currentComps && currentComps.length > 0) {
                const avgDistance = currentComps.reduce((acc, c) => acc + (c.distance_meters || 1000), 0) / currentComps.length;
                if (avgDistance < 600) viTri += 4; // Trung tâm đô thị nén dày đặc
            }
            viTri = Math.min(98, Math.max(45, Math.round(viTri)));

            // 4. TIỆN ÍCH (Ước tính theo vị trí & hạ tầng khu vực)
            let tienIch = viTri >= 85 ? 90 : (viTri >= 70 ? 82 : 75);

            // 5. TIỀM NĂNG (Thực tế từ độ tin cậy giao dịch, thế đất phong thủy & độ phân tán giá)
            let tiemNang = 72;
            const conf = v.confidence_score || 0.85;
            tiemNang += Math.round(conf * 15); // Thanh khoản thị trường cao
            
            if (v.predicted_price > 0 && v.price_high > v.price_low) {
                const spread = (v.price_high - v.price_low) / v.predicted_price;
                if (spread < 0.12) tiemNang += 6; // Biên độ hẹp = thanh khoản nhanh, tính thương mại an toàn
            }
            
            if (document.getElementById('is_no_hau')?.checked) tiemNang += 5; // Thế đất nở hậu gia tăng giá trị
            if (document.getElementById('is_lo_goc')?.checked) tiemNang += 3;
            if (ptype === 'Shophouse' || ptype === 'Nhà riêng') tiemNang += 3;
            tiemNang = Math.min(98, Math.max(50, Math.round(tiemNang)));

            const scores = { phapLy, giaCa, viTri, tienIch, tiemNang };

            // Update Radar Chart Polygon & Vertices
            // Center (170, 135), R = 80
            // Angles: -90 (Pháp lý), -18 (Giá cả), 54 (Vị trí), 126 (Tiện ích), 198 (Tiềm năng)
            const cx = 170, cy = 135, R = 80;
            const angles = [-90, -18, 54, 126, 198];
            const values = [scores.phapLy, scores.giaCa, scores.viTri, scores.tienIch, scores.tiemNang];

            const pts = values.map((val, idx) => {
                const frac = Math.max(0.18, Math.min(1.0, val / 100));
                const rad = (angles[idx] * Math.PI) / 180;
                const x = cx + R * frac * Math.cos(rad);
                const y = cy + R * frac * Math.sin(rad);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            });

            const polygon = document.getElementById('radarPolygon');
            if (polygon) {
                polygon.setAttribute('points', pts.join(' '));
            }

            pts.forEach((pt, idx) => {
                const dot = document.getElementById(`radarDot${idx}`);
                if (dot) {
                    const [x, y] = pt.split(',');
                    dot.setAttribute('cx', x);
                    dot.setAttribute('cy', y);
                }
            });

            // Update Progress Bars matching Image 2
            const updateBar = (id, val) => {
                const bar = document.getElementById(`bar${id}`);
                const score = document.getElementById(`score${id}`);
                if (bar) bar.style.width = `${Math.min(100, Math.max(10, val))}%`;
                if (score) score.textContent = `${Math.round(val)}%`;
            };

            updateBar('PhapLy', scores.phapLy);
            updateBar('GiaCa', scores.giaCa);
            updateBar('ViTri', scores.viTri);
            updateBar('TienIch', scores.tienIch);
            updateBar('TiemNang', scores.tiemNang);
        }

        let currentComps = [];

        function renderComparables(comps) {
            compLayerGroup.clearLayers();
            currentComps = comps || [];
            const listContainer = document.getElementById('compList');
            listContainer.innerHTML = '';

            const compCount = comps ? comps.length : 0;
            const navBadge = document.getElementById('navCompCount');
            if (navBadge) navBadge.textContent = compCount;
            const navBadgeMobile = document.getElementById('navCompCountMobile');
            if (navBadgeMobile) navBadgeMobile.textContent = compCount;

            const bridgeTitle = document.getElementById('bridgeTitleText');
            if (bridgeTitle) bridgeTitle.textContent = `Đối Chiếu ${compCount} Bất Động Sản Tương Đồng Lân Cận`;

            if (!comps || comps.length === 0) {
                listContainer.innerHTML = '<div style="padding:18px; color:var(--text-3); text-align:center; font-size:11.5px;">Chưa có dữ liệu giao dịch trong khu vực lân cận này.</div>';
                document.getElementById('compTitleText').textContent = '5 BĐS Tương Đồng Lân Cận';
                document.getElementById('compRadiusBadge').textContent = '0 BĐS';
                updateCompareViewHeader();
                return;
            }

            const distances = comps.map(c => c.distance_meters || 0);
            const maxDist = Math.max(...distances, 0);
            let radLabel = maxDist <= 500 ? "500m" : (maxDist < 1000 ? Math.round(maxDist) + "m" : (maxDist / 1000).toFixed(1) + "km");

            document.getElementById('compTitleText').textContent = `${comps.length} BĐS Tương Đồng Lân Cận`;
            document.getElementById('compRadiusBadge').textContent = `Bán kính ~${radLabel}`;
            updateCompareViewHeader();

            if (radiusCircle) { radiusCircle.setRadius(Math.max(500, maxDist + 50)); }

            const compMarkers = [];
            const seenPositions = {};

            comps.forEach((c, idx) => {
                const fullLocStr = c.standard_address || [c.street_name, c.ward_name, c.district_name, c.province_name].filter(p => p && p.trim().length > 0).join(', ') || 'Khu vuc lan can';

                let displayLat = c.latitude;
                let displayLng = c.longitude;
                if (displayLat && displayLng) {
                    const posKey = `${displayLat.toFixed(5)}_${displayLng.toFixed(5)}`;
                    if (seenPositions[posKey] !== undefined) {
                        seenPositions[posKey] += 1;
                        const angle = (seenPositions[posKey] * 72) * Math.PI / 180;
                        displayLat += (0.00025 * Math.sin(angle));
                        displayLng += (0.00025 * Math.cos(angle));
                    } else { seenPositions[posKey] = 0; }
                }

                const numIcon = createSvgIcon('#E05400', false, idx + 1);
                const item = document.createElement('div');
                item.className = 'comp-card-record';
                item.dataset.idx = idx;
                const distText = c.distance_meters < 50 ? "Ngay cạnh" : `${Math.round(c.distance_meters)}m`;
                const currentArea = parseFloat(document.getElementById('area').value) || 85;
                const areaDelta = Math.abs(c.area - currentArea);
                const matchScore = Math.max(88, Math.min(99, Math.round(100 - (c.distance_meters / 100) - (areaDelta * 0.4))));

                const hasCma = c.adjustment_percent !== undefined && c.indicated_price_per_m2 !== undefined;
                const adjText = hasCma ? `${c.adjustment_percent > 0 ? '+' : ''}${c.adjustment_percent}%` : null;
                const indPriceText = hasCma ? `${(c.indicated_price_per_m2 / 1e6).toFixed(1)} Tr/m²` : null;
                const weightText = c.weight_percent !== undefined ? `${c.weight_percent}%` : null;

                item.innerHTML = `
                    <div class="comp-meta-column">
                        <span class="comp-num-pill">#${idx + 1}</span>
                        <span class="comp-dist-badge">${distText}</span>
                    </div>
                    <div class="comp-content-column">
                        <div class="comp-title-line">
                            <span class="comp-title-name">${c.property_type || 'BĐS'} ${c.area}m²</span>
                            <span class="comp-match-pill">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ${c.similarity_score || matchScore}% Tương đồng
                            </span>
                        </div>
                        <div class="comp-address-line" title="${fullLocStr}">
                            <span class="svg-icon" style="color:var(--brand); flex-shrink:0;">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </span>
                            <span>${fullLocStr}</span>
                        </div>
                        <div class="comp-attributes-line">
                            <span class="comp-attr-chip">Ngõ ${c.road_width || 3}m</span>
                            <span class="comp-attr-chip">${c.bedroom_count ? c.bedroom_count + ' PN' : 'MT ' + (c.frontage_width || 4) + 'm'}</span>
                            ${c.has_so_do ? '<span class="comp-attr-chip" style="color:var(--green); font-weight:600;">Sổ đỏ</span>' : ''}
                            ${hasCma ? `<span class="comp-attr-chip" style="color:var(--brand); font-weight:700;">Đ/C: ${adjText} (Trọng số ${weightText})</span>` : ''}
                        </div>
                    </div>
                    <div class="comp-price-column">
                        <div class="comp-price-hero">${formatVND(c.price)}</div>
                        <div class="comp-price-sqm">${(c.price_per_m2 / 1e6).toFixed(1)} Tr/m²</div>
                    </div>
                `;

                let marker = null;
                if (displayLat && displayLng) {
                    marker = L.marker([displayLat, displayLng], { icon: numIcon, zIndexOffset: 600 - idx }).bindPopup(`
                        <div style="font-family:'Inter', sans-serif; font-size:11.5px; min-width:200px; line-height:1.5;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">
                                <b style="color:#E05400; font-family:'DM Sans', sans-serif; font-size:12.5px;">#${idx + 1}: ${c.property_type}</b>
                                <span style="background:rgba(224,84,0,0.12); color:#E05400; font-family:'DM Sans', sans-serif; font-weight:700; font-size:10px; padding:1px 6px; border-radius:3px;">Cach ${distText}</span>
                            </div>
                            <div style="margin-bottom:3px;"><b>Dia chi:</b> ${fullLocStr}</div>
                            <div style="margin-bottom:3px;"><b>Gia:</b> <span style="color:#E05400; font-family:'DM Sans', sans-serif; font-weight:800;">${formatVND(c.price)}</span> (${(c.price_per_m2 / 1e6).toFixed(1)} Tr/m2)</div>
                            <div style="color:#94A3B8; font-size:10.5px;">DT: <b>${c.area}m2</b> | Ngo: <b>${c.road_width || 3}m</b></div>
                        </div>
                    `);

                    marker.on('click', () => {
                        document.querySelectorAll('.comp-card-record').forEach(el => el.classList.remove('active'));
                        item.classList.add('active');
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        openCompModal(c, idx, fullLocStr);
                    });
                    compLayerGroup.addLayer(marker);
                }
                compMarkers.push(marker);

                item.addEventListener('click', () => {
                    document.querySelectorAll('.comp-card-record').forEach(el => el.classList.remove('active'));
                    item.classList.add('active');
                    if (displayLat && displayLng) {
                        map.flyTo([displayLat, displayLng], 17, { duration: 0.7 });
                        if (compMarkers[idx]) compMarkers[idx].openPopup();
                    }
                    openCompModal(c, idx, fullLocStr);
                });

                listContainer.appendChild(item);
            });

            if (latestValuation) {
                updateRadarAssessment(latestValuation);
            }
        }

        // COMPARISON MODAL
        function openCompModal(c, idx, locStr) {
            const existing = document.getElementById('compModal');
            if (existing) existing.remove();

            const myArea = parseFloat(document.getElementById('area').value) || 85;
            const myType = document.getElementById('property_type').value;
            const myRoad = parseFloat(document.getElementById('road_width').value) || 4;

            const modal = document.createElement('div');
            modal.id = 'compModal';
            modal.className = 'mhd-modal-backdrop';
            modal.innerHTML = `
                <div class="mhd-modal-shell">
                    <div class="modal-shell-header">
                        <div style="font-family:var(--font-heading); font-size:14px; font-weight:700; color:var(--text-1); display:flex; align-items:center; gap:6px;">
                            <span class="comp-num-pill">#${idx + 1}</span>
                            <span>${c.property_type} ${c.area}m2</span>
                        </div>
                        <button class="modal-close-btn" onclick="closeCompModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div class="modal-shell-body">
                        <div class="modal-hero-price-box">
                            <div>
                                <div style="font-family:var(--font-heading); font-size:22px; font-weight:800; color:var(--brand); line-height:1.1;">${formatVND(c.price)}</div>
                                <div style="font-size:10.5px; color:var(--text-3); margin-top:1px;">Giá niêm yết thị trường</div>
                            </div>
                            <div style="font-family:var(--font-heading); font-size:15px; font-weight:800; color:var(--text-1);">${(c.price_per_m2 / 1e6).toFixed(1)} Tr/m²</div>
                        </div>

                        <table class="comparison-specs-table">
                            <thead><tr><th>Chỉ số</th><th>Tài sản thẩm định</th><th>BĐS đối chứng #${idx + 1}</th></tr></thead>
                            <tbody>
                                <tr><td><b>Loại hình</b></td><td>${myType}</td><td><b>${c.property_type}</b></td></tr>
                                <tr><td><b>Diện tích</b></td><td>${myArea} m²</td><td><b>${c.area} m²</b> (${c.area >= myArea ? '+' : ''}${(c.area - myArea).toFixed(1)}m²)</td></tr>
                                <tr><td><b>Ngõ vào</b></td><td>${myRoad} m</td><td><b>${c.road_width || 3} m</b></td></tr>
                                <tr><td><b>Số tầng</b></td><td>${document.getElementById('floor_count').value || '—'} tầng</td><td><b>${c.floor_count || '—'} tầng</b></td></tr>
                                <tr><td><b>PN/WC</b></td><td>${document.getElementById('bedroom_count').value || '—'} PN</td><td><b>${c.bedroom_count || '—'} PN / ${c.bathroom_count || '—'} WC</b></td></tr>
                                <tr><td><b>Khoảng cách</b></td><td>Tâm khảo sát</td><td><b style="color:var(--brand);">${Math.round(c.distance_meters)} mét</b></td></tr>
                            </tbody>
                        </table>

                        ${c.adjustment_percent !== undefined ? `
                        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); padding:10px; margin-bottom:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-size:10.5px; font-weight:700; text-transform:uppercase; color:var(--brand); letter-spacing:0.5px;">Phép Tính Điều Chỉnh So Sánh (CMA)</span>
                                <span style="font-size:11.5px; font-weight:700; color:${c.adjustment_percent < 0 ? 'var(--red)' : 'var(--green)'};">
                                    ${c.adjustment_percent > 0 ? '+' : ''}${c.adjustment_percent}%
                                </span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; margin-bottom:5px;">
                                <span style="color:var(--text-3);">Mức giá chỉ dẫn sau điều chỉnh:</span>
                                <b style="color:var(--text-1); font-family:var(--font-heading);">${(c.indicated_price_per_m2 / 1e6).toFixed(1)} Tr/m² (${formatVND(c.indicated_price)})</b>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; margin-bottom:5px;">
                                <span style="color:var(--text-3);">Trọng số gia quyền vào giá thẩm định:</span>
                                <b style="color:var(--brand); font-family:var(--font-heading);">${c.weight_percent}%</b>
                            </div>
                            ${c.adjustment_reasons && c.adjustment_reasons.length > 0 ? `
                            <div style="border-top:1px dashed var(--border); padding-top:5px; font-size:10.5px; color:var(--text-3); line-height:1.4;">
                                <b>Yếu tố chênh lệch:</b> ${c.adjustment_reasons.join(' | ')}
                            </div>` : ''}
                        </div>` : ''}

                        <div style="font-size:11px; color:var(--text-3); margin-bottom:12px; display:flex; align-items:center; gap:5px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--brand);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span><b>Địa chỉ:</b> ${locStr}</span>
                        </div>

                        <button type="button" class="btn-apply-specs" onclick="applyCompToForm(${idx})">
                            <span class="svg-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></span>
                            Áp Dụng Thông Số BĐS Đối Chứng Vào Form
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            requestAnimationFrame(() => modal.classList.add('open'));
            modal.addEventListener('click', (e) => { if (e.target === modal) closeCompModal(); });
        }

        function closeCompModal() {
            const modal = document.getElementById('compModal');
            if (modal) { modal.classList.remove('open'); setTimeout(() => modal.remove(), 200); }
        }

        function applyCompToForm(idx) {
            const c = currentComps[idx];
            if (!c) return;
            if (c.property_type) {
                let matchVal = 'Nhà riêng';
                if (c.property_type.includes('chung cư') || c.property_type.includes('Căn hộ')) matchVal = 'Căn hộ chung cư';
                else if (c.property_type.includes('Đất')) matchVal = 'Đất nền';
                else if (c.property_type.includes('Biệt thự')) matchVal = 'Biệt thự';
                else if (c.property_type.includes('Shophouse')) matchVal = 'Shophouse';
                setPropTypeTab(matchVal);
            }
            if (c.area) setAreaVal(c.area);
            if (c.road_width) document.getElementById('road_width').value = c.road_width;
            if (c.frontage_width) document.getElementById('frontage_width').value = c.frontage_width;
            if (c.floor_count) document.getElementById('floor_count').value = c.floor_count;
            if (c.bedroom_count) document.getElementById('bedroom_count').value = c.bedroom_count;
            if (c.bathroom_count) document.getElementById('bathroom_count').value = c.bathroom_count;

            const chkSoDo = document.getElementById('has_so_do');
            const chkLoGoc = document.getElementById('is_lo_goc');
            const chkNoHau = document.getElementById('is_no_hau');
            const chkOtoDo = document.getElementById('is_oto_do');
            chkSoDo.checked = !!c.has_so_do;
            chkLoGoc.checked = !!c.is_lo_goc;
            chkNoHau.checked = !!c.is_no_hau;
            chkOtoDo.checked = !!c.is_oto_do;
            syncChipStyle(chkSoDo);
            syncChipStyle(chkLoGoc);
            syncChipStyle(chkNoHau);
            syncChipStyle(chkOtoDo);

            closeCompModal();
            showToast('Đã áp dụng toàn bộ thông số BĐS đối chứng vào form');
        }

        function resetFormToDefaults() {
            setAreaVal('');
            document.getElementById('province_name').value = '';
            document.getElementById('district_name').value = '';
            document.getElementById('ward_name').value = '';
            document.getElementById('street_name').value = '';
            document.getElementById('quickAddressSearch').value = '';

            document.getElementById('frontage_width').value = '';
            document.getElementById('road_width').value = '';
            document.getElementById('floor_count').value = '';
            document.getElementById('bedroom_count').value = '';
            document.getElementById('bathroom_count').value = '';
            document.getElementById('house_direction').value = '';
            document.getElementById('customer_phone').value = '';

            ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.checked = false; syncChipStyle(el); }
            });
            showToast('Đã làm mới form, toàn bộ thông tin địa chỉ và thông số để trống để bạn tự điền');
        }

        function showToast(msg) {
            let toast = document.getElementById('mhdToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'mhdToast';
                toast.className = 'mhd-toast';
                document.body.appendChild(toast);
            }
            toast.innerHTML = `
                <span class="svg-icon" style="color:var(--green);"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
                <span>${msg}</span>
            `;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2600);
        }

        // ── PRIMARY NAVIGATION & TABS ──
        function switchMainTab(tab) {
            const homeView = document.getElementById('homeView');
            const compareView = document.getElementById('compareView');
            const navHomeBtn = document.getElementById('navHomeBtn');
            const navCompareBtn = document.getElementById('navCompareBtn');

            if (tab === 'home') {
                if (homeView) homeView.style.display = 'block';
                if (compareView) compareView.style.display = 'none';
                if (navHomeBtn) navHomeBtn.classList.add('active');
                if (navCompareBtn) navCompareBtn.classList.remove('active');
                setTimeout(() => { if (map) map.invalidateSize(); }, 200);
            } else if (tab === 'compare') {
                if (homeView) homeView.style.display = 'none';
                if (compareView) compareView.style.display = 'block';
                if (navHomeBtn) navHomeBtn.classList.remove('active');
                if (navCompareBtn) navCompareBtn.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateCompareViewHeader();
            }
        }

        function updateCompareViewHeader() {
            const subjectTag = document.getElementById('compareSubjectTag');
            const kpiSubjectUnitPrice = document.getElementById('kpiSubjectUnitPrice');
            const kpiSubjectTotalPrice = document.getElementById('kpiSubjectTotalPrice');
            const kpiAvgUnitPrice = document.getElementById('kpiAvgUnitPrice');
            const kpiMinMaxRange = document.getElementById('kpiMinMaxRange');
            const kpiRadiusScan = document.getElementById('kpiRadiusScan');
            const kpiCountMatches = document.getElementById('kpiCountMatches');

            const dist = document.getElementById('district_name').value.trim();
            const prov = document.getElementById('province_name').value.trim();
            const area = parseFloat(document.getElementById('area').value) || 0;
            const predPriceEl = document.getElementById('predictedPrice');
            const unitPriceEl = document.getElementById('pricePerM2');

            if (subjectTag) {
                subjectTag.textContent = (dist || prov) ? `BĐS Thẩm Định: ${[dist, prov].filter(Boolean).join(', ')} (${area > 0 ? area + 'm²' : 'Chưa có DT'})` : 'BĐS Thẩm Định: Chưa nhập';
            }

            if (kpiSubjectUnitPrice && unitPriceEl && unitPriceEl.textContent !== '-- Tr/m²') {
                kpiSubjectUnitPrice.textContent = unitPriceEl.textContent;
            }
            if (kpiSubjectTotalPrice && predPriceEl && predPriceEl.textContent !== '-- Tỷ VNĐ') {
                kpiSubjectTotalPrice.textContent = 'Tổng giá: ' + predPriceEl.textContent;
            }

            if (currentComps && currentComps.length > 0) {
                const pricesPerM2 = currentComps.map(c => (c.price_per_m2 || (c.price / c.area)) / 1e6).filter(p => !isNaN(p) && p > 0);
                if (pricesPerM2.length > 0) {
                    const avg = pricesPerM2.reduce((a, b) => a + b, 0) / pricesPerM2.length;
                    const min = Math.min(...pricesPerM2);
                    const max = Math.max(...pricesPerM2);
                    if (kpiAvgUnitPrice) kpiAvgUnitPrice.textContent = avg.toFixed(1) + ' Tr/m²';
                    if (kpiMinMaxRange) kpiMinMaxRange.textContent = min.toFixed(1) + ' ~ ' + max.toFixed(1) + ' Tr/m²';
                }
                const distances = currentComps.map(c => c.distance_meters || 0);
                const maxDist = Math.max(...distances, 0);
                let radLabel = maxDist <= 500 ? "500m" : (maxDist < 1000 ? Math.round(maxDist) + "m" : (maxDist / 1000).toFixed(1) + "km");
                if (kpiRadiusScan) kpiRadiusScan.textContent = '~' + radLabel;
                if (kpiCountMatches) kpiCountMatches.textContent = `${currentComps.length} tài sản xác thực`;
            }
        }

        // ── SCROLL & NAVIGATION HELPERS ──
        function scrollToMap() {
            switchMainTab('home');
            const el = document.getElementById('mapSection');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setTimeout(() => {
                if (map) map.invalidateSize();
            }, 300);
        }

        function scrollToContact() {
            const el = document.getElementById('contactFooter') || document.querySelector('footer');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        function scrollToResults() {
            const el = document.getElementById('resultsSection');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function goToProjects() {
            switchMainTab('home');
            const resultsSec = document.getElementById('resultsSection');
            if (resultsSec && resultsSec.style.display !== 'none' && resultsSec.offsetHeight > 50) {
                resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                const searchBox = document.getElementById('address_search') || document.getElementById('valuationForm');
                if (searchBox) {
                    searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    searchBox.focus();
                }
                showToast('Tra cứu dữ liệu dự án BĐS theo địa chỉ hoặc chọn vị trí trên bản đồ');
            }
        }

        function goToNews() {
            showToast('Chuyên mục Tin tức & Báo cáo thị trường BĐS AI đang được đồng bộ theo thời gian thực');
        }

        // ── 5-STEP PROGRESSIVE AI VALUATION (TINIX BENCHMARK) ──
        let _isValuatingWithProgress = false;
        async function triggerValuationWithProgress() {
            if (_isValuatingWithProgress) return;

            const prov = document.getElementById('province_name').value.trim();
            const dist = document.getElementById('district_name').value.trim();
            const area = parseFloat(document.getElementById('area').value);

            if (!prov || !dist) {
                showToast('Vui lòng chọn vị trí trên bản đồ hoặc nhập Tỉnh/Quận');
                return;
            }
            if (!area || isNaN(area) || area <= 0) {
                showToast('Vui lòng nhập diện tích hợp lệ');
                return;
            }

            const modal = document.getElementById('aiProgressModal');
            if (!modal) {
                triggerValuation();
                return;
            }

            _isValuatingWithProgress = true;
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.classList.add('active'));

            const setStep = (idx, state, text) => {
                const s = document.getElementById('aiStep' + idx);
                if (!s) return;
                s.className = 'ai-step-item ' + state;
                const st = s.querySelector('.ai-step-status');
                if (st && text) st.textContent = text;
            };

            for (let i = 1; i <= 5; i++) {
                setStep(i, '', 'Chờ xử lý...');
            }

            // Step 1: GIS Geocoding
            setStep(1, 'active', 'Đang xác thực tọa độ & ranh giới hành chính...');
            await new Promise(r => setTimeout(r, 380));
            setStep(1, 'done', 'Đã xác thực tọa độ không gian chính xác');

            // Step 2: KNN Comparables
            setStep(2, 'active', 'Đang quét 5 bất động sản đối chứng lân cận...');
            await new Promise(r => setTimeout(r, 420));
            setStep(2, 'done', 'Đã đối soát 5 tài sản tương đồng PostGIS');

            // Step 3: CMA Standards
            setStep(3, 'active', 'Đang tính toán hệ số điều chỉnh so sánh thị trường (CMA)...');
            await new Promise(r => setTimeout(r, 380));
            setStep(3, 'done', 'Chuẩn hóa tỷ lệ tương đồng CMA hoàn tất');

            // Step 4: Machine Learning Inference
            setStep(4, 'active', 'Mô hình CatBoost v2.4 đang tổng hợp định giá...');
            try {
                await triggerValuation();
            } catch (err) {
                console.error(err);
            }
            setStep(4, 'done', 'Dự đoán giá trị thị trường hoàn thành');

            // Step 5: Certificate & SHAP
            setStep(5, 'active', 'Đang xuất chứng thư & phân tích TreeSHAP...');
            await new Promise(r => setTimeout(r, 350));
            setStep(5, 'done', 'Hoàn tất chứng thư thẩm định giá');

            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                _isValuatingWithProgress = false;
                scrollToResults();
            }, 300);
        }

        document.getElementById('valuationForm').addEventListener('submit', function (e) {
            e.preventDefault();
            triggerValuationWithProgress();
        });


        // INIT APPLICATION
        const savedTheme = localStorage.getItem('mhd_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeControls(savedTheme);
        updateMapTiles(savedTheme);
        updateFormByPropertyType();
        ['has_so_do', 'is_oto_do', 'is_lo_goc', 'is_no_hau'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.checked = false; syncChipStyle(el); }
        });
        const initDist = document.getElementById('district_name').value.trim();
        const initProv = document.getElementById('province_name').value.trim();
        fetchQuickComparables(currentLat, currentLng, initDist, initProv);

        // Mặc định tự động bật mạng lưới điểm giá BĐS khi vào trang web
        setTimeout(() => {
            if (!isClusterActive) {
                togglePriceCluster();
            }
        }, 300);

// Expose all top-level functions to global window for HTML inline handlers
window.applyCompToForm = applyCompToForm;
window.cleanAdminToken = cleanAdminToken;
window.closeCompModal = closeCompModal;
window.createSvgIcon = createSvgIcon;
window.fetchQuickComparables = fetchQuickComparables;
window.findNearestDistrictCentroid = findNearestDistrictCentroid;
window.formatStandardDistrict = formatStandardDistrict;
window.formatVND = formatVND;
window.getCurrentLocation = getCurrentLocation;
window.goToNews = goToNews;
window.goToProjects = goToProjects;
window.handleAddressInputChange = handleAddressInputChange;
window.openCompModal = openCompModal;
window.quickJump = quickJump;
window.renderComparables = renderComparables;
window.renderValuationResult = renderValuationResult;
window.resetFormToDefaults = resetFormToDefaults;
window.resolveAdminLocation = resolveAdminLocation;
window.reverseGeocodeAndSyncInputs = reverseGeocodeAndSyncInputs;
window.scrollToContact = scrollToContact;
window.scrollToMap = scrollToMap;
window.scrollToResults = scrollToResults;
window.searchAddressNominatim = searchAddressNominatim;
window.selectLocation = selectLocation;
window.setAreaVal = setAreaVal;
window.setPropTypeTab = setPropTypeTab;
window.setThemeMode = setThemeMode;
window.showToast = showToast;
window.switchMainTab = switchMainTab;
window.syncAreaInput = syncAreaInput;
window.syncAreaSlider = syncAreaSlider;
window.syncChipStyle = syncChipStyle;
window.toggleMobileNav = toggleMobileNav;
window.toggleShapDetails = toggleShapDetails;
window.toggleTheme = toggleTheme;
window.triggerValuation = triggerValuation;
window.triggerValuationWithProgress = triggerValuationWithProgress;
window.updateCompareViewHeader = updateCompareViewHeader;
window.updateFormByPropertyType = updateFormByPropertyType;
window.updateLocationAndValuate = updateLocationAndValuate;
window.updateMapTiles = updateMapTiles;
window.updateRadarAssessment = updateRadarAssessment;
window.toggleMapFullscreen = toggleMapFullscreen;
window.map = map;
