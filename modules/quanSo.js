// ========== MODULE QUÂN SỐ ==========
// Module này quản lý: Danh sách, thêm/sửa/xóa, điểm danh, xuất Excel

let currentEditId = null;
let allMembers = [];

// Khởi tạo module
function initQuanSo() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div id="quanSoModule">
            <!-- Thống kê -->
            <div class="stats-grid">
                <div class="stat-card total"><div class="stat-icon">👥</div><div class="stat-value" id="qsTotalCount">0</div><div class="stat-label">Tổng quân số</div></div>
                <div class="stat-card present"><div class="stat-icon">✅</div><div class="stat-value" id="qsPresentCount">0</div><div class="stat-label">Có mặt</div></div>
                <div class="stat-card absent"><div class="stat-icon">❌</div><div class="stat-value" id="qsAbsentCount">0</div><div class="stat-label">Vắng</div></div>
                <div class="stat-card leave"><div class="stat-icon">🏃</div><div class="stat-value" id="qsLeaveCount">0</div><div class="stat-label">Tranh thủ</div></div>
            </div>

            <!-- Thanh công cụ -->
            <div class="search-bar" style="padding: 0 15px 15px; display: flex; gap: 10px;">
                <input type="text" id="searchQuanSo" placeholder="🔍 Tìm kiếm theo tên, cấp bậc..." style="flex: 1;">
                <button onclick="showAddMemberModal()" class="success" style="width: auto; padding: 10px 20px;"><i class="fas fa-plus"></i> Thêm</button>
                <button onclick="exportQuanSoToExcel()" class="success" style="width: auto; padding: 10px 20px; background: #27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
            </div>

            <!-- Danh sách quân số -->
            <div id="quanSoList" style="padding: 0 15px;"></div>
        </div>

        <!-- Modal Thêm/Sửa -->
        <div id="memberModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="modalTitle">Thêm quân nhân mới</h3>
                <input type="text" id="memberName" placeholder="Họ và tên *">
                <input type="text" id="memberRank" placeholder="Cấp bậc (VD: Thiếu úy)">
                <input type="text" id="memberPosition" placeholder="Chức vụ (VD: Trung đội trưởng)">
                <select id="memberGender">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </select>
                <input type="date" id="memberDoB" placeholder="Ngày sinh">
                <input type="text" id="memberHometown" placeholder="Quê quán">
                <input type="date" id="memberEnlistDate" placeholder="Ngày nhập ngũ">
                <input type="text" id="memberPhone" placeholder="Số điện thoại">
                <div class="modal-buttons">
                    <button onclick="saveMember()" class="success">Lưu</button>
                    <button onclick="closeMemberModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    // Load dữ liệu
    loadQuanSoData();
    
    // Tìm kiếm realtime
    document.getElementById('searchQuanSo').addEventListener('input', function(e) {
        searchQuanSo(e.target.value);
    });
}

// Load dữ liệu từ Firestore
async function loadQuanSoData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('members').orderBy('name').get();
        allMembers = [];
        snapshot.forEach(doc => {
            allMembers.push({ id: doc.id, ...doc.data() });
        });
        displayQuanSoList(allMembers);
        updateQuanSoStats();
    } catch(error) {
        console.error('Lỗi tải dữ liệu:', error);
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Hiển thị danh sách
function displayQuanSoList(members) {
    const container = document.getElementById('quanSoList');
    if(!container) return;
    
    if(members.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu. Nhấn "Thêm" để thêm quân nhân.</div>';
        return;
    }
    
    let html = '';
    members.forEach(m => {
        const statusClass = m.status === 'present' ? 'status-present' : (m.status === 'leave' ? 'status-leave' : 'status-mission');
        const statusText = m.status === 'present' ? 'Có mặt' : (m.status === 'leave' ? 'Tranh thủ' : 'Công tác');
        html += `
            <div class="list-item">
                <div class="list-icon" style="background: #2d5a8b; color: white;">${m.name.charAt(0)}</div>
                <div class="list-info">
                    <div class="list-title">${m.name}</div>
                    <div class="list-desc">${m.rank || 'Chiến sĩ'} - ${m.position || 'Thành viên'}</div>
                    <div class="list-desc">📅 ${m.enlistDate || 'Chưa có'} | 📍 ${m.hometown || 'Chưa có'}</div>
                </div>
                <div>
                    <span class="member-status ${statusClass}" style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px;">${statusText}</span>
                    <button onclick="editMember('${m.id}')" style="width: auto; padding: 6px 12px; margin-top: 5px; background: #f59e0b; font-size: 12px;"><i class="fas fa-edit"></i> Sửa</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Cập nhật thống kê
async function updateQuanSoStats() {
    const total = allMembers.length;
    const present = allMembers.filter(m => m.status === 'present').length;
    const leave = allMembers.filter(m => m.status === 'leave').length;
    
    document.getElementById('qsTotalCount').innerText = total;
    document.getElementById('qsPresentCount').innerText = present;
    document.getElementById('qsAbsentCount').innerText = total - present;
    document.getElementById('qsLeaveCount').innerText = leave;
}

// Tìm kiếm
function searchQuanSo(keyword) {
    if(!keyword.trim()) {
        displayQuanSoList(allMembers);
        return;
    }
    const filtered = allMembers.filter(m => 
        m.name.toLowerCase().includes(keyword.toLowerCase()) || 
        (m.rank || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (m.position || '').toLowerCase().includes(keyword.toLowerCase())
    );
    displayQuanSoList(filtered);
}

// Hiển thị modal thêm
function showAddMemberModal() {
    currentEditId = null;
    document.getElementById('modalTitle').innerText = 'Thêm quân nhân mới';
    document.getElementById('memberName').value = '';
    document.getElementById('memberRank').value = '';
    document.getElementById('memberPosition').value = '';
    document.getElementById('memberGender').value = 'Nam';
    document.getElementById('memberDoB').value = '';
    document.getElementById('memberHometown').value = '';
    document.getElementById('memberEnlistDate').value = '';
    document.getElementById('memberPhone').value = '';
    document.getElementById('memberModal').style.display = 'flex';
}

// Sửa thành viên
function editMember(id) {
    const member = allMembers.find(m => m.id === id);
    if(!member) return;
    currentEditId = id;
    document.getElementById('modalTitle').innerText = 'Sửa thông tin quân nhân';
    document.getElementById('memberName').value = member.name || '';
    document.getElementById('memberRank').value = member.rank || '';
    document.getElementById('memberPosition').value = member.position || '';
    document.getElementById('memberGender').value = member.gender || 'Nam';
    document.getElementById('memberDoB').value = member.dob || '';
    document.getElementById('memberHometown').value = member.hometown || '';
    document.getElementById('memberEnlistDate').value = member.enlistDate || '';
    document.getElementById('memberPhone').value = member.phone || '';
    document.getElementById('memberModal').style.display = 'flex';
}

// Lưu thành viên
async function saveMember() {
    const name = document.getElementById('memberName').value.trim();
    if(!name) {
        showToast('Vui lòng nhập họ tên!', 'error');
        return;
    }
    
    const data = {
        name: name,
        rank: document.getElementById('memberRank').value || 'Chiến sĩ',
        position: document.getElementById('memberPosition').value || 'Thành viên',
        gender: document.getElementById('memberGender').value,
        dob: document.getElementById('memberDoB').value,
        hometown: document.getElementById('memberHometown').value,
        enlistDate: document.getElementById('memberEnlistDate').value,
        phone: document.getElementById('memberPhone').value,
        status: 'present',
        updatedAt: new Date().toISOString()
    };
    
    try {
        if(currentEditId) {
            await db.collection('members').doc(currentEditId).update(data);
            showToast('Đã cập nhật thông tin!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('members').add(data);
            showToast('Đã thêm quân nhân mới!', 'success');
        }
        closeMemberModal();
        await loadQuanSoData();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Đóng modal
function closeMemberModal() {
    document.getElementById('memberModal').style.display = 'none';
    currentEditId = null;
}

// Xuất Excel
async function exportQuanSoToExcel() {
    const data = allMembers.map((m, i) => ({
        'STT': i + 1,
        'Họ tên': m.name,
        'Cấp bậc': m.rank,
        'Chức vụ': m.position,
        'Giới tính': m.gender,
        'Ngày sinh': m.dob,
        'Quê quán': m.hometown,
        'Ngày nhập ngũ': m.enlistDate,
        'Số điện thoại': m.phone,
        'Trạng thái': m.status === 'present' ? 'Có mặt' : (m.status === 'leave' ? 'Tranh thủ' : 'Công tác')
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách quân số');
    XLSX.writeFile(wb, `QuanSo_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

// Thông báo
function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}