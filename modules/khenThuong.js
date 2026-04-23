// ========== MODULE KHEN THƯỞNG - KỶ LUẬT ==========

let khenThuongData = [];
let currentEditId = null;
let currentType = 'khenThuong'; // 'khenThuong' hoặc 'kyLuat'

function initKhenThuong() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>🏆 QUẢN LÝ KHEN THƯỞNG - KỶ LUẬT</h3></div>
        
        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="btnKhenThuong" onclick="switchKhenThuongTab('khenThuong')" class="active-tab" style="flex:1; background: #27ae60;">🏆 Khen thưởng</button>
            <button id="btnKyLuat" onclick="switchKhenThuongTab('kyLuat')" style="flex:1; background: #95a5a6;">⚠️ Kỷ luật</button>
        </div>

        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="ktTotal">0</div><div class="stat-label">Tổng số</div></div>
            <div class="stat-card present"><div class="stat-value" id="ktTrongNam">0</div><div class="stat-label">Trong năm</div></div>
            <div class="stat-card absent"><div class="stat-value" id="ktThangNay">0</div><div class="stat-label">Tháng này</div></div>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchKT" placeholder="🔍 Tìm kiếm theo tên...">
            <button onclick="showAddKhenThuongModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportKhenThuongToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Danh sách -->
        <div id="ktList"></div>

        <!-- Modal Thêm/Sửa -->
        <div id="ktModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="ktModalTitle">Thêm mới</h3>
                <select id="ktLoaiHinh" style="margin-bottom: 10px;">
                    <option value="khenThuong">🏆 Khen thưởng</option>
                    <option value="kyLuat">⚠️ Kỷ luật</option>
                </select>
                <input type="text" id="ktTen" placeholder="Tên quân nhân *">
                <input type="text" id="ktNoiDung" placeholder="Nội dung *">
                <select id="ktMucDo">
                    <option value="1">Cấp 1 (Thấp nhất)</option>
                    <option value="2">Cấp 2</option>
                    <option value="3">Cấp 3</option>
                    <option value="4">Cấp 4</option>
                    <option value="5">Cấp 5 (Cao nhất)</option>
                </select>
                <input type="date" id="ktNgay">
                <input type="text" id="ktQuyetDinh" placeholder="Số quyết định">
                <input type="text" id="ktDonVi" placeholder="Đơn vị quyết định">
                <textarea id="ktGhiChu" rows="2" placeholder="Ghi chú"></textarea>
                <div class="modal-buttons">
                    <button onclick="saveKhenThuong()" class="success">Lưu</button>
                    <button onclick="closeKtModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    // CSS cho nút tab
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { opacity: 1; filter: brightness(1); }
        .status-khenthuong { background: #d1fae5; color: #065f46; }
        .status-kyluat { background: #fee2e2; color: #991b1b; }
    `;
    document.head.appendChild(style);
    
    loadKhenThuong();
    
    // Tìm kiếm
    document.getElementById('searchKT').addEventListener('input', function(e) {
        searchKhenThuong(e.target.value);
    });
}

// Chuyển tab giữa Khen thưởng và Kỷ luật
function switchKhenThuongTab(type) {
    currentType = type;
    
    // Cập nhật style button
    const btnKhen = document.getElementById('btnKhenThuong');
    const btnKyLuat = document.getElementById('btnKyLuat');
    
    if(type === 'khenThuong') {
        btnKhen.style.background = '#27ae60';
        btnKyLuat.style.background = '#95a5a6';
    } else {
        btnKhen.style.background = '#95a5a6';
        btnKyLuat.style.background = '#e74c3c';
    }
    
    // Load lại dữ liệu theo loại
    displayKhenThuongByType();
}

// Load dữ liệu từ Firestore
async function loadKhenThuong() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('khenThuong').orderBy('ngay', 'desc').get();
        khenThuongData = [];
        snapshot.forEach(doc => {
            khenThuongData.push({ id: doc.id, ...doc.data() });
        });
        displayKhenThuongByType();
        updateKhenThuongStats();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Hiển thị theo loại
function displayKhenThuongByType() {
    const filtered = khenThuongData.filter(item => item.loai === currentType);
    displayKhenThuongList(filtered);
}

// Hiển thị danh sách
function displayKhenThuongList(items) {
    const container = document.getElementById('ktList');
    if(!container) return;
    
    if(items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu. Nhấn "Thêm" để thêm mới.</div>';
        return;
    }
    
    let html = '';
    items.forEach(item => {
        const icon = item.loai === 'khenThuong' ? '🏆' : '⚠️';
        const bgColor = item.loai === 'khenThuong' ? '#27ae60' : '#e74c3c';
        const mucDoText = getMucDoText(item.mucDo);
        
        html += `
            <div class="list-item">
                <div class="list-icon" style="background: ${bgColor}; color: white;">${icon}</div>
                <div class="list-info">
                    <div class="list-title">${item.tenQuanNhan}</div>
                    <div class="list-desc"><strong>${item.noiDung}</strong></div>
                    <div class="list-desc">📅 ${item.ngay || 'Chưa có ngày'} | 📄 ${item.quyetDinh || 'Chưa có QĐ'}</div>
                    <div class="list-desc">🏢 ${item.donVi || 'Đơn vị'} | ⭐ ${mucDoText}</div>
                </div>
                <div>
                    <span class="status-badge" style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; background: ${bgColor}20; color: ${bgColor};">${item.loai === 'khenThuong' ? 'Khen thưởng' : 'Kỷ luật'}</span>
                    <div style="margin-top: 5px;">
                        <button onclick="editKhenThuong('${item.id}')" style="width: auto; padding: 5px 10px; background: #f59e0b; font-size: 11px;"><i class="fas fa-edit"></i> Sửa</button>
                        <button onclick="deleteKhenThuong('${item.id}')" style="width: auto; padding: 5px 10px; background: #e74c3c; font-size: 11px;"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Lấy text mức độ
function getMucDoText(mucDo) {
    const levels = {
        '1': 'Cấp 1 (Nhắc nhở)',
        '2': 'Cấp 2 (Khiển trách)',
        '3': 'Cấp 3 (Cảnh cáo)',
        '4': 'Cấp 4 (Hạ bậc lương)',
        '5': 'Cấp 5 (Cao nhất)'
    };
    return levels[mucDo] || 'Cấp 3';
}

// Cập nhật thống kê
function updateKhenThuongStats() {
    const total = khenThuongData.length;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const trongNam = khenThuongData.filter(item => {
        if(!item.ngay) return false;
        return new Date(item.ngay).getFullYear() === currentYear;
    }).length;
    
    const thangNay = khenThuongData.filter(item => {
        if(!item.ngay) return false;
        const d = new Date(item.ngay);
        return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    }).length;
    
    document.getElementById('ktTotal').innerText = total;
    document.getElementById('ktTrongNam').innerText = trongNam;
    document.getElementById('ktThangNay').innerText = thangNay;
}

// Tìm kiếm
function searchKhenThuong(keyword) {
    if(!keyword.trim()) {
        displayKhenThuongByType();
        return;
    }
    const filtered = khenThuongData.filter(item => 
        item.loai === currentType && (
            (item.tenQuanNhan || '').toLowerCase().includes(keyword.toLowerCase()) ||
            (item.noiDung || '').toLowerCase().includes(keyword.toLowerCase())
        )
    );
    displayKhenThuongList(filtered);
}

// Hiển thị modal thêm
function showAddKhenThuongModal() {
    currentEditId = null;
    document.getElementById('ktModalTitle').innerText = currentType === 'khenThuong' ? 'Thêm khen thưởng' : 'Thêm kỷ luật';
    document.getElementById('ktLoaiHinh').value = currentType;
    document.getElementById('ktTen').value = '';
    document.getElementById('ktNoiDung').value = '';
    document.getElementById('ktMucDo').value = '3';
    document.getElementById('ktNgay').value = new Date().toISOString().split('T')[0];
    document.getElementById('ktQuyetDinh').value = '';
    document.getElementById('ktDonVi').value = 'Đại đội 1';
    document.getElementById('ktGhiChu').value = '';
    document.getElementById('ktModal').style.display = 'flex';
}

// Sửa
function editKhenThuong(id) {
    const item = khenThuongData.find(i => i.id === id);
    if(!item) return;
    currentEditId = id;
    document.getElementById('ktModalTitle').innerText = item.loai === 'khenThuong' ? 'Sửa khen thưởng' : 'Sửa kỷ luật';
    document.getElementById('ktLoaiHinh').value = item.loai;
    document.getElementById('ktTen').value = item.tenQuanNhan || '';
    document.getElementById('ktNoiDung').value = item.noiDung || '';
    document.getElementById('ktMucDo').value = item.mucDo || '3';
    document.getElementById('ktNgay').value = item.ngay || '';
    document.getElementById('ktQuyetDinh').value = item.quyetDinh || '';
    document.getElementById('ktDonVi').value = item.donVi || '';
    document.getElementById('ktGhiChu').value = item.ghiChu || '';
    document.getElementById('ktModal').style.display = 'flex';
}

// Lưu
async function saveKhenThuong() {
    const ten = document.getElementById('ktTen').value.trim();
    const noiDung = document.getElementById('ktNoiDung').value.trim();
    
    if(!ten || !noiDung) {
        showToast('Vui lòng nhập tên và nội dung!', 'error');
        return;
    }
    
    const data = {
        loai: document.getElementById('ktLoaiHinh').value,
        tenQuanNhan: ten,
        noiDung: noiDung,
        mucDo: document.getElementById('ktMucDo').value,
        ngay: document.getElementById('ktNgay').value,
        quyetDinh: document.getElementById('ktQuyetDinh').value,
        donVi: document.getElementById('ktDonVi').value,
        ghiChu: document.getElementById('ktGhiChu').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if(currentEditId) {
            await db.collection('khenThuong').doc(currentEditId).update(data);
            showToast('Đã cập nhật!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('khenThuong').add(data);
            showToast('Đã thêm mới!', 'success');
        }
        closeKtModal();
        await loadKhenThuong();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xóa
async function deleteKhenThuong(id) {
    if(confirm('Bạn có chắc muốn xóa mục này?')) {
        try {
            await db.collection('khenThuong').doc(id).delete();
            showToast('Đã xóa!', 'success');
            await loadKhenThuong();
        } catch(error) {
            showToast('Lỗi: ' + error.message, 'error');
        }
    }
}

// Đóng modal
function closeKtModal() {
    document.getElementById('ktModal').style.display = 'none';
    currentEditId = null;
}

// Xuất Excel
async function exportKhenThuongToExcel() {
    const data = khenThuongData.filter(item => item.loai === currentType).map((item, i) => ({
        'STT': i + 1,
        'Họ tên': item.tenQuanNhan,
        'Nội dung': item.noiDung,
        'Mức độ': getMucDoText(item.mucDo),
        'Ngày': item.ngay,
        'Số quyết định': item.quyetDinh,
        'Đơn vị': item.donVi,
        'Loại': item.loai === 'khenThuong' ? 'Khen thưởng' : 'Kỷ luật',
        'Ghi chú': item.ghiChu
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentType === 'khenThuong' ? 'Khen thưởng' : 'Kỷ luật');
    XLSX.writeFile(wb, `${currentType === 'khenThuong' ? 'KhenThuong' : 'KyLuat'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}