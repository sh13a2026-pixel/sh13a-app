// ========== MODULE HẬU CẦN - QUẢN LÝ QUÂN TRANG, VẬT TƯ ==========

let hauCanData = [];
let currentEditId = null;

function initHauCan() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📦 QUẢN LÝ HẬU CẦN - QUÂN TRANG</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="hcTotal">0</div><div class="stat-label">Tổng vật tư</div></div>
            <div class="stat-card present"><div class="stat-value" id="hcCon">0</div><div class="stat-label">Còn trong kho</div></div>
            <div class="stat-card absent"><div class="stat-value" id="hcDaXuat">0</div><div class="stat-label">Đã xuất</div></div>
            <div class="stat-card leave"><div class="stat-value" id="hcSapHet">0</div><div class="stat-label">Sắp hết</div></div>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchHC" placeholder="🔍 Tìm kiếm vật tư...">
            <button onclick="showAddVatTuModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportHauCanToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Danh sách vật tư -->
        <div id="hcList"></div>

        <!-- Modal Thêm/Sửa vật tư -->
        <div id="hcModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="hcModalTitle">Thêm vật tư mới</h3>
                <input type="text" id="hcName" placeholder="Tên vật tư *">
                <input type="text" id="hcLoai" placeholder="Loại (Quần áo/Giày dép/Trang bị...)">
                <input type="number" id="hcSoLuong" placeholder="Số lượng tồn kho">
                <input type="text" id="hcDonVi" placeholder="Đơn vị (Cái/Bộ/Đôi...)" value="Cái">
                <input type="text" id="hcViTri" placeholder="Vị trí lưu trữ (Kệ số...)">
                <input type="date" id="hcNgayNhap">
                <textarea id="hcGhiChu" rows="2" placeholder="Ghi chú"></textarea>
                <div class="modal-buttons">
                    <button onclick="saveVatTu()" class="success">Lưu</button>
                    <button onclick="closeHcModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Xuất vật tư -->
        <div id="xuatModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📤 XUẤT VẬT TƯ</h3>
                <div id="xuatInfo"></div>
                <input type="number" id="xuatSoLuong" placeholder="Số lượng xuất">
                <input type="text" id="xuatNguoiNhan" placeholder="Người nhận">
                <input type="text" id="xuatLyDo" placeholder="Lý do xuất">
                <div class="modal-buttons">
                    <button onclick="xuatVatTu()" class="success">Xác nhận xuất</button>
                    <button onclick="closeXuatModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    loadHauCan();
    
    // Tìm kiếm realtime
    document.getElementById('searchHC').addEventListener('input', function(e) {
        searchHauCan(e.target.value);
    });
}

// Load dữ liệu từ Firestore
async function loadHauCan() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('hauCan').orderBy('name').get();
        hauCanData = [];
        snapshot.forEach(doc => {
            hauCanData.push({ id: doc.id, ...doc.data() });
        });
        displayHauCanList(hauCanData);
        updateHauCanStats();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Hiển thị danh sách vật tư
function displayHauCanList(items) {
    const container = document.getElementById('hcList');
    if(!container) return;
    
    if(items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu. Nhấn "Thêm" để thêm vật tư.</div>';
        return;
    }
    
    let html = '';
    items.forEach(item => {
        const trangThai = getTrangThai(item.soLuong);
        html += `
            <div class="list-item">
                <div class="list-icon" style="background: #e67e22; color: white;">📦</div>
                <div class="list-info">
                    <div class="list-title">${item.name}</div>
                    <div class="list-desc">${item.loai || 'Vật tư'} - ${item.donVi || 'Cái'}</div>
                    <div class="list-desc">📊 Tồn: ${item.soLuong || 0} | 📍 ${item.viTri || 'Chưa xếp'}</div>
                </div>
                <div>
                    <span class="status-badge" style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; background: ${trangThai.color}; color: white;">${trangThai.text}</span>
                    <div style="margin-top: 5px;">
                        <button onclick="showXuatModal('${item.id}')" style="width: auto; padding: 5px 10px; background: #f39c12; font-size: 11px;"><i class="fas fa-arrow-right"></i> Xuất</button>
                        <button onclick="editVatTu('${item.id}')" style="width: auto; padding: 5px 10px; background: #f59e0b; font-size: 11px;"><i class="fas fa-edit"></i> Sửa</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Xác định trạng thái tồn kho
function getTrangThai(soLuong) {
    if(!soLuong || soLuong <= 0) return { text: '🔥 Hết hàng', color: '#e74c3c' };
    if(soLuong <= 5) return { text: '⚠️ Sắp hết', color: '#f39c12' };
    if(soLuong <= 20) return { text: '📦 Bình thường', color: '#3498db' };
    return { text: '✅ Dồi dào', color: '#27ae60' };
}

// Cập nhật thống kê
function updateHauCanStats() {
    const total = hauCanData.length;
    const conTrongKho = hauCanData.filter(item => (item.soLuong || 0) > 0).length;
    const daXuat = hauCanData.filter(item => (item.soLuong || 0) === 0).length;
    const sapHet = hauCanData.filter(item => (item.soLuong || 0) > 0 && (item.soLuong || 0) <= 5).length;
    
    document.getElementById('hcTotal').innerText = total;
    document.getElementById('hcCon').innerText = conTrongKho;
    document.getElementById('hcDaXuat').innerText = daXuat;
    document.getElementById('hcSapHet').innerText = sapHet;
}

// Tìm kiếm
function searchHauCan(keyword) {
    if(!keyword.trim()) {
        displayHauCanList(hauCanData);
        return;
    }
    const filtered = hauCanData.filter(item => 
        item.name.toLowerCase().includes(keyword.toLowerCase()) || 
        (item.loai || '').toLowerCase().includes(keyword.toLowerCase())
    );
    displayHauCanList(filtered);
}

// Hiển thị modal thêm
function showAddVatTuModal() {
    currentEditId = null;
    document.getElementById('hcModalTitle').innerText = 'Thêm vật tư mới';
    document.getElementById('hcName').value = '';
    document.getElementById('hcLoai').value = '';
    document.getElementById('hcSoLuong').value = '';
    document.getElementById('hcDonVi').value = 'Cái';
    document.getElementById('hcViTri').value = '';
    document.getElementById('hcNgayNhap').value = '';
    document.getElementById('hcGhiChu').value = '';
    document.getElementById('hcModal').style.display = 'flex';
}

// Sửa vật tư
function editVatTu(id) {
    const item = hauCanData.find(i => i.id === id);
    if(!item) return;
    currentEditId = id;
    document.getElementById('hcModalTitle').innerText = 'Sửa thông tin vật tư';
    document.getElementById('hcName').value = item.name || '';
    document.getElementById('hcLoai').value = item.loai || '';
    document.getElementById('hcSoLuong').value = item.soLuong || '';
    document.getElementById('hcDonVi').value = item.donVi || 'Cái';
    document.getElementById('hcViTri').value = item.viTri || '';
    document.getElementById('hcNgayNhap').value = item.ngayNhap || '';
    document.getElementById('hcGhiChu').value = item.ghiChu || '';
    document.getElementById('hcModal').style.display = 'flex';
}

// Lưu vật tư
async function saveVatTu() {
    const name = document.getElementById('hcName').value.trim();
    if(!name) {
        showToast('Vui lòng nhập tên vật tư!', 'error');
        return;
    }
    
    const data = {
        name: name,
        loai: document.getElementById('hcLoai').value,
        soLuong: parseInt(document.getElementById('hcSoLuong').value) || 0,
        donVi: document.getElementById('hcDonVi').value,
        viTri: document.getElementById('hcViTri').value,
        ngayNhap: document.getElementById('hcNgayNhap').value,
        ghiChu: document.getElementById('hcGhiChu').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if(currentEditId) {
            await db.collection('hauCan').doc(currentEditId).update(data);
            showToast('Đã cập nhật vật tư!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('hauCan').add(data);
            showToast('Đã thêm vật tư mới!', 'success');
        }
        closeHcModal();
        await loadHauCan();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Đóng modal
function closeHcModal() {
    document.getElementById('hcModal').style.display = 'none';
    currentEditId = null;
}

// Hiển thị modal xuất vật tư
let currentXuatItem = null;
function showXuatModal(id) {
    const item = hauCanData.find(i => i.id === id);
    if(!item) return;
    currentXuatItem = item;
    document.getElementById('xuatInfo').innerHTML = `
        <div class="list-item" style="padding: 0 0 15px 0;">
            <div><strong>${item.name}</strong><br>Tồn kho: ${item.soLuong || 0} ${item.donVi || 'Cái'}</div>
        </div>
    `;
    document.getElementById('xuatSoLuong').value = '';
    document.getElementById('xuatNguoiNhan').value = '';
    document.getElementById('xuatLyDo').value = '';
    document.getElementById('xuatModal').style.display = 'flex';
}

// Xuất vật tư
async function xuatVatTu() {
    const soLuongXuat = parseInt(document.getElementById('xuatSoLuong').value);
    const nguoiNhan = document.getElementById('xuatNguoiNhan').value;
    const lyDo = document.getElementById('xuatLyDo').value;
    
    if(!soLuongXuat || soLuongXuat <= 0) {
        showToast('Vui lòng nhập số lượng xuất hợp lệ!', 'error');
        return;
    }
    
    const soLuongHienTai = currentXuatItem.soLuong || 0;
    if(soLuongXuat > soLuongHienTai) {
        showToast(`Không đủ hàng! Chỉ còn ${soLuongHienTai} ${currentXuatItem.donVi}`, 'error');
        return;
    }
    
    const soLuongMoi = soLuongHienTai - soLuongXuat;
    
    try {
        // Cập nhật số lượng
        await db.collection('hauCan').doc(currentXuatItem.id).update({
            soLuong: soLuongMoi,
            updatedAt: new Date().toISOString()
        });
        
        // Ghi nhật ký xuất
        await db.collection('hauCanXuat').add({
            vatTuId: currentXuatItem.id,
            vatTuName: currentXuatItem.name,
            soLuong: soLuongXuat,
            nguoiNhan: nguoiNhan,
            lyDo: lyDo,
            thoiGian: new Date().toISOString(),
            nguoiXuat: currentUser?.email || 'Admin'
        });
        
        showToast(`Đã xuất ${soLuongXuat} ${currentXuatItem.donVi} ${currentXuatItem.name} cho ${nguoiNhan}`, 'success');
        closeXuatModal();
        await loadHauCan();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

function closeXuatModal() {
    document.getElementById('xuatModal').style.display = 'none';
    currentXuatItem = null;
}

// Xuất Excel
async function exportHauCanToExcel() {
    const data = hauCanData.map((item, i) => ({
        'STT': i + 1,
        'Tên vật tư': item.name,
        'Loại': item.loai,
        'Số lượng tồn': item.soLuong || 0,
        'Đơn vị': item.donVi,
        'Vị trí': item.viTri,
        'Ngày nhập': item.ngayNhap,
        'Ghi chú': item.ghiChu,
        'Trạng thái': getTrangThai(item.soLuong).text
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách vật tư');
    XLSX.writeFile(wb, `HauCan_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}