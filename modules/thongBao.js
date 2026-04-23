// ========== MODULE THÔNG BÁO - TIN TỨC NỘI BỘ ==========

let thongBaoData = [];
let currentEditId = null;
let currentFilter = 'all'; // 'all', 'important', 'normal'

function initThongBao() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📢 THÔNG BÁO - TIN TỨC NỘI BỘ</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="tbTotal">0</div><div class="stat-label">Tổng thông báo</div></div>
            <div class="stat-card present"><div class="stat-value" id="tbChuaDoc">0</div><div class="stat-label">Chưa đọc</div></div>
            <div class="stat-card absent"><div class="stat-value" id="tbQuanTrong">0</div><div class="stat-label">Quan trọng</div></div>
            <div class="stat-card leave"><div class="stat-value" id="tbTuanNay">0</div><div class="stat-label">Tuần này</div></div>
        </div>

        <!-- Bộ lọc -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="btnAll" onclick="filterThongBao('all')" class="active-filter" style="flex:1; background: #2c3e50;">📋 Tất cả</button>
            <button id="btnImportant" onclick="filterThongBao('important')" style="flex:1; background: #95a5a6;">⭐ Quan trọng</button>
            <button id="btnNormal" onclick="filterThongBao('normal')" style="flex:1; background: #95a5a6;">📄 Bình thường</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchTB" placeholder="🔍 Tìm kiếm thông báo...">
            <button onclick="showAddThongBaoModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportThongBaoToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Danh sách thông báo -->
        <div id="tbList"></div>

        <!-- Modal Thêm/Sửa thông báo -->
        <div id="tbModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="tbModalTitle">Thêm thông báo mới</h3>
                
                <input type="text" id="tbTieuDe" placeholder="Tiêu đề thông báo *">
                <textarea id="tbNoiDung" rows="4" placeholder="Nội dung thông báo *"></textarea>
                
                <div class="flex" style="display: flex; gap: 10px;">
                    <select id="tbLoai" style="flex:1">
                        <option value="normal">📄 Bình thường</option>
                        <option value="important">⭐ Quan trọng</option>
                        <option value="urgent">🚨 Khẩn cấp</option>
                    </select>
                    <select id="tbDanhMuc" style="flex:1">
                        <option value="chung">Chung</option>
                        <option value="donvi">Đơn vị</option>
                        <option value="hocTap">Học tập</option>
                        <option value="congTac">Công tác</option>
                        <option value="khac">Khác</option>
                    </select>
                </div>
                
                <input type="datetime-local" id="tbThoiGian" placeholder="Thời gian đăng">
                <input type="text" id="tbNguoiDang" placeholder="Người đăng">
                
                <div class="modal-buttons">
                    <button onclick="saveThongBao()" class="success">Đăng thông báo</button>
                    <button onclick="closeTbModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết thông báo -->
        <div id="tbDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="detailTitle"></h3>
                <div id="tbDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeTbDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    // CSS
    const style = document.createElement('style');
    style.textContent = `
        .active-filter { opacity: 1; filter: brightness(1); }
        .tb-item { transition: 0.2s; }
        .tb-item-unread { background: #eef2ff; border-left: 3px solid #3b82f6; }
        .tb-important { border-left: 3px solid #e74c3c; }
        .tb-urgent { background: #fee2e2; border-left: 3px solid #e74c3c; }
        .badge-important { background: #e74c3c; color: white; }
        .badge-urgent { background: #c0392b; color: white; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        .tb-category { background: #eef2f6; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    `;
    document.head.appendChild(style);
    
    loadThongBao();
    
    // Tìm kiếm
    document.getElementById('searchTB').addEventListener('input', function(e) {
        searchThongBao(e.target.value);
    });
}

// Load dữ liệu từ Firestore
async function loadThongBao() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('thongBao').orderBy('thoiGian', 'desc').get();
        thongBaoData = [];
        snapshot.forEach(doc => {
            thongBaoData.push({ id: doc.id, ...doc.data() });
        });
        updateThongBaoStats();
        filterThongBao(currentFilter);
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateThongBaoStats() {
    const total = thongBaoData.length;
    const chuaDoc = thongBaoData.filter(item => !item.daDoc).length;
    const quanTrong = thongBaoData.filter(item => item.loai === 'important' || item.loai === 'urgent').length;
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const tuanNay = thongBaoData.filter(item => {
        if(!item.thoiGian) return false;
        return new Date(item.thoiGian) >= startOfWeek;
    }).length;
    
    document.getElementById('tbTotal').innerText = total;
    document.getElementById('tbChuaDoc').innerText = chuaDoc;
    document.getElementById('tbQuanTrong').innerText = quanTrong;
    document.getElementById('tbTuanNay').innerText = tuanNay;
}

// Lọc thông báo
function filterThongBao(filter) {
    currentFilter = filter;
    
    const btnAll = document.getElementById('btnAll');
    const btnImportant = document.getElementById('btnImportant');
    const btnNormal = document.getElementById('btnNormal');
    
    if(filter === 'all') {
        btnAll.style.background = '#2c3e50';
        btnImportant.style.background = '#95a5a6';
        btnNormal.style.background = '#95a5a6';
        displayThongBaoList(thongBaoData);
    } else if(filter === 'important') {
        btnAll.style.background = '#95a5a6';
        btnImportant.style.background = '#2c3e50';
        btnNormal.style.background = '#95a5a6';
        const filtered = thongBaoData.filter(item => item.loai === 'important' || item.loai === 'urgent');
        displayThongBaoList(filtered);
    } else {
        btnAll.style.background = '#95a5a6';
        btnImportant.style.background = '#95a5a6';
        btnNormal.style.background = '#2c3e50';
        const filtered = thongBaoData.filter(item => item.loai === 'normal');
        displayThongBaoList(filtered);
    }
}

// Hiển thị danh sách thông báo
function displayThongBaoList(items) {
    const container = document.getElementById('tbList');
    if(!container) return;
    
    if(items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có thông báo nào. Nhấn "Thêm" để đăng thông báo đầu tiên.</div>';
        return;
    }
    
    let html = '';
    items.forEach(item => {
        const isUnread = !item.daDoc;
        const isImportant = item.loai === 'important';
        const isUrgent = item.loai === 'urgent';
        const icon = isUrgent ? '🚨' : (isImportant ? '⭐' : '📢');
        const categoryText = getCategoryText(item.danhMuc);
        const timeAgo = getTimeAgo(item.thoiGian);
        
        let extraClass = '';
        if(isUrgent) extraClass = 'tb-urgent';
        else if(isImportant) extraClass = 'tb-important';
        if(isUnread) extraClass += ' tb-item-unread';
        
        html += `
            <div class="list-item tb-item ${extraClass}" onclick="viewThongBaoDetail('${item.id}')" style="cursor: pointer;">
                <div class="list-icon" style="background: ${isUrgent ? '#c0392b' : (isImportant ? '#e74c3c' : '#2c3e50')}; color: white;">${icon}</div>
                <div class="list-info">
                    <div class="list-title">
                        ${isUrgent ? '<span class="badge-urgent" style="padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 5px;">KHẨN CẤP</span>' : ''}
                        ${item.tieuDe || 'Không có tiêu đề'}
                    </div>
                    <div class="list-desc">
                        <span class="tb-category">${categoryText}</span>
                        <span>📅 ${timeAgo}</span>
                        <span>👤 ${item.nguoiDang || 'Hệ thống'}</span>
                    </div>
                    <div class="list-desc">${(item.noiDung || '').substring(0, 80)}${(item.noiDung || '').length > 80 ? '...' : ''}</div>
                </div>
                <div>
                    ${isUnread ? '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 20px; font-size: 10px;">Mới</span>' : ''}
                    <div style="margin-top: 5px;">
                        <button onclick="event.stopPropagation(); editThongBao('${item.id}')" style="width: auto; padding: 5px 10px; background: #f59e0b; font-size: 11px;"><i class="fas fa-edit"></i></button>
                        <button onclick="event.stopPropagation(); deleteThongBao('${item.id}')" style="width: auto; padding: 5px 10px; background: #e74c3c; font-size: 11px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Lấy text danh mục
function getCategoryText(category) {
    const categories = {
        'chung': '📢 Chung',
        'donvi': '🏢 Đơn vị',
        'hocTap': '📚 Học tập',
        'congTac': '📋 Công tác',
        'khac': '📌 Khác'
    };
    return categories[category] || '📢 Chung';
}

// Tính thời gian đã qua
function getTimeAgo(dateStr) {
    if(!dateStr) return 'Chưa có ngày';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if(minutes < 1) return 'Vừa xong';
    if(minutes < 60) return `${minutes} phút trước`;
    if(hours < 24) return `${hours} giờ trước`;
    if(days < 7) return `${days} ngày trước`;
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
}

// Đánh dấu đã đọc
async function markAsRead(id) {
    const item = thongBaoData.find(i => i.id === id);
    if(item && !item.daDoc) {
        await db.collection('thongBao').doc(id).update({ daDoc: true });
        await loadThongBao();
    }
}

// Tìm kiếm
function searchThongBao(keyword) {
    if(!keyword.trim()) {
        filterThongBao(currentFilter);
        return;
    }
    const filtered = thongBaoData.filter(item => 
        (item.tieuDe || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (item.noiDung || '').toLowerCase().includes(keyword.toLowerCase())
    );
    displayThongBaoList(filtered);
}

// Hiển thị modal thêm
function showAddThongBaoModal() {
    currentEditId = null;
    document.getElementById('tbModalTitle').innerText = 'Đăng thông báo mới';
    document.getElementById('tbTieuDe').value = '';
    document.getElementById('tbNoiDung').value = '';
    document.getElementById('tbLoai').value = 'normal';
    document.getElementById('tbDanhMuc').value = 'chung';
    document.getElementById('tbThoiGian').value = new Date().toISOString().slice(0, 16);
    document.getElementById('tbNguoiDang').value = currentUser?.email?.split('@')[0] || 'Admin';
    document.getElementById('tbModal').style.display = 'flex';
}

// Sửa thông báo
function editThongBao(id) {
    const item = thongBaoData.find(i => i.id === id);
    if(!item) return;
    currentEditId = id;
    document.getElementById('tbModalTitle').innerText = 'Sửa thông báo';
    document.getElementById('tbTieuDe').value = item.tieuDe || '';
    document.getElementById('tbNoiDung').value = item.noiDung || '';
    document.getElementById('tbLoai').value = item.loai || 'normal';
    document.getElementById('tbDanhMuc').value = item.danhMuc || 'chung';
    document.getElementById('tbThoiGian').value = item.thoiGian || '';
    document.getElementById('tbNguoiDang').value = item.nguoiDang || '';
    document.getElementById('tbModal').style.display = 'flex';
}

// Lưu thông báo
async function saveThongBao() {
    const tieuDe = document.getElementById('tbTieuDe').value.trim();
    const noiDung = document.getElementById('tbNoiDung').value.trim();
    
    if(!tieuDe || !noiDung) {
        showToast('Vui lòng nhập tiêu đề và nội dung!', 'error');
        return;
    }
    
    const data = {
        tieuDe: tieuDe,
        noiDung: noiDung,
        loai: document.getElementById('tbLoai').value,
        danhMuc: document.getElementById('tbDanhMuc').value,
        thoiGian: document.getElementById('tbThoiGian').value || new Date().toISOString(),
        nguoiDang: document.getElementById('tbNguoiDang').value || currentUser?.email?.split('@')[0] || 'Admin',
        daDoc: false,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if(currentEditId) {
            await db.collection('thongBao').doc(currentEditId).update(data);
            showToast('Đã cập nhật thông báo!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('thongBao').add(data);
            showToast('Đã đăng thông báo mới!', 'success');
            
            // Hiển thị thông báo desktop nếu được phép
            if(Notification.permission === 'granted') {
                new Notification('SH13A - Thông báo mới', {
                    body: tieuDe,
                    icon: 'logo.png'
                });
            }
        }
        closeTbModal();
        await loadThongBao();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xóa thông báo
async function deleteThongBao(id) {
    if(confirm('Bạn có chắc muốn xóa thông báo này?')) {
        try {
            await db.collection('thongBao').doc(id).delete();
            showToast('Đã xóa!', 'success');
            await loadThongBao();
        } catch(error) {
            showToast('Lỗi: ' + error.message, 'error');
        }
    }
}

// Xem chi tiết thông báo
async function viewThongBaoDetail(id) {
    const item = thongBaoData.find(i => i.id === id);
    if(!item) return;
    
    // Đánh dấu đã đọc
    if(!item.daDoc) {
        await markAsRead(id);
    }
    
    const icon = item.loai === 'urgent' ? '🚨' : (item.loai === 'important' ? '⭐' : '📢');
    const categoryText = getCategoryText(item.danhMuc);
    
    document.getElementById('detailTitle').innerHTML = `${icon} ${item.tieuDe}`;
    document.getElementById('tbDetailContent').innerHTML = `
        <div style="margin-bottom: 15px;">
            <div class="list-desc" style="margin-bottom: 10px;">
                <span class="tb-category">${categoryText}</span>
                <span>📅 ${formatDateTimeFull(item.thoiGian)}</span>
                <span>👤 ${item.nguoiDang || 'Hệ thống'}</span>
            </div>
            <hr style="margin: 10px 0;">
            <div style="white-space: pre-wrap; line-height: 1.6;">${item.noiDung || 'Không có nội dung'}</div>
            <hr style="margin: 10px 0;">
            <div class="modal-buttons" style="margin-top: 15px;">
                <button onclick="editThongBao('${item.id}'); closeTbDetailModal();" style="background: #f59e0b;">✏️ Sửa</button>
                <button onclick="deleteThongBao('${item.id}'); closeTbDetailModal();" style="background: #e74c3c;">🗑️ Xóa</button>
            </div>
        </div>
    `;
    document.getElementById('tbDetailModal').style.display = 'flex';
}

// Xuất Excel
async function exportThongBaoToExcel() {
    const data = thongBaoData.map((item, i) => ({
        'STT': i + 1,
        'Tiêu đề': item.tieuDe,
        'Nội dung': item.noiDung,
        'Loại': item.loai === 'urgent' ? 'Khẩn cấp' : (item.loai === 'important' ? 'Quan trọng' : 'Bình thường'),
        'Danh mục': getCategoryText(item.danhMuc),
        'Thời gian đăng': formatDateTimeFull(item.thoiGian),
        'Người đăng': item.nguoiDang,
        'Đã đọc': item.daDoc ? 'Có' : 'Chưa'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thông báo');
    XLSX.writeFile(wb, `ThongBao_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

// Hàm tiện ích
function formatDateTimeFull(dateStr) {
    if(!dateStr) return '---';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function closeTbModal() {
    document.getElementById('tbModal').style.display = 'none';
    currentEditId = null;
}

function closeTbDetailModal() {
    document.getElementById('tbDetailModal').style.display = 'none';
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Yêu cầu quyền thông báo trình duyệt
if('Notification' in window) {
    Notification.requestPermission();
}