// ========== MODULE VŨ KHÍ - QUẢN LÝ TRANG BỊ, ĐẠN DƯỢC ==========

let vuKhiData = {
    vuKhi: [],
    danDuoc: [],
    baoDuong: [],
    capPhat: []
};
let currentEditId = null;
let currentTab = 'vukhi';

function initVuKhi() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>🔫 QUẢN LÝ VŨ KHÍ - TRANG BỊ</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="vkTongVuKhi">0</div><div class="stat-label">Tổng vũ khí</div></div>
            <div class="stat-card present"><div class="stat-value" id="vkConSuDung">0</div><div class="stat-label">Còn sử dụng</div></div>
            <div class="stat-card absent"><div class="stat-value" id="vkDangBaoDuong">0</div><div class="stat-label">Đang bảo dưỡng</div></div>
            <div class="stat-card leave"><div class="stat-value" id="vkThanhLy">0</div><div class="stat-label">Đã thanh lý</div></div>
        </div>

        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px; flex-wrap: wrap;">
            <button id="tabVuKhi" onclick="switchVuKhiTab('vukhi')" class="active-tab" style="flex:1; background: #2c3e50;">🔫 Vũ khí</button>
            <button id="tabDanDuoc" onclick="switchVuKhiTab('danduoc')" style="flex:1; background: #95a5a6;">💣 Đạn dược</button>
            <button id="tabBaoDuong" onclick="switchVuKhiTab('baoduong')" style="flex:1; background: #95a5a6;">🔧 Bảo dưỡng</button>
            <button id="tabCapPhat" onclick="switchVuKhiTab('capphat')" style="flex:1; background: #95a5a6;">📋 Cấp phát</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchVK" placeholder="🔍 Tìm kiếm theo tên, số hiệu...">
            <button onclick="showAddVuKhiModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportVuKhiToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Nội dung -->
        <div id="vkContent"></div>

        <!-- Modal Thêm/Sửa -->
        <div id="vkModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="vkModalTitle">Thêm mới</h3>
                <div id="vkModalFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveVuKhi()" class="success">Lưu</button>
                    <button onclick="closeVkModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết -->
        <div id="vkDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CHI TIẾT</h3>
                <div id="vkDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeVkDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Modal Cấp phát -->
        <div id="capPhatModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CẤP PHÁT VŨ KHÍ/ĐẠN DƯỢC</h3>
                <div id="capPhatFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveCapPhat()" class="success">Xác nhận cấp phát</button>
                    <button onclick="closeCapPhatModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { background: #2c3e50 !important; color: white; }
        .weapon-card { background: white; border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 1px solid #eef2f6; transition: 0.2s; cursor: pointer; }
        .weapon-card:hover { transform: translateX(5px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .status-tot { background: #d1fae5; color: #27ae60; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-baoduong { background: #fed7aa; color: #f39c12; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-hong { background: #fee2e2; color: #e74c3c; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .ammo-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eef2f6; }
        .warning-low { color: #e74c3c; font-weight: bold; }
        .maintenance-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eef2f6; }
    `;
    document.head.appendChild(style);
    
    loadVuKhiData();
    
    document.getElementById('searchVK').addEventListener('input', function(e) {
        searchVuKhi(e.target.value);
    });
}

// Chuyển tab
function switchVuKhiTab(tab) {
    currentTab = tab;
    const btns = ['tabVuKhi', 'tabDanDuoc', 'tabBaoDuong', 'tabCapPhat'];
    btns.forEach(btn => {
        const el = document.getElementById(btn);
        if(el) el.style.background = '#95a5a6';
    });
    const activeMap = { 'vukhi': 'tabVuKhi', 'danduoc': 'tabDanDuoc', 'baoduong': 'tabBaoDuong', 'capphat': 'tabCapPhat' };
    const activeBtn = document.getElementById(activeMap[tab]);
    if(activeBtn) activeBtn.style.background = '#2c3e50';
    
    displayVuKhiContent();
}

// Load dữ liệu
async function loadVuKhiData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const [vuKhiSnap, danDuocSnap, baoDuongSnap, capPhatSnap] = await Promise.all([
            db.collection('vuKhi').get(),
            db.collection('danDuoc').get(),
            db.collection('baoDuongVuKhi').get(),
            db.collection('capPhatVuKhi').get()
        ]);
        
        vuKhiData.vuKhi = [];
        vuKhiSnap.forEach(doc => vuKhiData.vuKhi.push({ id: doc.id, ...doc.data() }));
        
        vuKhiData.danDuoc = [];
        danDuocSnap.forEach(doc => vuKhiData.danDuoc.push({ id: doc.id, ...doc.data() }));
        
        vuKhiData.baoDuong = [];
        baoDuongSnap.forEach(doc => vuKhiData.baoDuong.push({ id: doc.id, ...doc.data() }));
        
        vuKhiData.capPhat = [];
        capPhatSnap.forEach(doc => vuKhiData.capPhat.push({ id: doc.id, ...doc.data() }));
        
        updateVuKhiStats();
        displayVuKhiContent();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateVuKhiStats() {
    const tongVuKhi = vuKhiData.vuKhi.length;
    const conSuDung = vuKhiData.vuKhi.filter(v => v.trangThai === 'tot').length;
    const dangBaoDuong = vuKhiData.vuKhi.filter(v => v.trangThai === 'baoduong').length;
    const thanhLy = vuKhiData.vuKhi.filter(v => v.trangThai === 'thanhly').length;
    
    document.getElementById('vkTongVuKhi').innerText = tongVuKhi;
    document.getElementById('vkConSuDung').innerText = conSuDung;
    document.getElementById('vkDangBaoDuong').innerText = dangBaoDuong;
    document.getElementById('vkThanhLy').innerText = thanhLy;
}

// Hiển thị nội dung
function displayVuKhiContent() {
    const container = document.getElementById('vkContent');
    if(!container) return;
    
    if(currentTab === 'vukhi') {
        displayVuKhiList(container);
    } else if(currentTab === 'danduoc') {
        displayDanDuocList(container);
    } else if(currentTab === 'baoduong') {
        displayBaoDuongList(container);
    } else {
        displayCapPhatList(container);
    }
}

// Hiển thị danh sách vũ khí
function displayVuKhiList(container) {
    if(vuKhiData.vuKhi.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu vũ khí. Nhấn "Thêm" để thêm vũ khí.</div>';
        return;
    }
    
    let html = '';
    vuKhiData.vuKhi.forEach(vk => {
        const statusClass = vk.trangThai === 'tot' ? 'status-tot' : (vk.trangThai === 'baoduong' ? 'status-baoduong' : 'status-hong');
        const statusText = vk.trangThai === 'tot' ? '✅ Tốt' : (vk.trangThai === 'baoduong' ? '🟡 Bảo dưỡng' : '🔴 Hỏng/Thanh lý');
        
        html += `
            <div class="weapon-card" onclick="viewVuKhiDetail('${vk.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>🔫 ${vk.tenVuKhi}</strong><br><span style="font-size: 12px;">Số hiệu: ${vk.soHieu || '---'} | ${vk.loaiVuKhi || '---'}</span></div>
                    <div><span class="${statusClass}">${statusText}</span></div>
                </div>
                <div>📅 Năm sản xuất: ${vk.namSanXuat || '---'} | 📍 Vị trí: ${vk.viTri || '---'}</div>
                <div>👤 Người quản lý: ${vk.nguoiQuanLy || '---'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách đạn dược
function displayDanDuocList(container) {
    if(vuKhiData.danDuoc.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu đạn dược. Nhấn "Thêm" để thêm đạn dược.</div>';
        return;
    }
    
    let html = '';
    vuKhiData.danDuoc.forEach(dd => {
        const isLow = dd.soLuong && dd.soLuong < (dd.nguongCanhBao || 100);
        html += `
            <div class="ammo-card" onclick="viewDanDuocDetail('${dd.id}')">
                <div>
                    <div><strong>💣 ${dd.tenDanDuoc}</strong></div>
                    <div style="font-size: 12px;">${dd.loaiDan || '---'} | Cỡ: ${dd.cỡ || '---'}</div>
                </div>
                <div>
                    <div class="${isLow ? 'warning-low' : ''}">Số lượng: ${dd.soLuong || 0}</div>
                    <div>HSD: ${dd.hanSuDung ? new Date(dd.hanSuDung).toLocaleDateString() : '---'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách bảo dưỡng
function displayBaoDuongList(container) {
    if(vuKhiData.baoDuong.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có lịch bảo dưỡng. Nhấn "Thêm" để thêm lịch bảo dưỡng.</div>';
        return;
    }
    
    let html = '';
    vuKhiData.baoDuong.forEach(bd => {
        const vuKhi = vuKhiData.vuKhi.find(v => v.id === bd.vuKhiId);
        html += `
            <div class="maintenance-item" onclick="viewBaoDuongDetail('${bd.id}')">
                <div>
                    <div><strong>🔧 ${vuKhi?.tenVuKhi || bd.tenVuKhi}</strong></div>
                    <div style="font-size: 12px;">${bd.noiDung || 'Bảo dưỡng định kỳ'}</div>
                </div>
                <div>
                    <div>📅 ${bd.ngayBaoDuong ? new Date(bd.ngayBaoDuong).toLocaleDateString() : '---'}</div>
                    <div>👤 ${bd.nguoiThucHien || '---'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách cấp phát
function displayCapPhatList(container) {
    if(vuKhiData.capPhat.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có lịch sử cấp phát. Nhấn "Cấp phát" để tạo phiếu.</div>';
        return;
    }
    
    let html = '';
    vuKhiData.capPhat.forEach(cp => {
        html += `
            <div class="maintenance-item" onclick="viewCapPhatDetail('${cp.id}')">
                <div>
                    <div><strong>📋 ${cp.loai === 'vukhi' ? '🔫 Vũ khí' : '💣 Đạn dược'}: ${cp.tenVatTu}</strong></div>
                    <div style="font-size: 12px;">Số lượng: ${cp.soLuong} | ${cp.donVi || 'cái'}</div>
                </div>
                <div>
                    <div>📅 ${cp.ngayCapPhat ? new Date(cp.ngayCapPhat).toLocaleDateString() : '---'}</div>
                    <div>👤 Cấp cho: ${cp.nguoiNhan || '---'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Tìm kiếm
function searchVuKhi(keyword) {
    if(!keyword.trim()) {
        displayVuKhiContent();
        return;
    }
}

// Modal thêm
function showAddVuKhiModal() {
    currentEditId = null;
    const modalFields = document.getElementById('vkModalFields');
    
    if(currentTab === 'vukhi') {
        document.getElementById('vkModalTitle').innerText = 'Thêm vũ khí mới';
        modalFields.innerHTML = `
            <input type="text" id="vkTenVuKhi" placeholder="Tên vũ khí *">
            <input type="text" id="vkSoHieu" placeholder="Số hiệu">
            <select id="vkLoaiVuKhi">
                <option value="sungngan">Súng ngắn</option>
                <option value="sungtruong">Súng trường</option>
                <option value="sungsan">Súng săn</option>
                <option value="sungmay">Súng máy</option>
                <option value="lua">Tên lửa</option>
                <option value="khac">Khác</option>
            </select>
            <input type="number" id="vkNamSanXuat" placeholder="Năm sản xuất">
            <input type="text" id="vkXuatXu" placeholder="Xuất xứ">
            <select id="vkTrangThai">
                <option value="tot">✅ Tốt</option>
                <option value="baoduong">🟡 Đang bảo dưỡng</option>
                <option value="hong">🔴 Hỏng</option>
                <option value="thanhly">⚫ Thanh lý</option>
            </select>
            <input type="text" id="vkViTri" placeholder="Vị trí lưu trữ">
            <input type="text" id="vkNguoiQuanLy" placeholder="Người quản lý">
            <textarea id="vkGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else if(currentTab === 'danduoc') {
        document.getElementById('vkModalTitle').innerText = 'Thêm đạn dược mới';
        modalFields.innerHTML = `
            <input type="text" id="vkTenDanDuoc" placeholder="Tên đạn/dược phẩm *">
            <select id="vkLoaiDan">
                <option value="dan">Đạn</option>
                <option value="lua">Tên lửa</option>
                <option value="thuocno">Thuốc nổ</option>
                <option value="phuokien">Phụ kiện</option>
            </select>
            <input type="text" id="vkCo" placeholder="Cỡ đạn / thông số">
            <input type="number" id="vkSoLuong" placeholder="Số lượng tồn">
            <input type="number" id="vkNguongCanhBao" placeholder="Ngưỡng cảnh báo (số lượng tối thiểu)">
            <input type="date" id="vkHanSuDung">
            <input type="text" id="vkViTri" placeholder="Vị trí lưu trữ">
            <textarea id="vkGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else if(currentTab === 'baoduong') {
        document.getElementById('vkModalTitle').innerText = 'Thêm lịch bảo dưỡng';
        modalFields.innerHTML = `
            <select id="vkChonVuKhi"></select>
            <input type="text" id="vkNoiDungBaoDuong" placeholder="Nội dung bảo dưỡng">
            <input type="date" id="vkNgayBaoDuong">
            <input type="text" id="vkNguoiThucHien" placeholder="Người thực hiện">
            <textarea id="vkKetQua" rows="2" placeholder="Kết quả bảo dưỡng"></textarea>
        `;
        const select = document.getElementById('vkChonVuKhi');
        select.innerHTML = '<option value="">-- Chọn vũ khí --</option>';
        vuKhiData.vuKhi.forEach(vk => {
            select.innerHTML += `<option value="${vk.id}">${vk.tenVuKhi} (${vk.soHieu || 'không số'})</option>`;
        });
    }
    document.getElementById('vkModal').style.display = 'flex';
}

// Lưu
async function saveVuKhi() {
    let data = { updatedAt: new Date().toISOString() };
    let collection = '';
    
    if(currentTab === 'vukhi') {
        const ten = document.getElementById('vkTenVuKhi')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên vũ khí!', 'error'); return; }
        data = { ...data, tenVuKhi: ten, soHieu: document.getElementById('vkSoHieu')?.value, loaiVuKhi: document.getElementById('vkLoaiVuKhi')?.value, namSanXuat: parseInt(document.getElementById('vkNamSanXuat')?.value), xuatXu: document.getElementById('vkXuatXu')?.value, trangThai: document.getElementById('vkTrangThai')?.value, viTri: document.getElementById('vkViTri')?.value, nguoiQuanLy: document.getElementById('vkNguoiQuanLy')?.value, ghiChu: document.getElementById('vkGhiChu')?.value };
        collection = 'vuKhi';
    } else if(currentTab === 'danduoc') {
        const ten = document.getElementById('vkTenDanDuoc')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên đạn dược!', 'error'); return; }
        data = { ...data, tenDanDuoc: ten, loaiDan: document.getElementById('vkLoaiDan')?.value, cỡ: document.getElementById('vkCo')?.value, soLuong: parseInt(document.getElementById('vkSoLuong')?.value) || 0, nguongCanhBao: parseInt(document.getElementById('vkNguongCanhBao')?.value) || 100, hanSuDung: document.getElementById('vkHanSuDung')?.value, viTri: document.getElementById('vkViTri')?.value, ghiChu: document.getElementById('vkGhiChu')?.value };
        collection = 'danDuoc';
    } else if(currentTab === 'baoduong') {
        const vuKhiId = document.getElementById('vkChonVuKhi')?.value;
        if(!vuKhiId) { showToast('Vui lòng chọn vũ khí!', 'error'); return; }
        const vuKhi = vuKhiData.vuKhi.find(v => v.id === vuKhiId);
        data = { ...data, vuKhiId: vuKhiId, tenVuKhi: vuKhi?.tenVuKhi, noiDung: document.getElementById('vkNoiDungBaoDuong')?.value, ngayBaoDuong: document.getElementById('vkNgayBaoDuong')?.value, nguoiThucHien: document.getElementById('vkNguoiThucHien')?.value, ketQua: document.getElementById('vkKetQua')?.value };
        collection = 'baoDuongVuKhi';
    }
    
    try {
        if(currentEditId) {
            await db.collection(collection).doc(currentEditId).update(data);
            showToast('Đã cập nhật!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection(collection).add(data);
            showToast('Đã thêm mới!', 'success');
        }
        closeVkModal();
        await loadVuKhiData();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Mở modal cấp phát
function openCapPhatModal() {
    document.getElementById('capPhatFields').innerHTML = `
        <select id="cpLoai" onchange="toggleCapPhatType()" style="margin-bottom: 10px;">
            <option value="vukhi">🔫 Cấp phát vũ khí</option>
            <option value="danduoc">💣 Cấp phát đạn dược</option>
        </select>
        <select id="cpVatTuId" style="margin-bottom: 10px;"></select>
        <input type="number" id="cpSoLuong" placeholder="Số lượng cấp phát">
        <input type="text" id="cpDonVi" placeholder="Đơn vị tính">
        <input type="text" id="cpNguoiNhan" placeholder="Người/đơn vị nhận">
        <input type="text" id="cpLyDo" placeholder="Lý do cấp phát">
        <input type="date" id="cpNgayCapPhat">
    `;
    toggleCapPhatType();
    document.getElementById('capPhatModal').style.display = 'flex';
}

function toggleCapPhatType() {
    const loai = document.getElementById('cpLoai').value;
    const select = document.getElementById('cpVatTuId');
    select.innerHTML = '<option value="">-- Chọn --</option>';
    
    if(loai === 'vukhi') {
        vuKhiData.vuKhi.forEach(vk => {
            select.innerHTML += `<option value="${vk.id}" data-ton="${vk.trangThai === 'tot' ? 1 : 0}">${vk.tenVuKhi} (${vk.soHieu || 'không số'}) - ${vk.trangThai === 'tot' ? '✅ Khả dụng' : '⚠️ Không khả dụng'}</option>`;
        });
    } else {
        vuKhiData.danDuoc.forEach(dd => {
            select.innerHTML += `<option value="${dd.id}" data-ton="${dd.soLuong || 0}">${dd.tenDanDuoc} - Tồn: ${dd.soLuong || 0}</option>`;
        });
    }
}

async function saveCapPhat() {
    const loai = document.getElementById('cpLoai').value;
    const vatTuId = document.getElementById('cpVatTuId').value;
    const soLuong = parseInt(document.getElementById('cpSoLuong').value);
    
    if(!vatTuId || !soLuong) { showToast('Chọn vật tư và nhập số lượng!', 'error'); return; }
    
    let tenVatTu = '';
    if(loai === 'vukhi') {
        const vk = vuKhiData.vuKhi.find(v => v.id === vatTuId);
        tenVatTu = vk?.tenVuKhi;
        if(vk?.trangThai !== 'tot') { showToast('Vũ khí không khả dụng để cấp phát!', 'error'); return; }
        await db.collection('vuKhi').doc(vatTuId).update({ trangThai: 'capphat', nguoiNhan: document.getElementById('cpNguoiNhan').value, ngayCapPhat: document.getElementById('cpNgayCapPhat').value });
    } else {
        const dd = vuKhiData.danDuoc.find(d => d.id === vatTuId);
        tenVatTu = dd?.tenDanDuoc;
        if(dd.soLuong < soLuong) { showToast('Không đủ số lượng đạn dược trong kho!', 'error'); return; }
        await db.collection('danDuoc').doc(vatTuId).update({ soLuong: dd.soLuong - soLuong });
    }
    
    await db.collection('capPhatVuKhi').add({
        loai: loai,
        vatTuId: vatTuId,
        tenVatTu: tenVatTu,
        soLuong: soLuong,
        donVi: document.getElementById('cpDonVi').value,
        nguoiNhan: document.getElementById('cpNguoiNhan').value,
        lyDo: document.getElementById('cpLyDo').value,
        ngayCapPhat: document.getElementById('cpNgayCapPhat').value || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    });
    
    showToast('Đã cấp phát thành công!', 'success');
    closeCapPhatModal();
    await loadVuKhiData();
}

// Xuất Excel
async function exportVuKhiToExcel() {
    let data = [];
    if(currentTab === 'vukhi') {
        data = vuKhiData.vuKhi.map((v, i) => ({ 'STT': i+1, 'Tên vũ khí': v.tenVuKhi, 'Số hiệu': v.soHieu, 'Loại': v.loaiVuKhi, 'Năm SX': v.namSanXuat, 'Xuất xứ': v.xuatXu, 'Trạng thái': v.trangThai, 'Vị trí': v.viTri, 'QL bởi': v.nguoiQuanLy }));
    } else if(currentTab === 'danduoc') {
        data = vuKhiData.danDuoc.map((d, i) => ({ 'STT': i+1, 'Tên': d.tenDanDuoc, 'Loại': d.loaiDan, 'Cỡ': d.cỡ, 'Số lượng': d.soLuong, 'HSD': d.hanSuDung, 'Vị trí': d.viTri }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vũ khí');
    XLSX.writeFile(wb, `VuKhi_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function closeVkModal() { document.getElementById('vkModal').style.display = 'none'; }
function closeVkDetailModal() { document.getElementById('vkDetailModal').style.display = 'none'; }
function closeCapPhatModal() { document.getElementById('capPhatModal').style.display = 'none'; }
function showToast(msg, type) { const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.innerHTML = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2500); }