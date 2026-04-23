// ========== MODULE THỂ THAO - QUẢN LÝ HOẠT ĐỘNG TDTT ==========

let theThaoData = {
    giaiDau: [],
    cauThu: [],
    lichTap: [],
    thanhTich: []
};
let currentEditId = null;
let currentTab = 'giaidau';

function initTheThao() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>⚽ QUẢN LÝ THỂ THAO</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="ttSoGiaiDau">0</div><div class="stat-label">Giải đấu</div></div>
            <div class="stat-card present"><div class="stat-value" id="ttSoCauThu">0</div><div class="stat-label">VĐV</div></div>
            <div class="stat-card absent"><div class="stat-value" id="ttSoHuanLuyenVien">0</div><div class="stat-label">HLV</div></div>
            <div class="stat-card leave"><div class="stat-value" id="ttSoHuyChuong">0</div><div class="stat-label">Huy chương</div></div>
        </div>

        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px; flex-wrap: wrap;">
            <button id="tabGiaiDau" onclick="switchTheThaoTab('giaidau')" class="active-tab" style="flex:1; background: #2c3e50;">🏆 Giải đấu</button>
            <button id="tabCauThu" onclick="switchTheThaoTab('cauthu')" style="flex:1; background: #95a5a6;">👥 VĐV/HLV</button>
            <button id="tabLichTap" onclick="switchTheThaoTab('lichtap')" style="flex:1; background: #95a5a6;">📅 Lịch tập</button>
            <button id="tabThanhTich" onclick="switchTheThaoTab('thanhtich')" style="flex:1; background: #95a5a6;">🏅 Thành tích</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchTT" placeholder="🔍 Tìm kiếm...">
            <button onclick="showAddTheThaoModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportTheThaoToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Nội dung -->
        <div id="ttContent"></div>

        <!-- Modal Thêm/Sửa -->
        <div id="ttModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="ttModalTitle">Thêm mới</h3>
                <div id="ttModalFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveTheThao()" class="success">Lưu</button>
                    <button onclick="closeTtModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết -->
        <div id="ttDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CHI TIẾT</h3>
                <div id="ttDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeTtDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Modal Nhập thành tích -->
        <div id="thanhTichModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>🏅 NHẬP THÀNH TÍCH</h3>
                <div id="thanhTichFields"></div>
                <div class="modal-buttons">
                    <button onclick="saveThanhTich()" class="success">Lưu</button>
                    <button onclick="closeThanhTichModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { background: #2c3e50 !important; color: white; }
        .tournament-card { background: white; border-radius: 16px; padding: 15px; margin-bottom: 12px; border: 1px solid #eef2f6; transition: 0.2s; cursor: pointer; }
        .tournament-card:hover { transform: translateX(5px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .status-sapdau { background: #fed7aa; color: #f39c12; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-dangdau { background: #d1fae5; color: #27ae60; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .status-ketthuc { background: #eef2f6; color: #6c757d; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
        .athlete-card { display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #eef2f6; cursor: pointer; }
        .athlete-avatar { width: 50px; height: 50px; background: #2c3e50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
        .schedule-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eef2f6; }
        .medal-gold { color: #f1c40f; }
        .medal-silver { color: #bdc3c7; }
        .medal-bronze { color: #cd7f32; }
    `;
    document.head.appendChild(style);
    
    loadTheThaoData();
    
    document.getElementById('searchTT').addEventListener('input', function(e) {
        searchTheThao(e.target.value);
    });
}

// Chuyển tab
function switchTheThaoTab(tab) {
    currentTab = tab;
    const btns = ['tabGiaiDau', 'tabCauThu', 'tabLichTap', 'tabThanhTich'];
    btns.forEach(btn => {
        const el = document.getElementById(btn);
        if(el) el.style.background = '#95a5a6';
    });
    const activeBtn = document.getElementById(`tab${tab === 'giaidau' ? 'GiaiDau' : (tab === 'cauthu' ? 'CauThu' : (tab === 'lichtap' ? 'LichTap' : 'ThanhTich'))}`);
    if(activeBtn) activeBtn.style.background = '#2c3e50';
    
    displayTheThaoContent();
}

// Load dữ liệu
async function loadTheThaoData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const [giaiDauSnap, cauThuSnap, lichTapSnap, thanhTichSnap] = await Promise.all([
            db.collection('theThaoGiaiDau').get(),
            db.collection('theThaoCauThu').get(),
            db.collection('theThaoLichTap').get(),
            db.collection('theThaoThanhTich').get()
        ]);
        
        theThaoData.giaiDau = [];
        giaiDauSnap.forEach(doc => theThaoData.giaiDau.push({ id: doc.id, ...doc.data() }));
        
        theThaoData.cauThu = [];
        cauThuSnap.forEach(doc => theThaoData.cauThu.push({ id: doc.id, ...doc.data() }));
        
        theThaoData.lichTap = [];
        lichTapSnap.forEach(doc => theThaoData.lichTap.push({ id: doc.id, ...doc.data() }));
        
        theThaoData.thanhTich = [];
        thanhTichSnap.forEach(doc => theThaoData.thanhTich.push({ id: doc.id, ...doc.data() }));
        
        updateTheThaoStats();
        displayTheThaoContent();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateTheThaoStats() {
    const soGiaiDau = theThaoData.giaiDau.length;
    const soCauThu = theThaoData.cauThu.filter(c => c.loai === 'vdv').length;
    const soHlv = theThaoData.cauThu.filter(c => c.loai === 'hlv').length;
    const soHuyChuong = theThaoData.thanhTich.length;
    
    document.getElementById('ttSoGiaiDau').innerText = soGiaiDau;
    document.getElementById('ttSoCauThu').innerText = soCauThu;
    document.getElementById('ttSoHuanLuyenVien').innerText = soHlv;
    document.getElementById('ttSoHuyChuong').innerText = soHuyChuong;
}

// Hiển thị nội dung
function displayTheThaoContent() {
    const container = document.getElementById('ttContent');
    if(!container) return;
    
    if(currentTab === 'giaidau') {
        displayGiaiDauList(container);
    } else if(currentTab === 'cauthu') {
        displayCauThuList(container);
    } else if(currentTab === 'lichtap') {
        displayLichTapList(container);
    } else {
        displayThanhTichList(container);
    }
}

// Hiển thị danh sách giải đấu
function displayGiaiDauList(container) {
    if(theThaoData.giaiDau.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có giải đấu nào. Nhấn "Thêm" để tạo giải đấu.</div>';
        return;
    }
    
    let html = '';
    theThaoData.giaiDau.forEach(gd => {
        const statusClass = gd.trangThai === 'sapdau' ? 'status-sapdau' : (gd.trangThai === 'dangdau' ? 'status-dangdau' : 'status-ketthuc');
        const statusText = gd.trangThai === 'sapdau' ? '🟡 Sắp diễn ra' : (gd.trangThai === 'dangdau' ? '🟢 Đang diễn ra' : '⚫ Đã kết thúc');
        
        html += `
            <div class="tournament-card" onclick="viewGiaiDauDetail('${gd.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div><strong>🏆 ${gd.tenGiaiDau}</strong><br><span style="font-size: 12px;">${gd.monTheThao || 'Bóng đá'}</span></div>
                    <div><span class="${statusClass}">${statusText}</span></div>
                </div>
                <div>📍 Địa điểm: ${gd.diaDiem || '---'}</div>
                <div>📅 ${gd.ngayBatDau ? new Date(gd.ngayBatDau).toLocaleDateString() : '---'} → ${gd.ngayKetThuc ? new Date(gd.ngayKetThuc).toLocaleDateString() : '---'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị danh sách VĐV/HLV
function displayCauThuList(container) {
    if(theThaoData.cauThu.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu. Nhấn "Thêm" để thêm VĐV/HLV.</div>';
        return;
    }
    
    let html = '';
    theThaoData.cauThu.forEach(ct => {
        const icon = ct.loai === 'vdv' ? '🏃' : '📋';
        html += `
            <div class="athlete-card" onclick="viewCauThuDetail('${ct.id}')">
                <div class="athlete-avatar">${ct.ten?.charAt(0) || 'A'}</div>
                <div style="flex: 1;">
                    <div><strong>${ct.ten}</strong> <span style="font-size: 12px;">(${ct.loai === 'vdv' ? 'VĐV' : 'HLV'})</span></div>
                    <div style="font-size: 12px;">${ct.monTheThao || '---'} | ${ct.donVi || '---'}</div>
                </div>
                <div>${icon}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị lịch tập
function displayLichTapList(container) {
    if(theThaoData.lichTap.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có lịch tập. Nhấn "Thêm" để thêm lịch tập.</div>';
        return;
    }
    
    let html = '';
    theThaoData.lichTap.forEach(lt => {
        html += `
            <div class="schedule-item" onclick="viewLichTapDetail('${lt.id}')">
                <div>
                    <div><strong>${lt.tenBuoiTap || 'Buổi tập'}</strong></div>
                    <div style="font-size: 12px;">${lt.monTheThao || '---'} | HLV: ${lt.hlv || '---'}</div>
                </div>
                <div>
                    <div>📅 ${lt.ngayTap ? new Date(lt.ngayTap).toLocaleDateString() : '---'}</div>
                    <div>⏰ ${lt.gioTap || '---'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Hiển thị thành tích
function displayThanhTichList(container) {
    if(theThaoData.thanhTich.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có thành tích. Nhấn "Thêm" để nhập thành tích.</div>';
        return;
    }
    
    let html = '';
    theThaoData.thanhTich.forEach(tt => {
        const medalIcon = tt.huyChuong === 'vang' ? '🥇' : (tt.huyChuong === 'bac' ? '🥈' : '🥉');
        const medalClass = tt.huyChuong === 'vang' ? 'medal-gold' : (tt.huyChuong === 'bac' ? 'medal-silver' : 'medal-bronze');
        
        html += `
            <div class="athlete-card" onclick="viewThanhTichDetail('${tt.id}')">
                <div class="athlete-avatar">${tt.tenVdv?.charAt(0) || 'A'}</div>
                <div style="flex: 1;">
                    <div><strong>${tt.tenVdv}</strong></div>
                    <div style="font-size: 12px;">🏆 ${tt.tenGiaiDau} - ${tt.noiDung}</div>
                </div>
                <div><span class="${medalClass}" style="font-size: 24px;">${medalIcon}</span></div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Tìm kiếm
function searchTheThao(keyword) {
    if(!keyword.trim()) {
        displayTheThaoContent();
        return;
    }
    // Tùy tab xử lý tìm kiếm riêng
}

// Modal thêm
function showAddTheThaoModal() {
    currentEditId = null;
    const modalFields = document.getElementById('ttModalFields');
    
    if(currentTab === 'giaidau') {
        document.getElementById('ttModalTitle').innerText = 'Thêm giải đấu mới';
        modalFields.innerHTML = `
            <input type="text" id="ttTenGiaiDau" placeholder="Tên giải đấu *">
            <input type="text" id="ttMonTheThao" placeholder="Môn thể thao" value="Bóng đá">
            <input type="text" id="ttDiaDiem" placeholder="Địa điểm tổ chức">
            <input type="date" id="ttNgayBatDau">
            <input type="date" id="ttNgayKetThuc">
            <select id="ttTrangThai">
                <option value="sapdau">Sắp diễn ra</option>
                <option value="dangdau">Đang diễn ra</option>
                <option value="ketthuc">Đã kết thúc</option>
            </select>
            <textarea id="ttGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else if(currentTab === 'cauthu') {
        document.getElementById('ttModalTitle').innerText = 'Thêm VĐV/HLV mới';
        modalFields.innerHTML = `
            <input type="text" id="ttTen" placeholder="Họ tên *">
            <select id="ttLoai">
                <option value="vdv">Vận động viên (VĐV)</option>
                <option value="hlv">Huấn luyện viên (HLV)</option>
            </select>
            <input type="text" id="ttMonTheThao" placeholder="Môn thể thao chuyên sâu">
            <input type="text" id="ttDonVi" placeholder="Đơn vị công tác">
            <input type="text" id="ttSoAo" placeholder="Số áo (nếu có)">
            <input type="text" id="ttViTri" placeholder="Vị trí thi đấu">
            <textarea id="ttGhiChu" rows="2" placeholder="Ghi chú"></textarea>
        `;
    } else if(currentTab === 'lichtap') {
        document.getElementById('ttModalTitle').innerText = 'Thêm lịch tập mới';
        modalFields.innerHTML = `
            <input type="text" id="ttTenBuoiTap" placeholder="Tên buổi tập *">
            <input type="text" id="ttMonTheThao" placeholder="Môn thể thao">
            <input type="date" id="ttNgayTap">
            <input type="time" id="ttGioTap">
            <input type="text" id="ttDiaDiem" placeholder="Địa điểm">
            <input type="text" id="ttHlv" placeholder="HLV phụ trách">
            <textarea id="ttNoiDung" rows="2" placeholder="Nội dung buổi tập"></textarea>
        `;
    }
    document.getElementById('ttModal').style.display = 'flex';
}

// Lưu
async function saveTheThao() {
    let data = { updatedAt: new Date().toISOString() };
    let collection = '';
    
    if(currentTab === 'giaidau') {
        const ten = document.getElementById('ttTenGiaiDau')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên giải đấu!', 'error'); return; }
        data = { ...data, tenGiaiDau: ten, monTheThao: document.getElementById('ttMonTheThao')?.value, diaDiem: document.getElementById('ttDiaDiem')?.value, ngayBatDau: document.getElementById('ttNgayBatDau')?.value, ngayKetThuc: document.getElementById('ttNgayKetThuc')?.value, trangThai: document.getElementById('ttTrangThai')?.value, ghiChu: document.getElementById('ttGhiChu')?.value };
        collection = 'theThaoGiaiDau';
    } else if(currentTab === 'cauthu') {
        const ten = document.getElementById('ttTen')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập họ tên!', 'error'); return; }
        data = { ...data, ten: ten, loai: document.getElementById('ttLoai')?.value, monTheThao: document.getElementById('ttMonTheThao')?.value, donVi: document.getElementById('ttDonVi')?.value, soAo: document.getElementById('ttSoAo')?.value, viTri: document.getElementById('ttViTri')?.value, ghiChu: document.getElementById('ttGhiChu')?.value };
        collection = 'theThaoCauThu';
    } else if(currentTab === 'lichtap') {
        const ten = document.getElementById('ttTenBuoiTap')?.value.trim();
        if(!ten) { showToast('Vui lòng nhập tên buổi tập!', 'error'); return; }
        data = { ...data, tenBuoiTap: ten, monTheThao: document.getElementById('ttMonTheThao')?.value, ngayTap: document.getElementById('ttNgayTap')?.value, gioTap: document.getElementById('ttGioTap')?.value, diaDiem: document.getElementById('ttDiaDiem')?.value, hlv: document.getElementById('ttHlv')?.value, noiDung: document.getElementById('ttNoiDung')?.value };
        collection = 'theThaoLichTap';
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
        closeTtModal();
        await loadTheThaoData();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Nhập thành tích
function openThanhTichModal(giaiDauId, vdvId) {
    document.getElementById('thanhTichFields').innerHTML = `
        <select id="ttGiaiDauId" style="margin-bottom: 10px;"></select>
        <select id="ttVdvId" style="margin-bottom: 10px;"></select>
        <input type="text" id="ttNoiDungThanhTich" placeholder="Nội dung thi đấu">
        <select id="ttHuyChuong">
            <option value="vang">🥇 Huy chương Vàng</option>
            <option value="bac">🥈 Huy chương Bạc</option>
            <option value="dong">🥉 Huy chương Đồng</option>
        </select>
        <input type="text" id="ttThanhTichCuThe" placeholder="Thành tích cụ thể (VD: 10.5 giây)">
        <input type="date" id="ttNgayDat">
    `;
    
    const giaiDauSelect = document.getElementById('ttGiaiDauId');
    giaiDauSelect.innerHTML = '<option value="">-- Chọn giải đấu --</option>';
    theThaoData.giaiDau.forEach(gd => {
        giaiDauSelect.innerHTML += `<option value="${gd.id}" ${gd.id === giaiDauId ? 'selected' : ''}>${gd.tenGiaiDau}</option>`;
    });
    
    const vdvSelect = document.getElementById('ttVdvId');
    vdvSelect.innerHTML = '<option value="">-- Chọn VĐV --</option>';
    theThaoData.cauThu.filter(c => c.loai === 'vdv').forEach(vdv => {
        vdvSelect.innerHTML += `<option value="${vdv.id}" ${vdv.id === vdvId ? 'selected' : ''}>${vdv.ten}</option>`;
    });
    
    document.getElementById('thanhTichModal').style.display = 'flex';
}

async function saveThanhTich() {
    const giaiDauId = document.getElementById('ttGiaiDauId').value;
    const vdvId = document.getElementById('ttVdvId').value;
    if(!giaiDauId || !vdvId) { showToast('Chọn giải đấu và VĐV!', 'error'); return; }
    
    const giaiDau = theThaoData.giaiDau.find(g => g.id === giaiDauId);
    const vdv = theThaoData.cauThu.find(v => v.id === vdvId);
    
    const data = {
        giaiDauId: giaiDauId,
        tenGiaiDau: giaiDau?.tenGiaiDau,
        vdvId: vdvId,
        tenVdv: vdv?.ten,
        noiDung: document.getElementById('ttNoiDungThanhTich').value,
        huyChuong: document.getElementById('ttHuyChuong').value,
        thanhTichCuThe: document.getElementById('ttThanhTichCuThe').value,
        ngayDat: document.getElementById('ttNgayDat').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        await db.collection('theThaoThanhTich').add(data);
        showToast('Đã lưu thành tích!', 'success');
        closeThanhTichModal();
        await loadTheThaoData();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xuất Excel
async function exportTheThaoToExcel() {
    let data = [];
    if(currentTab === 'giaidau') {
        data = theThaoData.giaiDau.map((g, i) => ({ 'STT': i+1, 'Tên giải đấu': g.tenGiaiDau, 'Môn thể thao': g.monTheThao, 'Địa điểm': g.diaDiem, 'Ngày bắt đầu': g.ngayBatDau, 'Ngày kết thúc': g.ngayKetThuc, 'Trạng thái': g.trangThai }));
    } else if(currentTab === 'cauthu') {
        data = theThaoData.cauThu.map((c, i) => ({ 'STT': i+1, 'Họ tên': c.ten, 'Loại': c.loai === 'vdv' ? 'VĐV' : 'HLV', 'Môn thể thao': c.monTheThao, 'Đơn vị': c.donVi, 'Số áo': c.soAo, 'Vị trí': c.viTri }));
    } else if(currentTab === 'lichtap') {
        data = theThaoData.lichTap.map((l, i) => ({ 'STT': i+1, 'Buổi tập': l.tenBuoiTap, 'Môn': l.monTheThao, 'Ngày': l.ngayTap, 'Giờ': l.gioTap, 'Địa điểm': l.diaDiem, 'HLV': l.hlv }));
    } else {
        data = theThaoData.thanhTich.map((t, i) => ({ 'STT': i+1, 'VĐV': t.tenVdv, 'Giải đấu': t.tenGiaiDau, 'Nội dung': t.noiDung, 'Huy chương': t.huyChuong, 'Thành tích': t.thanhTichCuThe }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thể thao');
    XLSX.writeFile(wb, `TheThao_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function closeTtModal() { document.getElementById('ttModal').style.display = 'none'; }
function closeTtDetailModal() { document.getElementById('ttDetailModal').style.display = 'none'; }
function closeThanhTichModal() { document.getElementById('thanhTichModal').style.display = 'none'; }
function showToast(msg, type) { const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.innerHTML = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2500); }