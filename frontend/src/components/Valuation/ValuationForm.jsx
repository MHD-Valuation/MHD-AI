import React from 'react';
import { 
    Home, Building2, Store, Layers, Castle, ShoppingBag, Hotel, 
    Sparkles, Compass, ShieldCheck, Car, CornerDownRight, Maximize2 
} from 'lucide-react';
import { PROVINCES_DATA, PROPERTY_TYPES } from '../../data/vietnamAdmin';

const ICON_MAP = {
    Home, Building2, Store, Layers, Castle, ShoppingBag, Hotel
};

export default function ValuationForm({
    formData,
    onChange,
    onSubmit,
    isLoading
}) {
    // Current province object for district cascade
    const currentProvince = PROVINCES_DATA.find(p => p.name === formData.province_name) || PROVINCES_DATA[0];

    const handleProvinceChange = (e) => {
        const provName = e.target.value;
        const pObj = PROVINCES_DATA.find(p => p.name === provName);
        onChange({
            province_name: provName,
            district_name: pObj && pObj.districts && pObj.districts.length > 0 ? pObj.districts[0] : '',
            latitude: pObj ? pObj.lat : formData.latitude,
            longitude: pObj ? pObj.lng : formData.longitude
        });
    };

    const handleToggleChip = (field) => {
        onChange({ [field]: !formData[field] });
    };

    return (
        <form onSubmit={onSubmit} className="valuation-form-card">
            {/* Header / Title */}
            <div className="form-card-header">
                <div className="form-header-badge">
                    <Sparkles size={13} />
                    <span>MÔ HÌNH HỌC MÁY CATBOOST v2.4</span>
                </div>
                <h2 className="form-main-title">Thông Tin Bất Động Sản Cần Thẩm Định</h2>
                <p className="form-sub-desc">
                    Hệ thống trích xuất đặc trưng không gian GIS và đối soát 5 BĐS tương đồng tự động
                </p>
            </div>

            {/* 1. Property Type Selector */}
            <div className="form-section">
                <label className="section-label">1. Loại hình Bất động sản</label>
                <div className="property-types-grid">
                    {PROPERTY_TYPES.map(type => {
                        const IconComponent = ICON_MAP[type.icon] || Home;
                        const isSelected = formData.property_type === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                className={`prop-type-card ${isSelected ? 'active' : ''}`}
                                onClick={() => onChange({ property_type: type.id })}
                            >
                                <IconComponent size={20} className="prop-icon" />
                                <span className="prop-name">{type.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Administrative Location Cascade */}
            <div className="form-section">
                <label className="section-label">2. Vị trí hành chính & Địa chỉ</label>
                <div className="form-grid-2">
                    <div className="form-field">
                        <label className="field-label">Tỉnh / Thành phố *</label>
                        <select
                            className="form-select"
                            value={formData.province_name}
                            onChange={handleProvinceChange}
                        >
                            {PROVINCES_DATA.map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Quận / Huyện / TP trực thuộc *</label>
                        <select
                            className="form-select"
                            value={formData.district_name}
                            onChange={(e) => onChange({ district_name: e.target.value })}
                        >
                            {currentProvince.districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: '12px' }}>
                    <div className="form-field">
                        <label className="field-label">Phường / Xã</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ví dụ: Phường Bến Nghé"
                            value={formData.ward_name}
                            onChange={(e) => onChange({ ward_name: e.target.value })}
                        />
                    </div>

                    <div className="form-field">
                        <label className="field-label">Tên đường / Số nhà</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ví dụ: 52 Trần Bình Trọng"
                            value={formData.street_name}
                            onChange={(e) => onChange({ street_name: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Physical Dimensions & Interior */}
            <div className="form-section">
                <label className="section-label">3. Thông số kỹ thuật & Diện tích</label>
                <div className="form-grid-3">
                    <div className="form-field">
                        <label className="field-label">Diện tích đất (m²) *</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="5000"
                            required
                            className="form-input font-bold"
                            value={formData.area}
                            onChange={(e) => onChange({ area: parseFloat(e.target.value) || '' })}
                        />
                    </div>

                    <div className="form-field">
                        <label className="field-label">Mặt tiền (m)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="100"
                            className="form-input"
                            value={formData.frontage_width}
                            onChange={(e) => onChange({ frontage_width: parseFloat(e.target.value) || '' })}
                        />
                    </div>

                    <div className="form-field">
                        <label className="field-label">Độ rộng đường/ngõ (m)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="100"
                            className="form-input"
                            value={formData.road_width}
                            onChange={(e) => onChange({ road_width: parseFloat(e.target.value) || '' })}
                        />
                    </div>
                </div>

                <div className="form-grid-4" style={{ marginTop: '12px' }}>
                    <div className="form-field">
                        <label className="field-label">Số tầng</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            className="form-input"
                            value={formData.floor_count}
                            onChange={(e) => onChange({ floor_count: parseInt(e.target.value) || 1 })}
                        />
                    </div>

                    <div className="form-field">
                        <label className="field-label">Phòng ngủ</label>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            className="form-input"
                            value={formData.bedroom_count}
                            onChange={(e) => onChange({ bedroom_count: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="form-field">
                        <label className="field-label">Phòng tắm / WC</label>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            className="form-input"
                            value={formData.bathroom_count}
                            onChange={(e) => onChange({ bathroom_count: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="form-field">
                        <label className="field-label">Hướng nhà</label>
                        <select
                            className="form-select"
                            value={formData.house_direction}
                            onChange={(e) => onChange({ house_direction: e.target.value })}
                        >
                            <option value="Đông">Đông</option>
                            <option value="Tây">Tây</option>
                            <option value="Nam">Nam</option>
                            <option value="Bắc">Bắc</option>
                            <option value="Đông Nam">Đông Nam</option>
                            <option value="Đông Bắc">Đông Bắc</option>
                            <option value="Tây Nam">Tây Nam</option>
                            <option value="Tây Bắc">Tây Bắc</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. Legal & Characteristic Chips */}
            <div className="form-section">
                <label className="section-label">4. Pháp lý & Lợi thế đặc trưng</label>
                <div className="chips-selector-grid">
                    <button
                        type="button"
                        className={`feature-chip-btn ${formData.has_so_do ? 'active' : ''}`}
                        onClick={() => handleToggleChip('has_so_do')}
                    >
                        <ShieldCheck size={16} />
                        <span>Có Sổ Đỏ / Sổ Hồng</span>
                    </button>

                    <button
                        type="button"
                        className={`feature-chip-btn ${formData.is_oto_do ? 'active' : ''}`}
                        onClick={() => handleToggleChip('is_oto_do')}
                    >
                        <Car size={16} />
                        <span>Ngõ Ô Tô Vào Tận Cửa</span>
                    </button>

                    <button
                        type="button"
                        className={`feature-chip-btn ${formData.is_lo_goc ? 'active' : ''}`}
                        onClick={() => handleToggleChip('is_lo_goc')}
                    >
                        <CornerDownRight size={16} />
                        <span>Vị Trí Lô Góc 2 Mặt Tiền</span>
                    </button>

                    <button
                        type="button"
                        className={`feature-chip-btn ${formData.is_no_hau ? 'active' : ''}`}
                        onClick={() => handleToggleChip('is_no_hau')}
                    >
                        <Maximize2 size={16} />
                        <span>Thế Đất Nở Hậu Phong Thủy</span>
                    </button>
                </div>
            </div>

            {/* Submit Action CTA */}
            <div className="form-submit-wrapper">
                <button
                    type="submit"
                    className="btn-submit-valuation"
                    disabled={isLoading}
                >
                    <Sparkles size={18} />
                    <span>{isLoading ? 'Hệ Thống Đang Xử Lý...' : 'THẨM ĐỊNH GIÁ BẤT ĐỘNG SẢN AI'}</span>
                </button>
                <div className="form-security-note">
                    <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5, color: 'var(--brand)' }} />
                    Dữ liệu được bảo mật & hiệu chuẩn theo Tiêu chuẩn Thẩm định giá Việt Nam
                </div>
            </div>
        </form>
    );
}
