// ========== MODULE Y TẾ - QUẢN LÝ SỨC KHỎE, KHÁM BỆNH, THUỐC ==========

let yTeData = {
    benhNhan: [],
    thuoc: [],
    khamBenh: []
};
let currentEditId = null;
let currentTab = 'benhnhan';

function initYTe() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>🏥 QUẢN LÝ Y TẾ</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="ytTongBenhNhan">0</div><div class="stat-label">Tổng bệnh nhân</div></div>
            <div class="stat-card present"><div class="stat-value" id="ytDangDieuTri">0</div><div class="stat-label">Đang điều trị</div></div>
            <div class="stat-card absent"><div class="stat-value" id="ytKhoiBenh">0</div><div class="stat-label">Đã khỏi</div></div>
            <div class="stat-card leave"><div class="stat-value" id="ytLoaiThuoc">0</div><div class="stat-label">Loại thuốc</div></div>
        </div>

        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="tabBenhNhan" onclick="switchYTeTab('benhnhan')" class="active-tab" style="flex:1; background: #2c3e50;">👨‍⚕️ Bệnh nhân</button>
            <button id="tabThuoc" onclick="switchYTeTab('thuoc')" style="flex:1; background: #95a5a6;">💊 Tủ thuốc</button>
            <button id="tabKham" onclick="switchYTeTab('kham')" style="flex:1; background: #95a5a6;">📋 Lịch khám</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchYT" placeholder="🔍 Tìm kiếm...">
            <button onclick="showAddYTeModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportYTeToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Nội dung -->
        <div id="ytContent"></div>

        <!-- Modal Thêm/Sửa -->
        <div id="ytModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="ytModalTitle">Thêm mới</h3>
                <div id="ytModalFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveYTe()" class="success">Lưu</button>
                    <button onclick="closeYtModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết -->
        <div id="ytDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CHI TIẾT</h3>
                <div id="ytDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeYtDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Modal Kê đơn -->
        <div id="donThuocModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📝 KÊ ĐƠN THUỐC</h3>
                <div id="donThuocContent"></div>
                <select id="thuocSelect" style="margin: 10px 0;"></select>
                <input type="number" id="soLuongThuoc" placeholder="Số lượng">
                <textarea id="lieuTrinh" rows="2" placeholder="Liệu trình (VD: 2 lần/ngày x 5 ngày)"></textarea>
                <div class="modal-buttons">
                    <button onclick="addThuocToDon()" class="success">Thêm thuốc</button>
                    <button onclick="saveDonThuoc()" class="success" style="background:#27ae60;">Lưu đơn</button>
                    <button onclick="closeDonThuocModal()" class="danger">Đóng</button>
                </div>
                <hr>
                <div id="danhSachThuocDaChon"></div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { background: #2c3e50 !important; color: white; }
        .health-card { background: white; border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 1px solid #eef2f6; transition: 0.2s; cursor: pointer; }
        .health-card:hover { transform: translateX(5px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .status-dieutri { background: #fed7aa; color: #f39c12; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-khoi { background: #d1fae5; color: #27ae60; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-nang { background: #fee2e2; color: #e74c3c; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .med-card { background: #f8fafc; border-radius: 12px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
        .med-name { font-weight: 500; color: #1e3a5f; }
        .med-expired { color: #e74c3c; font-size: 11px; }
        .appointment-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eef2f6; }
    `;
    document.head.appendChild(style);
    
    loadYTeData();
    
    document.getElementById('searchYT').addEventListener('input', function(e) {
        searchYTe(e.target.value);
    });
}

// Chuyển tab
function switchYTeTab(tab) {
    currentTab = tab;
    const btnBenhNhan = document.getElementById('tabBenhNhan');
    const btnThuoc = document.getElementById('tabThuoc');
    const btnKham = document.getElementById('tabKham');
    
    btnBenhNhan.style.background = '#95a5a6';
    btnThuoc.style.background = '#95a5a6';
    btnKham.style.background = '#95a5a6';
    
    if(tab === 'benhnhan') btnBenhNhan.style.background = '#2c3e50';
    else if(tab === 'thuoc') btnThuoc.style.background = '#2c3e50';
    else btnKham.style.background = '#2c3e50';
    
    displayYTeContent();
}

// Load dữ liệu
async function loadYTeData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const [benhNhanSnap, thuocSnap, khamSnap] = await Promise.all([
            db.collection('yTeBenhNhan').get(),
            db.collection('yTeThuoc').get(),
            db.collection('yTeKhamBenh').get()
        ]);
        
        yTeData.benhNhan = [];
        benhNhanSnap.forEach(doc => yTeData.benhNhan.push({ id: doc.id, ...doc.data() }));
        
        yTeData.thuoc = [];
        thuocSnap.forEach(doc => yTeData.thuoc.push({ id: doc.id, ...doc.data() }));
        
        yTeData.khamBenh = [];
        khamSnap.forEach(doc => yTeData.khamBenh.push({ id: doc.id, ...doc.data() }));
        
        updateYTeStats();
        displayYTeContent();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateYTeStats() {
    const tongBenhNhan = yTeData.benhNhan.length;
    const dangDieuTri = yTeData.benhNhan.filter(b => b.trangThai === 'dieutri').length;
    const khoiBenh = yTeData.benhNhan.filter(b => b.trangThai === 'khoi').length;
    const loaiThuoc = yTeData.thuoc.length;
    
    document.getElementById('ytTongBenhNhan').innerText = tongBenhNhan;
    document.getElementById('ytDangDieuTri').innerText = dangDieuTri;
    document.getElementById('ytKhoiBenh').innerText = khoiBenh;
    document.getElementById('ytLoaiThuoc').innerText = loaiThuoc;
}

// Hiển thị nội dung
function displayYTeContent() {
    const container = document.getElementById('ytContent');
    if(!container) return;
    
    if(currentTab === 'benhnhan') {
        displayBenhNhanList(container);
    } else if(currentTab === 'thuoc') {
        displayThuocList(container);
    } else {
        displayKhamList(container);
    }
}

// Hiển thị danh sách bệnh nhân
function displayBenhNhanList(container) {
    if(yTeData.benhNhan.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu bệnh nhân. Nhấn "Thêm" để thêm bệnh nhân.</div>';
        return;
    }
    
    let html = '';
    yTeData.benhNhan.forEach(bn => {
        const statusClass = bn.trangThai === 'dieutri' ? 'status-dieutri' : (bn.trangThai === 'khoi' ? 'status-khoi' : 'status-nang');
        const statusText = bn.trangThai === 'dieutri' ? '🟡 Đang điều trị' : (bn.trangThai === 'khoi' ? '✅ Đã khỏi' : '🔴 Nặng');
        
        html += `
            <div class="health-card" onclick="viewBenhNhanDetail('${bn.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>👨‍⚕️ ${bn.tenBenhNhan}</strong><br><span style="font-size: 12px; color: #6c757d;">${bn.chucVu || 'Chiến sĩ'} - ${bn.donVi || ''}</span></div>
                    <div><span class="${statusClass}">${statusText}</span></div>
                </div>
                <div>🩺 Chẩn đoán: ${bn.chuanDoan || '---'}</div>
                <div>📅 Nhập viện: ${bn.ngayNhapVien ? new Date(bn.ngayNhapVien).toLocaleDateString() : '---'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách thuốc
function displayThuocList(container) {
    if(yTeData.thuoc.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu thuốc. Nhấn "Thêm" để thêm thuốc.</div>';
        return;
    }
    
    let html = '';
    yTeData.thuoc.forEach(thuoc => {
        const isExpired = thuoc.hanSuDung && new Date(thuoc.hanSuDung) < new Date();
        html += `
            <div class="med-card" onclick="viewThuocDetail('${thuoc.id}')">
                <div>
                    <div class="med-name">💊 ${thuoc.tenThuoc}</div>
                    <div style="font-size: 12px;">${thuoc.dangBaoChe || 'Viên'} - ${thuoc.hamLuong || ''}</div>
                </div>
                <div>
                    <div>Số lượng: ${thuoc.soLuong || 0}</div>
                    <div class="${isExpired ? 'med-expired' : ''}">HSD: ${thuoc.hanSuDung ? new Date(thuoc.hanSuDung).toLocaleDateString() : '---'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách lịch khám
function displayKhamList(container) {
    if(yTeData.khamBenh.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có lịch khám. Nhấn "Thêm" để thêm lịch khám.</div>';
        return;
    }
    
    let html = '';
    yTeData.khamBenh.forEach(kham => {
        const benhNhan = yTeData.benhNhan.find(b => b.id === kham.benhNhanId);
        html += `
            <div class="appointment-item" onclick="viewKhamDetail('${kham.id}')">
                <div>
                    <div><strong>👨‍⚕️ ${benhNhan?.tenBenhNhan || kham.tenBenhNhan}</strong></div>
                    <div style="font-size: 12px;">${kham.trieuChung || '---'}</div>
                </div>
                <div>
                    <div>📅 ${kham.ngayKham ? new Date(kham.ngayKham).toLocaleDateString() : '---'}</div>
                    <div>👨‍⚕️ BS. ${kham.bacSi || 'Chưa phân công'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Tìm kiếm
function searchYTe(keyword) {
    if(!keyword.trim()) {
        displayYTeContent();
        return;
    }
    
    if(currentTab === 'benhnhan') {
        const filtered = yTeData.benhNhan.filter(b => b.tenBenhNhan?.toLowerCase().includes(keyword.toLowerCase()));
        displayBenhNhanList(document.getElementById('ytContent'), filtered);
    } else if(currentTab === 'thuoc') {
        const filtered = yTeData.thuoc.filter(t => t.tenThuoc?.toLowerCase().includes(keyword.toLowerCase()));
        displayThuocList(document.getElementById('ytContent'), filtered);
    }
}

// Modal thêm
function showAddYTeModal() {
    currentEditId = null;
    const modalFields = document.getElementById('ytModalFields');
    
    if(currentTab === 'benhnhan') {
        document.getElementById('ytModalTitle').innerText = 'Thêm bệnh nhân mới';
        modalFields.innerHTML = `
            <input type="text" id="ytTen" placeholder="Họ tên bệnh nhân *">
            <input type="text" id="ytChucVu" placeholder="Chức vụ">
            <input type="text" id="ytDonVi" placeholder="Đơn vị">
            <input type="text" id="ytChuanDoan" placeholder="Chẩn đoán">
            <input type="date" id="ytNgayNhapVien">
            <select id="ytTrangThai">
                <option value="dieutri">Đang điều trị</option>
                <option value="khoi">Đã khỏi</option>
                <option value="nang">Nặng</option>
            </select>
            <textarea id="ytGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else if(currentTab === 'thuoc') {
        document.getElementById('ytModalTitle').innerText = 'Thêm thuốc mới';
        modalFields.innerHTML = `
            <input type="text" id="ytTenThuoc" placeholder="Tên thuốc *">
            <input type="text" id="ytHamLuong" placeholder="Hàm lượng (VD: 500mg)">
            <select id="ytDangBaoChe">
                <option value="vien">Viên nén</option>
                <option value="nuoc">Dung dịch</option>
                <option value="tiem">Dạng tiêm</option>
                <option value="bot">Bột</option>
            </select>
            <input type="number" id="ytSoLuong" placeholder="Số lượng tồn">
            <input type="date" id="ytHanSuDung">
            <input type="text" id="ytCongDung" placeholder="Công dụng">
            <textarea id="ytGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else {
        document.getElementById('ytModalTitle').innerText = 'Thêm lịch khám';
        modalFields.innerHTML = `
            <select id="ytBenhNhanId"></select>
            <input type="text" id="ytTrieuChung" placeholder="Triệu chứng">
            <input type="date" id="ytNgayKham">
            <input type="text" id="ytBacSi" placeholder="Bác sĩ">
            <textarea id="ytKetLuan" rows="2" placeholder="Kết luận"></textarea>
        `;
        // Load danh sách bệnh nhân vào select
        const select = document.getElementById('ytBenhNhanId');
        select.innerHTML = '<option value="">-- Chọn bệnh nhân --</option>';
        yTeData.benhNhan.forEach(bn => {
            select.innerHTML += `<option value="${bn.id}">${bn.tenBenhNhan}</option>`;
        });
    }
    document.getElementById('ytModal').style.display = 'flex';
}

// Lưu
async function saveYTe() {
    let data = { updatedAt: new Date().toISOString() };
    
    if(currentTab === 'benhnhan') {
        const ten = document.getElementById('ytTen')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên bệnh nhân!', 'error'); return; }
        data = { ...data, tenBenhNhan: ten, chucVu: document.getElementById('ytChucVu')?.value, donVi: document.getElementById('ytDonVi')?.value, chuanDoan: document.getElementById('ytChuanDoan')?.value, ngayNhapVien: document.getElementById('ytNgayNhapVien')?.value, trangThai: document.getElementById('ytTrangThai')?.value, ghiChu: document.getElementById('ytGhiChu')?.value };
    } else if(currentTab === 'thuoc') {
        const ten = document.getElementById('ytTenThuoc')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên thuốc!', 'error'); return; }
        data = { ...data, tenThuoc: ten, hamLuong: document.getElementById('ytHamLuong')?.value, dangBaoChe: document.getElementById('ytDangBaoChe')?.value, soLuong: parseInt(document.getElementById('ytSoLuong')?.value) || 0, hanSuDung: document.getElementById('ytHanSuDung')?.value, congDung: document.getElementById('ytCongDung')?.value, ghiChu: document.getElementById('ytGhiChu')?.value };
    } else {
        const benhNhanId = document.getElementById('ytBenhNhanId')?.value;
        if(!benhNhanId) { showToast('Vui lòng chọn bệnh nhân!', 'error'); return; }
        data = { ...data, benhNhanId: benhNhanId, trieuChung: document.getElementById('ytTrieuChung')?.value, ngayKham: document.getElementById('ytNgayKham')?.value, bacSi: document.getElementById('ytBacSi')?.value, ketLuan: document.getElementById('ytKetLuan')?.value };
    }
    
    const collection = currentTab === 'benhnhan' ? 'yTeBenhNhan' : (currentTab === 'thuoc' ? 'yTeThuoc' : 'yTeKhamBenh');
    
    try {
        if(currentEditId) {
            await db.collection(collection).doc(currentEditId).update(data);
            showToast('Đã cập nhật!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection(collection).add(data);
            showToast('Đã thêm mới!', 'success');
        }
        closeYtModal();
        await loadYTeData();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xem chi tiết
function viewBenhNhanDetail(id) {
    const bn = yTeData.benhNhan.find(i => i.id === id);
    if(!bn) return;
    document.getElementById('ytDetailContent').innerHTML = `
        <div><strong>👨‍⚕️ ${bn.tenBenhNhan}</strong></div>
        <hr><div>🪖 Chức vụ: ${bn.chucVu || '---'}</div>
        <div>🏢 Đơn vị: ${bn.donVi || '---'}</div>
        <div>🩺 Chẩn đoán: ${bn.chuanDoan || '---'}</div>
        <div>📅 Ngày nhập viện: ${bn.ngayNhapVien ? new Date(bn.ngayNhapVien).toLocaleDateString() : '---'}</div>
        <div>📝 Ghi chú: ${bn.ghiChu || '---'}</div>
        <hr><div><button onclick="openKeDonThuoc('${id}')" class="success" style="margin-top: 10px;">📝 Kê đơn thuốc</button></div>
    `;
    document.getElementById('ytDetailModal').style.display = 'flex';
}

function viewThuocDetail(id) {
    const thuoc = yTeData.thuoc.find(i => i.id === id);
    if(!thuoc) return;
    document.getElementById('ytDetailContent').innerHTML = `
        <div><strong>💊 ${thuoc.tenThuoc}</strong></div>
        <hr><div>🧪 Hàm lượng: ${thuoc.hamLuong || '---'}</div>
        <div>📦 Dạng bào chế: ${thuoc.dangBaoChe || '---'}</div>
        <div>📊 Số lượng: ${thuoc.soLuong || 0}</div>
        <div>📅 Hạn sử dụng: ${thuoc.hanSuDung ? new Date(thuoc.hanSuDung).toLocaleDateString() : '---'}</div>
        <div>💊 Công dụng: ${thuoc.congDung || '---'}</div>
        <div>📝 Ghi chú: ${thuoc.ghiChu || '---'}</div>
    `;
    document.getElementById('ytDetailModal').style.display = 'flex';
}

function viewKhamDetail(id) {
    const kham = yTeData.khamBenh.find(i => i.id === id);
    if(!kham) return;
    const bn = yTeData.benhNhan.find(b => b.id === kham.benhNhanId);
    document.getElementById('ytDetailContent').innerHTML = `
        <div><strong>📋 Lịch khám</strong></div>
        <hr><div>👨‍⚕️ Bệnh nhân: ${bn?.tenBenhNhan || '---'}</div>
        <div>🩺 Triệu chứng: ${kham.trieuChung || '---'}</div>
        <div>📅 Ngày khám: ${kham.ngayKham ? new Date(kham.ngayKham).toLocaleDateString() : '---'}</div>
        <div>👨‍⚕️ Bác sĩ: ${kham.bacSi || '---'}</div>
        <div>📝 Kết luận: ${kham.ketLuan || '---'}</div>
    `;
    document.getElementById('ytDetailModal').style.display = 'flex';
}

// Kê đơn thuốc
let currentBenhNhanDon = null;
let danhSachThuocDon = [];

function openKeDonThuoc(benhNhanId) {
    currentBenhNhanDon = benhNhanId;
    danhSachThuocDon = [];
    updateDonThuocUI();
    document.getElementById('donThuocModal').style.display = 'flex';
}

function updateDonThuocUI() {
    const select = document.getElementById('thuocSelect');
    select.innerHTML = '<option value="">-- Chọn thuốc --</option>';
    yTeData.thuoc.forEach(thuoc => {
        select.innerHTML += `<option value="${thuoc.id}">${thuoc.tenThuoc} (còn ${thuoc.soLuong || 0})</option>`;
    });
    
    const listDiv = document.getElementById('danhSachThuocDaChon');
    listDiv.innerHTML = '<strong>Thuốc đã chọn:</strong>';
    danhSachThuocDon.forEach((item, idx) => {
        listDiv.innerHTML += `<div style="margin-top: 5px;">${item.tenThuoc} - ${item.soLuong} - ${item.lieuTrinh}<button onclick="removeThuocDon(${idx})" style="width:auto; padding:2px 8px; margin-left:5px;">❌</button></div>`;
    });
}

function addThuocToDon() {
    const thuocId = document.getElementById('thuocSelect').value;
    const soLuong = parseInt(document.getElementById('soLuongThuoc').value);
    const lieuTrinh = document.getElementById('lieuTrinh').value;
    
    if(!thuocId || !soLuong) { showToast('Chọn thuốc và nhập số lượng!', 'error'); return; }
    
    const thuoc = yTeData.thuoc.find(t => t.id === thuocId);
    if(thuoc.soLuong < soLuong) { showToast('Không đủ số lượng thuốc!', 'error'); return; }
    
    danhSachThuocDon.push({ thuocId, tenThuoc: thuoc.tenThuoc, soLuong, lieuTrinh });
    document.getElementById('soLuongThuoc').value = '';
    document.getElementById('lieuTrinh').value = '';
    updateDonThuocUI();
}

function removeThuocDon(index) {
    danhSachThuocDon.splice(index, 1);
    updateDonThuocUI();
}

async function saveDonThuoc() {
    if(danhSachThuocDon.length === 0) { showToast('Chưa có thuốc nào được thêm!', 'error'); return; }
    
    for(const item of danhSachThuocDon) {
        const thuoc = yTeData.thuoc.find(t => t.id === item.thuocId);
        await db.collection('yTeThuoc').doc(item.thuocId).update({ soLuong: thuoc.soLuong - item.soLuong });
        
        await db.collection('yTeDonThuoc').add({
            benhNhanId: currentBenhNhanDon,
            thuocId: item.thuocId,
            tenThuoc: item.tenThuoc,
            soLuong: item.soLuong,
            lieuTrinh: item.lieuTrinh,
            ngayKe: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
    }
    
    showToast('Đã lưu đơn thuốc!', 'success');
    closeDonThuocModal();
    await loadYTeData();
}

// Xuất Excel
async function exportYTeToExcel() {
    let data = [];
    if(currentTab === 'benhnhan') {
        data = yTeData.benhNhan.map((b, i) => ({ 'STT': i+1, 'Họ tên': b.tenBenhNhan, 'Chức vụ': b.chucVu, 'Đơn vị': b.donVi, 'Chẩn đoán': b.chuanDoan, 'Ngày nhập viện': b.ngayNhapVien, 'Trạng thái': b.trangThai }));
    } else if(currentTab === 'thuoc') {
        data = yTeData.thuoc.map((t, i) => ({ 'STT': i+1, 'Tên thuốc': t.tenThuoc, 'Hàm lượng': t.hamLuong, 'Số lượng': t.soLuong, 'Hạn sử dụng': t.hanSuDung, 'Công dụng': t.congDung }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Y tế');
    XLSX.writeFile(wb, `YTe_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function closeYtModal() { document.getElementById('ytModal').style.display = 'none'; }
function closeYtDetailModal() { document.getElementById('ytDetailModal').style.display = 'none'; }
function closeDonThuocModal() { document.getElementById('donThuocModal').style.display = 'none'; }
function showToast(msg, type) { const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.innerHTML = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2500); }