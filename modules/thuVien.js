// ========== MODULE THƯ VIỆN - QUẢN LÝ TÀI LIỆU, SÁCH, BÁO, VIDEO ==========

let thuVienData = {
    taiLieu: [],
    sach: [],
    baoChi: [],
    video: [],
    muonTra: []
};
let currentEditId = null;
let currentTab = 'tailieu';

function initThuVien() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📚 THƯ VIỆN - TÀI LIỆU</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="tvTongTaiLieu">0</div><div class="stat-label">Tổng tài liệu</div></div>
            <div class="stat-card present"><div class="stat-value" id="tvDangMuon">0</div><div class="stat-label">Đang mượn</div></div>
            <div class="stat-card absent"><div class="stat-value" id="tvSapHetHan">0</div><div class="stat-label">Sắp hết hạn</div></div>
            <div class="stat-card leave"><div class="stat-value" id="tvQuaHan">0</div><div class="stat-label">Quá hạn</div></div>
        </div>

        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px; flex-wrap: wrap;">
            <button id="tabTaiLieu" onclick="switchThuVienTab('tailieu')" class="active-tab" style="flex:1; background: #2c3e50;">📄 Tài liệu</button>
            <button id="tabSach" onclick="switchThuVienTab('sach')" style="flex:1; background: #95a5a6;">📖 Sách</button>
            <button id="tabBaoChi" onclick="switchThuVienTab('baochi')" style="flex:1; background: #95a5a6;">📰 Báo chí</button>
            <button id="tabVideo" onclick="switchThuVienTab('video')" style="flex:1; background: #95a5a6;">🎬 Video</button>
            <button id="tabMuonTra" onclick="switchThuVienTab('muontra')" style="flex:1; background: #95a5a6;">📋 Mượn - Trả</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchTV" placeholder="🔍 Tìm kiếm theo tên, tác giả...">
            <button onclick="showAddThuVienModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportThuVienToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Nội dung -->
        <div id="tvContent"></div>

        <!-- Modal Thêm/Sửa -->
        <div id="tvModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="tvModalTitle">Thêm mới</h3>
                <div id="tvModalFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveThuVien()" class="success">Lưu</button>
                    <button onclick="closeTvModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết -->
        <div id="tvDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CHI TIẾT</h3>
                <div id="tvDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeTvDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Modal Mượn tài liệu -->
        <div id="muonModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 MƯỢN TÀI LIỆU</h3>
                <div id="muonFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveMuonTra('muon')" class="success">Xác nhận mượn</button>
                    <button onclick="closeMuonModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Trả tài liệu -->
        <div id="traModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 TRẢ TÀI LIỆU</h3>
                <div id="traFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveMuonTra('tra')" class="success">Xác nhận trả</button>
                    <button onclick="closeTraModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { background: #2c3e50 !important; color: white; }
        .doc-card { background: white; border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 1px solid #eef2f6; transition: 0.2s; cursor: pointer; }
        .doc-card:hover { transform: translateX(5px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .status-con { background: #d1fae5; color: #27ae60; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-het { background: #fee2e2; color: #e74c3c; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-dangmuon { background: #fed7aa; color: #f39c12; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .borrow-card { background: #f8fafc; border-radius: 12px; padding: 12px; margin-bottom: 10px; }
        .overdue { border-left: 3px solid #e74c3c; }
        .warning { color: #e74c3c; font-weight: bold; }
    `;
    document.head.appendChild(style);
    
    loadThuVienData();
    
    document.getElementById('searchTV').addEventListener('input', function(e) {
        searchThuVien(e.target.value);
    });
}

// Chuyển tab
function switchThuVienTab(tab) {
    currentTab = tab;
    const btns = ['tabTaiLieu', 'tabSach', 'tabBaoChi', 'tabVideo', 'tabMuonTra'];
    btns.forEach(btn => {
        const el = document.getElementById(btn);
        if(el) el.style.background = '#95a5a6';
    });
    const activeMap = { 'tailieu': 'tabTaiLieu', 'sach': 'tabSach', 'baochi': 'tabBaoChi', 'video': 'tabVideo', 'muontra': 'tabMuonTra' };
    const activeBtn = document.getElementById(activeMap[tab]);
    if(activeBtn) activeBtn.style.background = '#2c3e50';
    
    displayThuVienContent();
}

// Load dữ liệu
async function loadThuVienData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const [taiLieuSnap, sachSnap, baoChiSnap, videoSnap, muonTraSnap] = await Promise.all([
            db.collection('thuVienTaiLieu').get(),
            db.collection('thuVienSach').get(),
            db.collection('thuVienBaoChi').get(),
            db.collection('thuVienVideo').get(),
            db.collection('thuVienMuonTra').get()
        ]);
        
        thuVienData.taiLieu = [];
        taiLieuSnap.forEach(doc => thuVienData.taiLieu.push({ id: doc.id, ...doc.data() }));
        
        thuVienData.sach = [];
        sachSnap.forEach(doc => thuVienData.sach.push({ id: doc.id, ...doc.data() }));
        
        thuVienData.baoChi = [];
        baoChiSnap.forEach(doc => thuVienData.baoChi.push({ id: doc.id, ...doc.data() }));
        
        thuVienData.video = [];
        videoSnap.forEach(doc => thuVienData.video.push({ id: doc.id, ...doc.data() }));
        
        thuVienData.muonTra = [];
        muonTraSnap.forEach(doc => thuVienData.muonTra.push({ id: doc.id, ...doc.data() }));
        
        updateThuVienStats();
        displayThuVienContent();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateThuVienStats() {
    let tongTaiLieu = thuVienData.taiLieu.length + thuVienData.sach.length + thuVienData.baoChi.length + thuVienData.video.length;
    const dangMuon = thuVienData.muonTra.filter(m => m.trangThai === 'muon').length;
    const today = new Date();
    const sapHetHan = thuVienData.muonTra.filter(m => {
        if(m.trangThai !== 'muon') return false;
        const hanTra = new Date(m.hanTra);
        const diffDays = Math.ceil((hanTra - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    }).length;
    const quaHan = thuVienData.muonTra.filter(m => {
        if(m.trangThai !== 'muon') return false;
        return new Date(m.hanTra) < today;
    }).length;
    
    document.getElementById('tvTongTaiLieu').innerText = tongTaiLieu;
    document.getElementById('tvDangMuon').innerText = dangMuon;
    document.getElementById('tvSapHetHan').innerText = sapHetHan;
    document.getElementById('tvQuaHan').innerText = quaHan;
}

// Hiển thị nội dung
function displayThuVienContent() {
    const container = document.getElementById('tvContent');
    if(!container) return;
    
    if(currentTab === 'tailieu') {
        displayTaiLieuList(container);
    } else if(currentTab === 'sach') {
        displaySachList(container);
    } else if(currentTab === 'baochi') {
        displayBaoChiList(container);
    } else if(currentTab === 'video') {
        displayVideoList(container);
    } else {
        displayMuonTraList(container);
    }
}

// Hiển thị danh sách tài liệu
function displayTaiLieuList(container) {
    if(thuVienData.taiLieu.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có tài liệu. Nhấn "Thêm" để thêm tài liệu.</div>';
        return;
    }
    
    let html = '';
    thuVienData.taiLieu.forEach(tl => {
        const statusClass = tl.soLuong > 0 ? 'status-con' : 'status-het';
        const statusText = tl.soLuong > 0 ? `✅ Còn ${tl.soLuong} bản` : '❌ Hết';
        
        html += `
            <div class="doc-card" onclick="viewTaiLieuDetail('${tl.id}', 'tailieu')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>📄 ${tl.tenTaiLieu}</strong><br><span style="font-size: 12px;">${tl.tacGia || '---'} - ${tl.nhaXuatBan || '---'} (${tl.namXuatBan || '---'})</span></div>
                    <div><span class="${statusClass}">${statusText}</span></div>
                </div>
                <div>📂 Danh mục: ${tl.danhMuc || '---'} | 📍 Vị trí: ${tl.viTri || '---'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách sách
function displaySachList(container) {
    if(thuVienData.sach.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có sách. Nhấn "Thêm" để thêm sách.</div>';
        return;
    }
    
    let html = '';
    thuVienData.sach.forEach(s => {
        html += `
            <div class="doc-card" onclick="viewTaiLieuDetail('${s.id}', 'sach')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>📖 ${s.tenSach}</strong><br><span style="font-size: 12px;">${s.tacGia || '---'} - ${s.theLoai || '---'}</span></div>
                    <div><span class="status-con">✅ Còn ${s.soLuong || 1} cuốn</span></div>
                </div>
                <div>🏷️ ISBN: ${s.isbn || '---'} | 📅 NXB: ${s.namXuatBan || '---'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách báo chí
function displayBaoChiList(container) {
    if(thuVienData.baoChi.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có báo chí. Nhấn "Thêm" để thêm báo chí.</div>';
        return;
    }
    
    let html = '';
    thuVienData.baoChi.forEach(bc => {
        html += `
            <div class="doc-card" onclick="viewTaiLieuDetail('${bc.id}', 'baochi')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>📰 ${bc.tenBao}</strong><br><span style="font-size: 12px;">Số: ${bc.soBao || '---'} - Ngày: ${bc.ngayPhatHanh ? new Date(bc.ngayPhatHanh).toLocaleDateString() : '---'}</span></div>
                    <div><span class="status-con">📅 ${bc.ky || '---'}</span></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách video
function displayVideoList(container) {
    if(thuVienData.video.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có video. Nhấn "Thêm" để thêm video.</div>';
        return;
    }
    
    let html = '';
    thuVienData.video.forEach(v => {
        html += `
            <div class="doc-card" onclick="viewTaiLieuDetail('${v.id}', 'video')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>🎬 ${v.tenVideo}</strong><br><span style="font-size: 12px;">Thời lượng: ${v.thoiLuong || '---'} | Đạo diễn: ${v.daoDien || '---'}</span></div>
                    <div><span class="status-con">✅ Có sẵn</span></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách mượn trả
function displayMuonTraList(container) {
    if(thuVienData.muonTra.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có lịch sử mượn trả. Nhấn "Mượn" để tạo phiếu.</div>';
        return;
    }
    
    const today = new Date();
    let html = '';
    thuVienData.muonTra.forEach(mt => {
        const isOverdue = mt.trangThai === 'muon' && new Date(mt.hanTra) < today;
        const isExpiring = mt.trangThai === 'muon' && !isOverdue && (new Date(mt.hanTra) - today) / (1000*60*60*24) <= 3;
        
        html += `
            <div class="borrow-card ${isOverdue ? 'overdue' : ''}" onclick="viewMuonTraDetail('${mt.id}')">
                <div><strong>${mt.nguoiMuon}</strong> - ${mt.donVi || '---'}</div>
                <div>📚 ${mt.loaiTaiLieu === 'tailieu' ? '📄 Tài liệu' : (mt.loaiTaiLieu === 'sach' ? '📖 Sách' : (mt.loaiTaiLieu === 'baochi' ? '📰 Báo' : '🎬 Video'))}: ${mt.tenTaiLieu}</div>
                <div>📅 Mượn: ${new Date(mt.ngayMuon).toLocaleDateString()} | Trả: ${mt.hanTra ? new Date(mt.hanTra).toLocaleDateString() : '---'}</div>
                <div>
                    ${mt.trangThai === 'muon' ? 
                        (isOverdue ? '<span class="warning">⚠️ QUÁ HẠN!</span>' : (isExpiring ? '<span class="warning">⏰ Sắp đến hạn trả</span>' : '🟡 Đang mượn')) : 
                        '<span class="status-con">✅ Đã trả</span>'}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Tìm kiếm
function searchThuVien(keyword) {
    if(!keyword.trim()) {
        displayThuVienContent();
        return;
    }
}

// Modal thêm
function showAddThuVienModal() {
    currentEditId = null;
    const modalFields = document.getElementById('tvModalFields');
    
    if(currentTab === 'tailieu') {
        document.getElementById('tvModalTitle').innerText = 'Thêm tài liệu mới';
        modalFields.innerHTML = `
            <input type="text" id="tvTenTaiLieu" placeholder="Tên tài liệu *">
            <input type="text" id="tvTacGia" placeholder="Tác giả">
            <input type="text" id="tvNhaXuatBan" placeholder="Nhà xuất bản">
            <input type="number" id="tvNamXuatBan" placeholder="Năm xuất bản">
            <input type="text" id="tvDanhMuc" placeholder="Danh mục (VD: Huấn luyện, Chính trị...)">
            <input type="number" id="tvSoLuong" placeholder="Số lượng bản">
            <input type="text" id="tvViTri" placeholder="Vị trí lưu trữ">
            <textarea id="tvTomTat" rows="2" placeholder="Tóm tắt nội dung"></textarea>
        `;
    } else if(currentTab === 'sach') {
        document.getElementById('tvModalTitle').innerText = 'Thêm sách mới';
        modalFields.innerHTML = `
            <input type="text" id="tvTenSach" placeholder="Tên sách *">
            <input type="text" id="tvTacGia" placeholder="Tác giả">
            <input type="text" id="tvTheLoai" placeholder="Thể loại">
            <input type="text" id="tvIsbn" placeholder="ISBN">
            <input type="text" id="tvNhaXuatBan" placeholder="Nhà xuất bản">
            <input type="number" id="tvNamXuatBan" placeholder="Năm xuất bản">
            <input type="number" id="tvSoLuong" placeholder="Số lượng">
            <input type="text" id="tvViTri" placeholder="Vị trí">
        `;
    } else if(currentTab === 'baochi') {
        document.getElementById('tvModalTitle').innerText = 'Thêm báo chí mới';
        modalFields.innerHTML = `
            <input type="text" id="tvTenBao" placeholder="Tên báo/tạp chí *">
            <input type="text" id="tvSoBao" placeholder="Số báo">
            <input type="text" id="tvKy" placeholder="Kỳ (VD: Xuân 2024)">
            <input type="date" id="tvNgayPhatHanh">
            <input type="text" id="tvNhaXuatBan" placeholder="Nhà xuất bản">
        `;
    } else if(currentTab === 'video') {
        document.getElementById('tvModalTitle').innerText = 'Thêm video mới';
        modalFields.innerHTML = `
            <input type="text" id="tvTenVideo" placeholder="Tên video *">
            <input type="text" id="tvDaoDien" placeholder="Đạo diễn">
            <input type="text" id="tvThoiLuong" placeholder="Thời lượng (phút)">
            <input type="text" id="tvTheLoai" placeholder="Thể loại">
            <input type="text" id="tvDinhDang" placeholder="Định dạng (MP4, AVI...)">
            <input type="url" id="tvLink" placeholder="Link xem trực tuyến">
        `;
    } else if(currentTab === 'muontra') {
        openMuonModal();
        return;
    }
    document.getElementById('tvModal').style.display = 'flex';
}

// Lưu
async function saveThuVien() {
    let data = { updatedAt: new Date().toISOString() };
    let collection = '';
    
    if(currentTab === 'tailieu') {
        const ten = document.getElementById('tvTenTaiLieu')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên tài liệu!', 'error'); return; }
        data = { ...data, tenTaiLieu: ten, tacGia: document.getElementById('tvTacGia')?.value, nhaXuatBan: document.getElementById('tvNhaXuatBan')?.value, namXuatBan: parseInt(document.getElementById('tvNamXuatBan')?.value), danhMuc: document.getElementById('tvDanhMuc')?.value, soLuong: parseInt(document.getElementById('tvSoLuong')?.value) || 1, viTri: document.getElementById('tvViTri')?.value, tomTat: document.getElementById('tvTomTat')?.value, daMuon: 0 };
        collection = 'thuVienTaiLieu';
    } else if(currentTab === 'sach') {
        const ten = document.getElementById('tvTenSach')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên sách!', 'error'); return; }
        data = { ...data, tenSach: ten, tacGia: document.getElementById('tvTacGia')?.value, theLoai: document.getElementById('tvTheLoai')?.value, isbn: document.getElementById('tvIsbn')?.value, nhaXuatBan: document.getElementById('tvNhaXuatBan')?.value, namXuatBan: parseInt(document.getElementById('tvNamXuatBan')?.value), soLuong: parseInt(document.getElementById('tvSoLuong')?.value) || 1, viTri: document.getElementById('tvViTri')?.value };
        collection = 'thuVienSach';
    } else if(currentTab === 'baochi') {
        const ten = document.getElementById('tvTenBao')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên báo!', 'error'); return; }
        data = { ...data, tenBao: ten, soBao: document.getElementById('tvSoBao')?.value, ky: document.getElementById('tvKy')?.value, ngayPhatHanh: document.getElementById('tvNgayPhatHanh')?.value, nhaXuatBan: document.getElementById('tvNhaXuatBan')?.value };
        collection = 'thuVienBaoChi';
    } else if(currentTab === 'video') {
        const ten = document.getElementById('tvTenVideo')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên video!', 'error'); return; }
        data = { ...data, tenVideo: ten, daoDien: document.getElementById('tvDaoDien')?.value, thoiLuong: document.getElementById('tvThoiLuong')?.value, theLoai: document.getElementById('tvTheLoai')?.value, dinhDang: document.getElementById('tvDinhDang')?.value, link: document.getElementById('tvLink')?.value };
        collection = 'thuVienVideo';
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
        closeTvModal();
        await loadThuVienData();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Mở modal mượn tài liệu
function openMuonModal() {
    document.getElementById('muonFields').innerHTML = `
        <select id="muonLoai" onchange="toggleMuonLoai()" style="margin-bottom: 10px;">
            <option value="tailieu">📄 Tài liệu</option>
            <option value="sach">📖 Sách</option>
            <option value="baochi">📰 Báo</option>
            <option value="video">🎬 Video</option>
        </select>
        <select id="muonTaiLieuId" style="margin-bottom: 10px;"></select>
        <input type="text" id="muonNguoiMuon" placeholder="Người mượn *">
        <input type="text" id="muonDonVi" placeholder="Đơn vị">
        <input type="date" id="muonHanTra" placeholder="Hạn trả">
        <input type="text" id="muonGhiChu" placeholder="Ghi chú">
    `;
    toggleMuonLoai();
    document.getElementById('muonModal').style.display = 'flex';
}

function toggleMuonLoai() {
    const loai = document.getElementById('muonLoai').value;
    const select = document.getElementById('muonTaiLieuId');
    select.innerHTML = '<option value="">-- Chọn tài liệu --</option>';
    
    let dataList = [];
    if(loai === 'tailieu') dataList = thuVienData.taiLieu;
    else if(loai === 'sach') dataList = thuVienData.sach;
    else if(loai === 'baochi') dataList = thuVienData.baoChi;
    else dataList = thuVienData.video;
    
    dataList.forEach(item => {
        const ten = item.tenTaiLieu || item.tenSach || item.tenBao || item.tenVideo;
        const soLuong = item.soLuong;
        const daMuon = item.daMuon || 0;
        const conLai = (soLuong || 1) - daMuon;
        select.innerHTML += `<option value="${item.id}" ${conLai <= 0 ? 'disabled' : ''}>${ten} - Còn ${conLai}</option>`;
    });
}

async function saveMuonTra(action) {
    if(action === 'muon') {
        const loai = document.getElementById('muonLoai').value;
        const taiLieuId = document.getElementById('muonTaiLieuId').value;
        const nguoiMuon = document.getElementById('muonNguoiMuon').value;
        
        if(!taiLieuId || !nguoiMuon) { showToast('Chọn tài liệu và nhập người mượn!', 'error'); return; }
        
        let collection = '';
        let tenTaiLieu = '';
        if(loai === 'tailieu') {
            collection = 'thuVienTaiLieu';
            const tl = thuVienData.taiLieu.find(t => t.id === taiLieuId);
            tenTaiLieu = tl?.tenTaiLieu;
            await db.collection(collection).doc(taiLieuId).update({ daMuon: (tl?.daMuon || 0) + 1 });
        } else if(loai === 'sach') {
            collection = 'thuVienSach';
            const s = thuVienData.sach.find(t => t.id === taiLieuId);
            tenTaiLieu = s?.tenSach;
            await db.collection(collection).doc(taiLieuId).update({ daMuon: (s?.daMuon || 0) + 1 });
        } else if(loai === 'baochi') {
            collection = 'thuVienBaoChi';
            const bc = thuVienData.baoChi.find(t => t.id === taiLieuId);
            tenTaiLieu = bc?.tenBao;
        } else {
            collection = 'thuVienVideo';
            const v = thuVienData.video.find(t => t.id === taiLieuId);
            tenTaiLieu = v?.tenVideo;
        }
        
        await db.collection('thuVienMuonTra').add({
            loaiTaiLieu: loai,
            taiLieuId: taiLieuId,
            tenTaiLieu: tenTaiLieu,
            nguoiMuon: nguoiMuon,
            donVi: document.getElementById('muonDonVi').value,
            hanTra: document.getElementById('muonHanTra').value,
            ngayMuon: new Date().toISOString(),
            trangThai: 'muon',
            ghiChu: document.getElementById('muonGhiChu').value,
            createdAt: new Date().toISOString()
        });
        
        showToast('Đã ghi nhận mượn tài liệu!', 'success');
        closeMuonModal();
        await loadThuVienData();
    }
}

// Xuất Excel
async function exportThuVienToExcel() {
    let data = [];
    if(currentTab === 'tailieu') {
        data = thuVienData.taiLieu.map((t, i) => ({ 'STT': i+1, 'Tên tài liệu': t.tenTaiLieu, 'Tác giả': t.tacGia, 'NXB': t.nhaXuatBan, 'Năm XB': t.namXuatBan, 'Danh mục': t.danhMuc, 'Số lượng': t.soLuong, 'Vị trí': t.viTri }));
    } else if(currentTab === 'sach') {
        data = thuVienData.sach.map((s, i) => ({ 'STT': i+1, 'Tên sách': s.tenSach, 'Tác giả': s.tacGia, 'Thể loại': s.theLoai, 'ISBN': s.isbn, 'NXB': s.nhaXuatBan, 'Số lượng': s.soLuong }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thư viện');
    XLSX.writeFile(wb, `ThuVien_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function closeTvModal() { document.getElementById('tvModal').style.display = 'none'; }
function closeTvDetailModal() { document.getElementById('tvDetailModal').style.display = 'none'; }
function closeMuonModal() { document.getElementById('muonModal').style.display = 'none'; }
function closeTraModal() { document.getElementById('traModal').style.display = 'none'; }
function showToast(msg, type) { const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.innerHTML = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2500); }