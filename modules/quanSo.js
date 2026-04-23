// modules/quanSo.js - BẢN HOÀN CHỈNH

let quanSoData = [];
let currentEditId = null;
let currentAttendanceDate = new Date().toISOString().split('T')[0];

function initQuanSo() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>👥 QUẢN LÝ QUÂN SỐ</h3></div>
        
        <!-- Tab chuyển đổi -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="tabDS" onclick="showQuanSoList()" class="active-tab" style="flex:1; background:#2c3e50;">📋 Danh sách</button>
            <button id="tabDD" onclick="showDiemDanh()" style="flex:1; background:#95a5a6;">✅ Điểm danh</button>
            <button id="tabTK" onclick="showThongKe()" style="flex:1; background:#95a5a6;">📊 Thống kê</button>
        </div>
        
        <!-- Nội dung -->
        <div id="quanSoContent"></div>
    `;
    
    loadQuanSoData();
    showQuanSoList();
}

// Load dữ liệu từ Firestore
async function loadQuanSoData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('members').orderBy('name').get();
        quanSoData = [];
        snapshot.forEach(doc => {
            quanSoData.push({ id: doc.id, ...doc.data() });
        });
        updateThongKe();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Hiển thị danh sách
function showQuanSoList() {
    const container = document.getElementById('quanSoContent');
    if(!container) return;
    
    // Cập nhật active tab
    document.getElementById('tabDS').style.background = '#2c3e50';
    document.getElementById('tabDD').style.background = '#95a5a6';
    document.getElementById('tabTK').style.background = '#95a5a6';
    
    let html = `
        <div class="search-bar">
            <input type="text" id="searchQS" placeholder="🔍 Tìm kiếm theo tên...">
            <button onclick="showAddMemberModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportQuanSoExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
        <div id="quanSoList"></div>
    `;
    container.innerHTML = html;
    
    displayQuanSoList(quanSoData);
    
    document.getElementById('searchQS').addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase();
        const filtered = quanSoData.filter(m => m.name.toLowerCase().includes(keyword));
        displayQuanSoList(filtered);
    });
}

function displayQuanSoList(data) {
    const listDiv = document.getElementById('quanSoList');
    if(data.length === 0) {
        listDiv.innerHTML = '<div style="text-align:center; padding:40px;">Chưa có dữ liệu. Nhấn "Thêm" để thêm quân nhân.</div>';
        return;
    }
    
    let html = '';
    data.forEach(m => {
        html += `
            <div class="list-item">
                <div class="list-icon">👤</div>
                <div class="list-info">
                    <div class="list-title">${m.name}</div>
                    <div class="list-desc">${m.rank || 'Chiến sĩ'} - ${m.position || 'Thành viên'} | 📞 ${m.phone || '---'}</div>
                </div>
                <div>
                    <button onclick="editMember('${m.id}')" style="width:auto; padding:6px 12px; background:#f59e0b;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteMember('${m.id}')" style="width:auto; padding:6px 12px; background:#e74c3c;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

// Hiển thị điểm danh
async function showDiemDanh() {
    const container = document.getElementById('quanSoContent');
    if(!container) return;
    
    document.getElementById('tabDS').style.background = '#95a5a6';
    document.getElementById('tabDD').style.background = '#2c3e50';
    document.getElementById('tabTK').style.background = '#95a5a6';
    
    const today = new Date().toISOString().split('T')[0];
    const attendanceDoc = await db.collection('attendance').doc(today).get();
    const attendanceData = attendanceDoc.exists ? attendanceDoc.data() : {};
    
    let html = `
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="ddTotal">0</div><div class="stat-label">Tổng số</div></div>
            <div class="stat-card present"><div class="stat-value" id="ddPresent">0</div><div class="stat-label">Có mặt</div></div>
            <div class="stat-card absent"><div class="stat-value" id="ddAbsent">0</div><div class="stat-label">Vắng</div></div>
        </div>
        <div style="padding: 0 15px 15px;">
            <input type="date" id="attendanceDate" value="${today}" onchange="loadDiemDanhByDate()">
            <button onclick="saveAttendance()" class="success" style="margin-top:10px;"><i class="fas fa-save"></i> Lưu điểm danh</button>
        </div>
        <div id="attendanceList"></div>
    `;
    container.innerHTML = html;
    
    await loadDiemDanhByDate();
}

async function loadDiemDanhByDate() {
    const date = document.getElementById('attendanceDate').value;
    const attendanceDoc = await db.collection('attendance').doc(date).get();
    const attendanceData = attendanceDoc.exists ? attendanceDoc.data() : {};
    
    let presentCount = 0;
    let html = '';
    quanSoData.forEach(m => {
        const isPresent = attendanceData[m.id] === true;
        if(isPresent) presentCount++;
        html += `
            <div class="list-item">
                <div class="list-icon">${isPresent ? '✅' : '⬜'}</div>
                <div class="list-info">
                    <div class="list-title">${m.name}</div>
                    <div class="list-desc">${m.rank || 'Chiến sĩ'}</div>
                </div>
                <button onclick="markAttendance('${m.id}', ${!isPresent})" style="width:auto; padding:8px 20px; background:${isPresent ? '#27ae60' : '#6c757d'}">
                    ${isPresent ? 'Đã điểm' : 'Điểm danh'}
                </button>
            </div>
        `;
    });
    
    document.getElementById('attendanceList').innerHTML = html;
    document.getElementById('ddTotal').innerText = quanSoData.length;
    document.getElementById('ddPresent').innerText = presentCount;
    document.getElementById('ddAbsent').innerText = quanSoData.length - presentCount;
}

async function markAttendance(id, isPresent) {
    const date = document.getElementById('attendanceDate').value;
    const ref = db.collection('attendance').doc(date);
    const doc = await ref.get();
    const data = doc.exists ? doc.data() : {};
    data[id] = isPresent;
    await ref.set(data);
    await loadDiemDanhByDate();
    showToast('Đã cập nhật điểm danh!', 'success');
}

async function saveAttendance() {
    showToast('Đã lưu điểm danh!', 'success');
}

// Hiển thị thống kê
function showThongKe() {
    const container = document.getElementById('quanSoContent');
    if(!container) return;
    
    document.getElementById('tabDS').style.background = '#95a5a6';
    document.getElementById('tabDD').style.background = '#95a5a6';
    document.getElementById('tabTK').style.background = '#2c3e50';
    
    const total = quanSoData.length;
    const nam = quanSoData.filter(m => m.gender === 'Nam').length;
    const nu = total - nam;
    const siQuan = quanSoData.filter(m => m.rank?.includes('úy') || m.position === 'Sĩ quan').length;
    
    let html = `
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value">${total}</div><div class="stat-label">Tổng quân số</div></div>
            <div class="stat-card present"><div class="stat-value">${nam}</div><div class="stat-label">Nam</div></div>
            <div class="stat-card absent"><div class="stat-value">${nu}</div><div class="stat-label">Nữ</div></div>
            <div class="stat-card leave"><div class="stat-value">${siQuan}</div><div class="stat-label">Sĩ quan</div></div>
        </div>
        <div class="section-title"><h3>CHI TIẾT THEO CẤP BẬC</h3></div>
        <div id="rankStats"></div>
    `;
    container.innerHTML = html;
    
    // Thống kê theo cấp bậc
    const rankCount = {};
    quanSoData.forEach(m => {
        const rank = m.rank || 'Chiến sĩ';
        rankCount[rank] = (rankCount[rank] || 0) + 1;
    });
    
    let rankHtml = '';
    for(const [rank, count] of Object.entries(rankCount)) {
        rankHtml += `<div class="list-item"><div class="list-info"><div class="list-title">${rank}</div></div><div>${count} người</div></div>`;
    }
    document.getElementById('rankStats').innerHTML = rankHtml;
}

function updateThongKe() {
    // Cập nhật thống kê khi có thay đổi
}

// CRUD Members
function showAddMemberModal() {
    currentEditId = null;
    document.getElementById('quanSoContent').innerHTML += `
        <div id="memberModal" class="modal" style="display:flex;">
            <div class="modal-content">
                <h3>Thêm quân nhân mới</h3>
                <input type="text" id="memberName" placeholder="Họ tên *">
                <input type="text" id="memberRank" placeholder="Cấp bậc">
                <input type="text" id="memberPosition" placeholder="Chức vụ">
                <input type="text" id="memberPhone" placeholder="Số điện thoại">
                <div class="modal-buttons">
                    <button onclick="saveMember()" class="success">Lưu</button>
                    <button onclick="closeMemberModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
}

function closeMemberModal() {
    const modal = document.getElementById('memberModal');
    if(modal) modal.remove();
}

async function saveMember() {
    const name = document.getElementById('memberName').value.trim();
    if(!name) { showToast('Vui lòng nhập họ tên!', 'error'); return; }
    
    const data = {
        name: name,
        rank: document.getElementById('memberRank').value || 'Chiến sĩ',
        position: document.getElementById('memberPosition').value || 'Thành viên',
        phone: document.getElementById('memberPhone').value || '',
        status: 'present',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        await db.collection('members').add(data);
        showToast('Đã thêm quân nhân!', 'success');
        closeMemberModal();
        await loadQuanSoData();
        showQuanSoList();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

async function editMember(id) {
    const member = quanSoData.find(m => m.id === id);
    if(!member) return;
    
    currentEditId = id;
    document.getElementById('quanSoContent').innerHTML += `
        <div id="memberModal" class="modal" style="display:flex;">
            <div class="modal-content">
                <h3>Sửa thông tin quân nhân</h3>
                <input type="text" id="memberName" value="${member.name}" placeholder="Họ tên *">
                <input type="text" id="memberRank" value="${member.rank || ''}" placeholder="Cấp bậc">
                <input type="text" id="memberPosition" value="${member.position || ''}" placeholder="Chức vụ">
                <input type="text" id="memberPhone" value="${member.phone || ''}" placeholder="Số điện thoại">
                <div class="modal-buttons">
                    <button onclick="updateMember()" class="success">Cập nhật</button>
                    <button onclick="closeMemberModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
}

async function updateMember() {
    const name = document.getElementById('memberName').value.trim();
    if(!name) { showToast('Vui lòng nhập họ tên!', 'error'); return; }
    
    const data = {
        name: name,
        rank: document.getElementById('memberRank').value || 'Chiến sĩ',
        position: document.getElementById('memberPosition').value || 'Thành viên',
        phone: document.getElementById('memberPhone').value || '',
        updatedAt: new Date().toISOString()
    };
    
    try {
        await db.collection('members').doc(currentEditId).update(data);
        showToast('Đã cập nhật!', 'success');
        closeMemberModal();
        await loadQuanSoData();
        showQuanSoList();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

async function deleteMember(id) {
    if(confirm('Bạn có chắc muốn xóa quân nhân này?')) {
        try {
            await db.collection('members').doc(id).delete();
            showToast('Đã xóa!', 'success');
            await loadQuanSoData();
            showQuanSoList();
        } catch(error) {
            showToast('Lỗi: ' + error.message, 'error');
        }
    }
}

// Xuất Excel
async function exportQuanSoExcel() {
    const data = quanSoData.map((m, i) => ({
        'STT': i+1,
        'Họ tên': m.name,
        'Cấp bậc': m.rank,
        'Chức vụ': m.position,
        'Số điện thoại': m.phone,
        'Ngày tạo': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách quân số');
    XLSX.writeFile(wb, `QuanSo_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}