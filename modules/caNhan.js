// ========== MODULE CÁ NHÂN - THÔNG TIN, CÀI ĐẶT, PHÂN QUYỀN ==========

let currentEditId = null;

function initCaNhan() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>👤 THÔNG TIN CÁ NHÂN</h3></div>
        
        <!-- Avatar -->
        <div style="text-align: center; margin-bottom: 20px;">
            <div class="profile-avatar" id="profileAvatar" onclick="openAvatarEditor()">
                <div id="avatarText">${currentUser?.email?.charAt(0).toUpperCase() || 'U'}</div>
            </div>
            <button onclick="openAvatarEditor()" class="warning" style="width: auto; margin-top: 10px; padding: 6px 20px;"><i class="fas fa-camera"></i> Đổi ảnh đại diện</button>
        </div>
        
        <!-- Thông tin cơ bản -->
        <div class="card">
            <div class="card-title">📝 THÔNG TIN CƠ BẢN</div>
            <div id="profileBasicInfo"></div>
            <button onclick="toggleEditProfile()" class="warning"><i class="fas fa-edit"></i> Chỉnh sửa thông tin</button>
            <div id="editProfileForm" style="display:none; margin-top: 15px;">
                <input type="text" id="editName" placeholder="Họ và tên">
                <input type="text" id="editRank" placeholder="Cấp bậc">
                <input type="text" id="editPosition" placeholder="Chức vụ">
                <input type="text" id="editPhone" placeholder="Số điện thoại">
                <input type="text" id="editUnit" placeholder="Đơn vị">
                <button onclick="saveProfile()" class="success">Lưu thay đổi</button>
            </div>
        </div>
        
        <!-- Thống kê cá nhân -->
        <div class="card">
            <div class="card-title">📊 THỐNG KÊ CÁ NHÂN</div>
            <div class="stats-grid" id="personalStats">
                <div class="stat-card total"><div class="stat-value" id="statSoNgay">0</div><div class="stat-label">Số ngày có mặt</div></div>
                <div class="stat-card present"><div class="stat-value" id="statSoLanDiMuon">0</div><div class="stat-label">Số lần đi muộn</div></div>
                <div class="stat-card absent"><div class="stat-value" id="statSoLanVang">0</div><div class="stat-label">Số lần vắng</div></div>
                <div class="stat-card leave"><div class="stat-value" id="statSoLanCongTac">0</div><div class="stat-label">Số lần công tác</div></div>
            </div>
        </div>
        
        <!-- Đơn đăng ký của tôi -->
        <div class="card">
            <div class="card-title">📋 ĐƠN ĐĂNG KÝ CỦA TÔI</div>
            <div id="myRequests"></div>
        </div>
        
        <!-- Phân quyền (Chỉ hiển thị với Lớp trưởng) -->
        <div class="card" id="roleManagementCard" style="display:none;">
            <div class="card-title">🔐 PHÂN QUYỀN HỆ THỐNG</div>
            <div id="roleManagement"></div>
        </div>
        
        <!-- Cài đặt ứng dụng -->
        <div class="card">
            <div class="card-title">⚙️ CÀI ĐẶT ỨNG DỤNG</div>
            <div class="setting-item" onclick="toggleDarkMode()">
                <span><i class="fas fa-moon"></i> Chế độ tối</span>
                <span class="setting-switch" id="darkModeSwitch">OFF</span>
            </div>
            <div class="setting-item" onclick="clearCache()">
                <span><i class="fas fa-trash-alt"></i> Xóa bộ nhớ đệm</span>
                <span class="setting-arrow"><i class="fas fa-chevron-right"></i></span>
            </div>
            <div class="setting-item" onclick="exportPersonalData()">
                <span><i class="fas fa-download"></i> Xuất dữ liệu cá nhân</span>
                <span class="setting-arrow"><i class="fas fa-chevron-right"></i></span>
            </div>
        </div>
        
        <!-- Đăng xuất -->
        <button onclick="logout()" class="danger" style="margin-bottom: 20px;"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .profile-avatar {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #1e3a5f, #2d5a8b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            cursor: pointer;
            transition: 0.2s;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .profile-avatar:hover { transform: scale(1.05); }
        .profile-avatar #avatarText { font-size: 40px; color: white; font-weight: bold; }
        .profile-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        
        .card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eef2f6; }
        .card-title { font-size: 16px; font-weight: 600; color: #1e3a5f; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #eef2f6; }
        
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eef2f6; }
        .info-label { width: 100px; font-weight: 600; color: #374151; font-size: 14px; }
        .info-value { flex: 1; color: #6b7280; font-size: 14px; }
        
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eef2f6; cursor: pointer; }
        .setting-item:hover { background: #f8fafc; }
        .setting-switch { background: #eef2f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #6b7280; }
        .setting-arrow { color: #94a3b8; }
        
        .request-item { padding: 12px; border-bottom: 1px solid #eef2f6; }
        .request-status-pending { color: #f39c12; }
        .request-status-approved { color: #27ae60; }
        .request-status-rejected { color: #e74c3c; }
    `;
    document.head.appendChild(style);
    
    loadProfileData();
    loadPersonalStats();
    loadMyRequests();
    loadRoleManagement();
}

// Load thông tin cá nhân
async function loadProfileData() {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.exists ? userDoc.data() : { 
        name: currentUser.email.split('@')[0], 
        rank: 'Chiến sĩ', 
        position: 'Thành viên',
        phone: '',
        unit: 'Đại đội 1',
        avatar: null
    };
    
    // Hiển thị avatar
    if(userData.avatar) {
        document.getElementById('profileAvatar').innerHTML = `<img src="${userData.avatar}" alt="avatar">`;
        document.getElementById('avatarText').style.display = 'none';
    } else {
        document.getElementById('profileAvatar').innerHTML = `<div id="avatarText">${(userData.name || currentUser.email).charAt(0).toUpperCase()}</div>`;
    }
    
    // Hiển thị thông tin
    document.getElementById('profileBasicInfo').innerHTML = `
        <div class="info-row"><div class="info-label">Họ và tên</div><div class="info-value">${userData.name || '---'}</div></div>
        <div class="info-row"><div class="info-label">Cấp bậc</div><div class="info-value">${userData.rank || '---'}</div></div>
        <div class="info-row"><div class="info-label">Chức vụ</div><div class="info-value">${userData.position || '---'}</div></div>
        <div class="info-row"><div class="info-label">Đơn vị</div><div class="info-value">${userData.unit || 'Đại đội 1'}</div></div>
        <div class="info-row"><div class="info-label">Email</div><div class="info-value">${currentUser.email}</div></div>
        <div class="info-row"><div class="info-label">Số điện thoại</div><div class="info-value">${userData.phone || 'Chưa cập nhật'}</div></div>
    `;
    
    // Fill form chỉnh sửa
    document.getElementById('editName').value = userData.name || '';
    document.getElementById('editRank').value = userData.rank || '';
    document.getElementById('editPosition').value = userData.position || '';
    document.getElementById('editPhone').value = userData.phone || '';
    document.getElementById('editUnit').value = userData.unit || 'Đại đội 1';
}

// Chỉnh sửa thông tin
function toggleEditProfile() {
    const form = document.getElementById('editProfileForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveProfile() {
    const data = {
        name: document.getElementById('editName').value,
        rank: document.getElementById('editRank').value,
        position: document.getElementById('editPosition').value,
        phone: document.getElementById('editPhone').value,
        unit: document.getElementById('editUnit').value,
        updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(currentUser.uid).set(data, { merge: true });
    showToast('Đã lưu thông tin!', 'success');
    toggleEditProfile();
    loadProfileData();
}

// Đổi avatar
function openAvatarEditor() {
    const url = prompt('Nhập URL ảnh đại diện (hoặc để trống để dùng chữ cái đầu):');
    if(url) {
        db.collection('users').doc(currentUser.uid).set({ avatar: url }, { merge: true });
        document.getElementById('profileAvatar').innerHTML = `<img src="${url}" alt="avatar">`;
    } else {
        db.collection('users').doc(currentUser.uid).set({ avatar: null }, { merge: true });
        loadProfileData();
    }
}

// Load thống kê cá nhân
async function loadPersonalStats() {
    const attendanceSnap = await db.collection('attendance').get();
    let soNgay = 0;
    let soLanDiMuon = 0;
    let soLanVang = 0;
    let soLanCongTac = 0;
    
    attendanceSnap.forEach(doc => {
        const data = doc.data();
        if(data[currentUser.uid] === true) soNgay++;
        else if(data[currentUser.uid] === false) soLanVang++;
    });
    
    document.getElementById('statSoNgay').innerText = soNgay;
    document.getElementById('statSoLanDiMuon').innerText = soLanDiMuon;
    document.getElementById('statSoLanVang').innerText = soLanVang;
    document.getElementById('statSoLanCongTac').innerText = soLanCongTac;
}

// Load đơn đăng ký của tôi
async function loadMyRequests() {
    const leaveSnap = await db.collection('leaveRequests').where('userId', '==', currentUser.uid).orderBy('createdAt', 'desc').get();
    
    if(leaveSnap.empty) {
        document.getElementById('myRequests').innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">Chưa có đơn đăng ký nào</div>';
        return;
    }
    
    let html = '';
    for(const doc of leaveSnap.docs) {
        const l = doc.data();
        const statusClass = l.status === 'pending' ? 'request-status-pending' : (l.status === 'approved' ? 'request-status-approved' : 'request-status-rejected');
        const statusText = l.status === 'pending' ? '⏳ Chờ duyệt' : (l.status === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối');
        
        html += `
            <div class="request-item">
                <div><strong>🏃 Đăng ký tranh thủ</strong> <span class="${statusClass}">${statusText}</span></div>
                <div>📅 ${new Date(l.start).toLocaleString()} → ${new Date(l.end).toLocaleString()}</div>
                <div>📝 Lý do: ${l.reason}</div>
            </div>
        `;
    }
    document.getElementById('myRequests').innerHTML = html;
}

// Load phân quyền (chỉ Lớp trưởng)
async function loadRoleManagement() {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const isAdmin = userDoc.exists && (userDoc.data().position === 'Lớp trưởng' || userDoc.data().role === 'lop_truong');
    
    if(!isAdmin) {
        document.getElementById('roleManagementCard').style.display = 'none';
        return;
    }
    
    document.getElementById('roleManagementCard').style.display = 'block';
    
    const membersSnap = await db.collection('members').get();
    let html = '<table class="data-table" style="width:100%;"><thead><tr><th>Thành viên</th><th>Cấp bậc</th><th>Chức vụ hiện tại</th><th>Phân quyền mới</th></tr></thead><tbody>';
    
    membersSnap.forEach(doc => {
        const m = doc.data();
        html += `
            <tr>
                <td>${m.name}</td>
                <td>${m.rank || 'Chiến sĩ'}</td>
                <td>${m.position || 'Thành viên'}</td>
                <td>
                    <select onchange="updateRole('${doc.id}', this.value)" style="padding: 5px; font-size: 12px;">
                        <option ${m.position === 'Lớp trưởng' ? 'selected' : ''}>Lớp trưởng</option>
                        <option ${m.position === 'Chính trị viên' ? 'selected' : ''}>Chính trị viên</option>
                        <option ${m.position === 'Thủ quỹ' ? 'selected' : ''}>Thủ quỹ</option>
                        <option ${m.position === 'Tổ trưởng' ? 'selected' : ''}>Tổ trưởng</option>
                        <option ${m.position === 'Tổ phó' ? 'selected' : ''}>Tổ phó</option>
                        <option ${m.position === 'Chiến sĩ' ? 'selected' : ''}>Chiến sĩ</option>
                    </select>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    document.getElementById('roleManagement').innerHTML = html;
}

async function updateRole(id, newRole) {
    await db.collection('members').doc(id).update({ position: newRole });
    showToast(`Đã cập nhật chức vụ thành ${newRole}!`, 'success');
    loadRoleManagement();
}

// Cài đặt ứng dụng
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    const switchBtn = document.getElementById('darkModeSwitch');
    switchBtn.innerText = isDark ? 'ON' : 'OFF';
    localStorage.setItem('darkMode', isDark);
}

function clearCache() {
    if(confirm('Xóa bộ nhớ đệm sẽ giúp cập nhật giao diện mới nhất. Bạn có chắc?')) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
        showToast('Đã xóa bộ nhớ đệm! Vui lòng tải lại trang.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }
}

async function exportPersonalData() {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const leaveSnap = await db.collection('leaveRequests').where('userId', '==', currentUser.uid).get();
    
    const personalData = {
        thongTinCaNhan: userDoc.exists ? userDoc.data() : { email: currentUser.email },
        danhSachDonNghi: []
    };
    
    leaveSnap.forEach(doc => {
        personalData.danhSachDonNghi.push(doc.data());
    });
    
    const dataStr = JSON.stringify(personalData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_data_${currentUser.uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất dữ liệu cá nhân!', 'success');
}

// Đăng xuất
async function logout() {
    await auth.signOut();
    window.location.reload();
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Kiểm tra dark mode từ localStorage
if(localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}