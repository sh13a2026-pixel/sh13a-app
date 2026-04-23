// ========== MODULE DOANH TRẠI - QUẢN LÝ PHÒNG Ở, CƠ SỞ VẬT CHẤT ==========

let doanhTraiData = [];
let currentEditId = null;
let currentTab = 'phong'; // 'phong', 'giuong', 'thietBi'

function initDoanhTrai() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>🏠 QUẢN LÝ DOANH TRẠI</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="dtTongPhong">0</div><div class="stat-label">Tổng phòng</div></div>
            <div class="stat-card present"><div class="stat-value" id="dtPhongTrong">0</div><div class="stat-label">Phòng trống</div></div>
            <div class="stat-card absent"><div class="stat-value" id="dtPhongDay">0</div><div class="stat-label">Phòng đầy</div></div>
            <div class="stat-card leave"><div class="stat-value" id="dtGiuongTrong">0</div><div class="stat-label">Giường trống</div></div>
        </div>

        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="tabPhong" onclick="switchDoanhTraiTab('phong')" class="active-tab" style="flex:1; background: #2c3e50;">🏠 Quản lý phòng</button>
            <button id="tabGiuong" onclick="switchDoanhTraiTab('giuong')" style="flex:1; background: #95a5a6;">🛏️ Quản lý giường</button>
            <button id="tabThietBi" onclick="switchDoanhTraiTab('thietBi')" style="flex:1; background: #95a5a6;">🔧 Cơ sở vật chất</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchDT" placeholder="🔍 Tìm kiếm...">
            <button onclick="showAddDoanhTraiModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportDoanhTraiToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Nội dung -->
        <div id="dtContent"></div>

        <!-- Modal Thêm/Sửa -->
        <div id="dtModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="dtModalTitle">Thêm mới</h3>
                <div id="dtModalFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveDoanhTrai()" class="success">Lưu</button>
                    <button onclick="closeDtModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết -->
        <div id="dtDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CHI TIẾT</h3>
                <div id="dtDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeDtDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { background: #2c3e50 !important; color: white; }
        .room-card { background: white; border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 1px solid #eef2f6; transition: 0.2s; }
        .room-card:hover { transform: translateX(5px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .room-name { font-weight: bold; font-size: 16px; color: #1e3a5f; }
        .room-status { padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-daydu { background: #fee2e2; color: #e74c3c; }
        .status-controng { background: #d1fae5; color: #27ae60; }
        .status-sapday { background: #fed7aa; color: #f39c12; }
        .bed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-top: 10px; }
        .bed-item { background: #f8fafc; border-radius: 12px; padding: 8px; text-align: center; cursor: pointer; transition: 0.2s; }
        .bed-item:hover { background: #eef2f6; }
        .bed-occupied { background: #fee2e2; color: #e74c3c; }
        .bed-empty { background: #d1fae5; color: #27ae60; }
        .equipment-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eef2f6; }
        .equipment-name { font-weight: 500; }
        .equipment-status { font-size: 12px; padding: 2px 8px; border-radius: 12px; }
        .status-tot { background: #d1fae5; color: #27ae60; }
        .status-hong { background: #fee2e2; color: #e74c3c; }
        .status-sua { background: #fed7aa; color: #f39c12; }
    `;
    document.head.appendChild(style);
    
    loadDoanhTrai();
    
    document.getElementById('searchDT').addEventListener('input', function(e) {
        searchDoanhTrai(e.target.value);
    });
}

// Chuyển tab
function switchDoanhTraiTab(tab) {
    currentTab = tab;
    const btnPhong = document.getElementById('tabPhong');
    const btnGiuong = document.getElementById('tabGiuong');
    const btnThietBi = document.getElementById('tabThietBi');
    
    btnPhong.style.background = '#95a5a6';
    btnGiuong.style.background = '#95a5a6';
    btnThietBi.style.background = '#95a5a6';
    
    if(tab === 'phong') btnPhong.style.background = '#2c3e50';
    else if(tab === 'giuong') btnGiuong.style.background = '#2c3e50';
    else btnThietBi.style.background = '#2c3e50';
    
    displayDoanhTrai();
}

// Load dữ liệu
async function loadDoanhTrai() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('doanhTrai').get();
        doanhTraiData = [];
        snapshot.forEach(doc => {
            doanhTraiData.push({ id: doc.id, ...doc.data() });
        });
        updateDoanhTraiStats();
        displayDoanhTrai();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateDoanhTraiStats() {
    const phongList = doanhTraiData.filter(d => d.loai === 'phong');
    const tongPhong = phongList.length;
    const phongTrong = phongList.filter(p => p.trangThai === 'trong').length;
    const phongDay = phongList.filter(p => p.trangThai === 'day').length;
    
    let tongGiuong = 0;
    let giuongTrong = 0;
    doanhTraiData.filter(d => d.loai === 'giuong').forEach(g => {
        tongGiuong++;
        if(!g.nguoiO) giuongTrong++;
    });
    
    document.getElementById('dtTongPhong').innerText = tongPhong;
    document.getElementById('dtPhongTrong').innerText = phongTrong;
    document.getElementById('dtPhongDay').innerText = phongDay;
    document.getElementById('dtGiuongTrong').innerText = giuongTrong;
}

// Hiển thị nội dung
function displayDoanhTrai() {
    const container = document.getElementById('dtContent');
    if(!container) return;
    
    if(currentTab === 'phong') {
        displayPhongList(container);
    } else if(currentTab === 'giuong') {
        displayGiuongList(container);
    } else {
        displayThietBiList(container);
    }
}

// Hiển thị danh sách phòng
function displayPhongList(container) {
    const phongList = doanhTraiData.filter(d => d.loai === 'phong');
    if(phongList.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu phòng. Nhấn "Thêm" để thêm phòng.</div>';
        return;
    }
    
    let html = '';
    phongList.forEach(phong => {
        const statusClass = phong.trangThai === 'trong' ? 'status-controng' : (phong.trangThai === 'day' ? 'status-daydu' : 'status-sapday');
        const statusText = phong.trangThai === 'trong' ? 'Còn trống' : (phong.trangThai === 'day' ? 'Đã đầy' : 'Sắp đầy');
        
        html += `
            <div class="room-card" onclick="viewPhongDetail('${phong.id}')">
                <div class="room-header">
                    <div class="room-name">🏠 ${phong.tenPhong || 'Phòng ' + phong.soPhong}</div>
                    <div><span class="room-status ${statusClass}">${statusText}</span></div>
                </div>
                <div>📍 Tầng ${phong.tang || '1'} | Sức chứa: ${phong.sucChua || 0} người</div>
                <div>👥 Hiện tại: ${phong.soNguoiHienTai || 0}/${phong.sucChua || 0}</div>
                <div style="margin-top: 10px;">
                    <progress value="${phong.soNguoiHienTai || 0}" max="${phong.sucChua || 100}" style="width:100%; height:6px; border-radius:3px;"></progress>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách giường
function displayGiuongList(container) {
    const giuongList = doanhTraiData.filter(d => d.loai === 'giuong');
    if(giuongList.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu giường. Nhấn "Thêm" để thêm giường.</div>';
        return;
    }
    
    let html = '<div class="bed-grid">';
    giuongList.forEach(giuong => {
        const isOccupied = !!giuong.nguoiO;
        html += `
            <div class="bed-item ${isOccupied ? 'bed-occupied' : 'bed-empty'}" onclick="viewGiuongDetail('${giuong.id}')">
                <div><i class="fas fa-bed"></i></div>
                <div>${giuong.tenGiuong || 'Giường ' + giuong.soGiuong}</div>
                <div style="font-size: 10px;">${giuong.phongId ? `Phòng ${giuong.phongId}` : ''}</div>
                <div>${isOccupied ? `👤 ${giuong.nguoiO?.substring(0,10)}` : '🟢 Trống'}</div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Hiển thị danh sách thiết bị
function displayThietBiList(container) {
    const thietBiList = doanhTraiData.filter(d => d.loai === 'thietBi');
    if(thietBiList.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu cơ sở vật chất. Nhấn "Thêm" để thêm.</div>';
        return;
    }
    
    let html = '';
    thietBiList.forEach(tb => {
        const statusClass = tb.tinhTrang === 'tot' ? 'status-tot' : (tb.tinhTrang === 'hong' ? 'status-hong' : 'status-sua');
        const statusText = tb.tinhTrang === 'tot' ? '✅ Tốt' : (tb.tinhTrang === 'hong' ? '🔴 Hỏng' : '🟡 Đang sửa');
        
        html += `
            <div class="equipment-item" onclick="viewThietBiDetail('${tb.id}')">
                <div class="equipment-name">
                    <i class="fas ${tb.icon || 'fa-tools'}"></i> ${tb.tenThietBi}
                    <div style="font-size: 11px; color: #6c757d;">📍 ${tb.viTri || 'Chưa rõ'}</div>
                </div>
                <div>
                    <span class="equipment-status ${statusClass}">${statusText}</span>
                    <div style="font-size: 11px; margin-top: 4px;">📅 ${tb.ngayKiemTra ? new Date(tb.ngayKiemTra).toLocaleDateString() : 'Chưa kiểm tra'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Tìm kiếm
function searchDoanhTrai(keyword) {
    if(!keyword.trim()) {
        displayDoanhTrai();
        return;
    }
    const filtered = doanhTraiData.filter(item => 
        (item.tenPhong || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (item.tenThietBi || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (item.nguoiO || '').toLowerCase().includes(keyword.toLowerCase())
    );
    
    const container = document.getElementById('dtContent');
    if(currentTab === 'phong') {
        const phongFiltered = filtered.filter(d => d.loai === 'phong');
        displayPhongList(container, phongFiltered);
    } else if(currentTab === 'giuong') {
        const giuongFiltered = filtered.filter(d => d.loai === 'giuong');
        displayGiuongList(container, giuongFiltered);
    } else {
        const tbFiltered = filtered.filter(d => d.loai === 'thietBi');
        displayThietBiList(container, tbFiltered);
    }
}

// Modal thêm
function showAddDoanhTraiModal() {
    currentEditId = null;
    const modalFields = document.getElementById('dtModalFields');
    
    if(currentTab === 'phong') {
        document.getElementById('dtModalTitle').innerText = 'Thêm phòng mới';
        modalFields.innerHTML = `
            <input type="text" id="dtSoPhong" placeholder="Số phòng *">
            <input type="number" id="dtTang" placeholder="Tầng">
            <input type="number" id="dtSucChua" placeholder="Sức chứa (số người)">
            <select id="dtTrangThai">
                <option value="trong">Còn trống</option>
                <option value="sapday">Sắp đầy</option>
                <option value="day">Đã đầy</option>
            </select>
            <textarea id="dtGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else if(currentTab === 'giuong') {
        document.getElementById('dtModalTitle').innerText = 'Thêm giường mới';
        modalFields.innerHTML = `
            <input type="text" id="dtSoGiuong" placeholder="Số giường *">
            <input type="text" id="dtPhongId" placeholder="Phòng (số phòng)">
            <input type="text" id="dtViTri" placeholder="Vị trí (VD: Góc trong)">
            <select id="dtLoaiGiuong">
                <option value="don">Giường đơn</option>
                <option value="doi">Giường đôi</option>
                <option value="tren">Giường trên</option>
                <option value="duoi">Giường dưới</option>
            </select>
        `;
    } else {
        document.getElementById('dtModalTitle').innerText = 'Thêm thiết bị/cơ sở vật chất';
        modalFields.innerHTML = `
            <input type="text" id="dtTenThietBi" placeholder="Tên thiết bị *">
            <input type="text" id="dtViTri" placeholder="Vị trí">
            <select id="dtTinhTrang">
                <option value="tot">✅ Tốt</option>
                <option value="hong">🔴 Hỏng</option>
                <option value="sua">🟡 Đang sửa</option>
            </select>
            <input type="date" id="dtNgayKiemTra">
            <textarea id="dtGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    }
    document.getElementById('dtModal').style.display = 'flex';
}

// Lưu
async function saveDoanhTrai() {
    let data = { loai: currentTab, updatedAt: new Date().toISOString() };
    
    if(currentTab === 'phong') {
        const soPhong = document.getElementById('dtSoPhong')?.value.trim();
        if(!soPhong) { showToast('Vui lòng nhập số phòng!', 'error'); return; }
        data = { ...data, soPhong, tenPhong: `Phòng ${soPhong}`, tang: parseInt(document.getElementById('dtTang')?.value) || 1, sucChua: parseInt(document.getElementById('dtSucChua')?.value) || 4, trangThai: document.getElementById('dtTrangThai')?.value, soNguoiHienTai: 0, ghiChu: document.getElementById('dtGhiChu')?.value };
    } else if(currentTab === 'giuong') {
        const soGiuong = document.getElementById('dtSoGiuong')?.value.trim();
        if(!soGiuong) { showToast('Vui lòng nhập số giường!', 'error'); return; }
        data = { ...data, soGiuong, tenGiuong: `Giường ${soGiuong}`, phongId: document.getElementById('dtPhongId')?.value, viTri: document.getElementById('dtViTri')?.value, loaiGiuong: document.getElementById('dtLoaiGiuong')?.value, nguoiO: null };
    } else {
        const tenThietBi = document.getElementById('dtTenThietBi')?.value.trim();
        if(!tenThietBi) { showToast('Vui lòng nhập tên thiết bị!', 'error'); return; }
        data = { ...data, tenThietBi, viTri: document.getElementById('dtViTri')?.value, tinhTrang: document.getElementById('dtTinhTrang')?.value, ngayKiemTra: document.getElementById('dtNgayKiemTra')?.value, ghiChu: document.getElementById('dtGhiChu')?.value };
    }
    
    try {
        if(currentEditId) {
            await db.collection('doanhTrai').doc(currentEditId).update(data);
            showToast('Đã cập nhật!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('doanhTrai').add(data);
            showToast('Đã thêm mới!', 'success');
        }
        closeDtModal();
        await loadDoanhTrai();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xem chi tiết
function viewPhongDetail(id) {
    const item = doanhTraiData.find(i => i.id === id);
    if(!item) return;
    document.getElementById('dtDetailContent').innerHTML = `
        <div><strong>🏠 Phòng ${item.soPhong}</strong></div>
        <hr><div>📍 Tầng: ${item.tang || '1'}</div>
        <div>👥 Sức chứa: ${item.sucChua || 0} người</div>
        <div>📊 Hiện tại: ${item.soNguoiHienTai || 0}/${item.sucChua || 0}</div>
        <div>📝 Ghi chú: ${item.ghiChu || '---'}</div>
    `;
    document.getElementById('dtDetailModal').style.display = 'flex';
}

function viewGiuongDetail(id) {
    const item = doanhTraiData.find(i => i.id === id);
    if(!item) return;
    document.getElementById('dtDetailContent').innerHTML = `
        <div><strong>🛏️ Giường ${item.soGiuong}</strong></div>
        <hr><div>📍 Phòng: ${item.phongId || 'Chưa xếp'}</div>
        <div>📌 Vị trí: ${item.viTri || '---'}</div>
        <div>👤 Người ở: ${item.nguoiO || '🔹 Đang trống'}</div>
    `;
    document.getElementById('dtDetailModal').style.display = 'flex';
}

function viewThietBiDetail(id) {
    const item = doanhTraiData.find(i => i.id === id);
    if(!item) return;
    const statusText = item.tinhTrang === 'tot' ? '✅ Tốt' : (item.tinhTrang === 'hong' ? '🔴 Hỏng' : '🟡 Đang sửa');
    document.getElementById('dtDetailContent').innerHTML = `
        <div><strong>🔧 ${item.tenThietBi}</strong></div>
        <hr><div>📍 Vị trí: ${item.viTri || '---'}</div>
        <div>📊 Tình trạng: ${statusText}</div>
        <div>📅 Ngày kiểm tra: ${item.ngayKiemTra ? new Date(item.ngayKiemTra).toLocaleDateString() : '---'}</div>
        <div>📝 Ghi chú: ${item.ghiChu || '---'}</div>
    `;
    document.getElementById('dtDetailModal').style.display = 'flex';
}

// Xuất Excel
async function exportDoanhTraiToExcel() {
    const data = doanhTraiData.map((item, i) => {
        if(item.loai === 'phong') return { 'STT': i+1, 'Loại': 'Phòng', 'Tên': `Phòng ${item.soPhong}`, 'Tầng': item.tang, 'Sức chứa': item.sucChua, 'Trạng thái': item.trangThai };
        if(item.loai === 'giuong') return { 'STT': i+1, 'Loại': 'Giường', 'Tên': `Giường ${item.soGiuong}`, 'Phòng': item.phongId, 'Người ở': item.nguoiO || 'Trống' };
        return { 'STT': i+1, 'Loại': 'Thiết bị', 'Tên': item.tenThietBi, 'Vị trí': item.viTri, 'Tình trạng': item.tinhTrang };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doanh trại');
    XLSX.writeFile(wb, `DoanhTrai_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function closeDtModal() { document.getElementById('dtModal').style.display = 'none'; }
function closeDtDetailModal() { document.getElementById('dtDetailModal').style.display = 'none'; }
function showToast(msg, type) { const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.innerHTML = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2500); }