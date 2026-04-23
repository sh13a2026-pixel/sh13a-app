// ========== MODULE LỊCH CÔNG TÁC - QUẢN LÝ LỊCH TUẦN, THÁNG, NĂM ==========

let lichData = [];
let currentEditId = null;
let currentViewMode = 'week'; // 'week', 'month'
let currentDate = new Date();

function initLich() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📅 LỊCH CÔNG TÁC</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="lichTotal">0</div><div class="stat-label">Tổng công việc</div></div>
            <div class="stat-card present"><div class="stat-value" id="lichHoanThanh">0</div><div class="stat-label">Đã hoàn thành</div></div>
            <div class="stat-card absent"><div class="stat-value" id="lichChuaHoanThanh">0</div><div class="stat-label">Chưa hoàn thành</div></div>
            <div class="stat-card leave"><div class="stat-value" id="lichQuaHan">0</div><div class="stat-label">Quá hạn</div></div>
        </div>

        <!-- Điều khiển lịch -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px; align-items: center;">
            <button onclick="previousPeriod()" style="width: auto; padding: 8px 15px;"><i class="fas fa-chevron-left"></i></button>
            <div id="lichTitle" style="flex: 1; text-align: center; font-size: 18px; font-weight: bold; color: #1e3a5f;"></div>
            <button onclick="nextPeriod()" style="width: auto; padding: 8px 15px;"><i class="fas fa-chevron-right"></i></button>
            <button onclick="todayPeriod()" style="width: auto; padding: 8px 15px; background: #27ae60;">Hôm nay</button>
        </div>

        <!-- Tab chuyển đổi chế độ xem -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="btnWeek" onclick="switchLichMode('week')" class="active-tab" style="flex:1;">📅 Tuần</button>
            <button id="btnMonth" onclick="switchLichMode('month')" style="flex:1;">📆 Tháng</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchLich" placeholder="🔍 Tìm kiếm công việc...">
            <button onclick="showAddLichModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportLichToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Nội dung lịch -->
        <div id="lichContent"></div>

        <!-- Modal Thêm/Sửa công việc -->
        <div id="lichModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="lichModalTitle">Thêm công việc mới</h3>
                
                <input type="text" id="lichTen" placeholder="Tên công việc *">
                <textarea id="lichMoTa" rows="2" placeholder="Mô tả chi tiết"></textarea>
                
                <div class="flex" style="display: flex; gap: 10px;">
                    <input type="datetime-local" id="lichThoiGianBatDau" style="flex:1" placeholder="Thời gian bắt đầu">
                    <input type="datetime-local" id="lichThoiGianKetThuc" style="flex:1" placeholder="Thời gian kết thúc">
                </div>
                
                <select id="lichMucDoUuTien">
                    <option value="cao">🔴 Ưu tiên cao</option>
                    <option value="trung">🟡 Ưu tiên trung bình</option>
                    <option value="thap">🟢 Ưu tiên thấp</option>
                </select>
                
                <select id="lichTrangThai">
                    <option value="chua">⏳ Chưa thực hiện</option>
                    <option value="dang">🔄 Đang thực hiện</option>
                    <option value="hoan">✅ Đã hoàn thành</option>
                </select>
                
                <input type="text" id="lichNguoiPhuTrach" placeholder="Người phụ trách">
                <input type="text" id="lichDonVi" placeholder="Đơn vị thực hiện">
                <input type="text" id="lichDiaDiem" placeholder="Địa điểm">
                <textarea id="lichGhiChu" rows="2" placeholder="Ghi chú"></textarea>
                
                <div class="modal-buttons">
                    <button onclick="saveLich()" class="success">Lưu</button>
                    <button onclick="closeLichModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Chi tiết công việc -->
        <div id="lichDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📋 CHI TIẾT CÔNG VIỆC</h3>
                <div id="lichDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeLichDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    // CSS
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { background: #2c3e50 !important; color: white; }
        .lich-week-view { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 15px; }
        .lich-day-card { background: white; border-radius: 16px; padding: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eef2f6; }
        .lich-day-header { font-weight: bold; padding-bottom: 8px; border-bottom: 1px solid #eef2f6; margin-bottom: 8px; color: #1e3a5f; }
        .lich-event { background: #eef2f6; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; font-size: 12px; cursor: pointer; transition: 0.2s; }
        .lich-event:hover { transform: translateX(2px); }
        .lich-event-cao { border-left: 3px solid #e74c3c; }
        .lich-event-trung { border-left: 3px solid #f39c12; }
        .lich-event-thap { border-left: 3px solid #27ae60; }
        .lich-event-hoan { opacity: 0.6; text-decoration: line-through; }
        .lich-month-view { padding: 15px; }
        .lich-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .lich-month-day { background: white; border-radius: 12px; padding: 8px; min-height: 80px; border: 1px solid #eef2f6; }
        .lich-month-day-number { font-weight: bold; font-size: 14px; margin-bottom: 5px; color: #1e3a5f; }
        .lich-month-day-other { background: #f8fafc; color: #94a3b8; }
        .lich-event-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 3px; }
        .priority-cao { background: #e74c3c; }
        .priority-trung { background: #f39c12; }
        .priority-thap { background: #27ae60; }
    `;
    document.head.appendChild(style);
    
    loadLich();
    updateLichDisplay();
    
    // Tìm kiếm
    document.getElementById('searchLich').addEventListener('input', function(e) {
        searchLich(e.target.value);
    });
}

// Load dữ liệu từ Firestore
async function loadLich() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('lichCongTac').orderBy('thoiGianBatDau', 'desc').get();
        lichData = [];
        snapshot.forEach(doc => {
            lichData.push({ id: doc.id, ...doc.data() });
        });
        updateLichStats();
        updateLichDisplay();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật thống kê
function updateLichStats() {
    const total = lichData.length;
    const hoanThanh = lichData.filter(item => item.trangThai === 'hoan').length;
    const chuaHoanThanh = lichData.filter(item => item.trangThai !== 'hoan').length;
    const now = new Date();
    const quaHan = lichData.filter(item => {
        if(item.trangThai === 'hoan') return false;
        if(!item.thoiGianKetThuc) return false;
        return new Date(item.thoiGianKetThuc) < now;
    }).length;
    
    document.getElementById('lichTotal').innerText = total;
    document.getElementById('lichHoanThanh').innerText = hoanThanh;
    document.getElementById('lichChuaHoanThanh').innerText = chuaHoanThanh;
    document.getElementById('lichQuaHan').innerText = quaHan;
}

// Chuyển chế độ xem
function switchLichMode(mode) {
    currentViewMode = mode;
    const btnWeek = document.getElementById('btnWeek');
    const btnMonth = document.getElementById('btnMonth');
    
    if(mode === 'week') {
        btnWeek.style.background = '#2c3e50';
        btnMonth.style.background = '#95a5a6';
    } else {
        btnWeek.style.background = '#95a5a6';
        btnMonth.style.background = '#2c3e50';
    }
    updateLichDisplay();
}

// Điều khiển lịch
function previousPeriod() {
    if(currentViewMode === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
    updateLichDisplay();
}

function nextPeriod() {
    if(currentViewMode === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    updateLichDisplay();
}

function todayPeriod() {
    currentDate = new Date();
    updateLichDisplay();
}

// Cập nhật hiển thị lịch
function updateLichDisplay() {
    if(currentViewMode === 'week') {
        displayWeekView();
    } else {
        displayMonthView();
    }
}

// Hiển thị tuần
function displayWeekView() {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    document.getElementById('lichTitle').innerHTML = `${formatDateShort(startOfWeek)} - ${formatDateShort(endOfWeek)}`;
    
    let html = '<div class="lich-week-view">';
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    for(let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dateStr = day.toISOString().split('T')[0];
        const events = lichData.filter(item => {
            if(!item.thoiGianBatDau) return false;
            return item.thoiGianBatDau.split('T')[0] === dateStr;
        });
        
        html += `
            <div class="lich-day-card">
                <div class="lich-day-header">${weekDays[i]}<br>${day.getDate()}/${day.getMonth()+1}</div>
                <div style="max-height: 300px; overflow-y: auto;">
        `;
        
        events.forEach(event => {
            const priorityClass = event.mucDoUuTien === 'cao' ? 'lich-event-cao' : (event.mucDoUuTien === 'trung' ? 'lich-event-trung' : 'lich-event-thap');
            const completeClass = event.trangThai === 'hoan' ? 'lich-event-hoan' : '';
            html += `
                <div class="lich-event ${priorityClass} ${completeClass}" onclick="viewLichDetail('${event.id}')">
                    <strong>${event.ten || 'Không tên'}</strong><br>
                    <small>🕐 ${event.thoiGianBatDau ? event.thoiGianBatDau.split('T')[1]?.substring(0,5) || '---' : '---'}</small>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    html += '</div>';
    document.getElementById('lichContent').innerHTML = html;
}

// Hiển thị tháng
function displayMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    document.getElementById('lichTitle').innerHTML = `Tháng ${month + 1}/${year}`;
    
    let html = '<div class="lich-month-view"><div class="lich-month-grid">';
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    weekDays.forEach(day => {
        html += `<div style="text-align: center; font-weight: bold; padding: 8px; color: #1e3a5f;">${day}</div>`;
    });
    
    // Ô trống đầu tháng
    for(let i = 0; i < startDayOfWeek; i++) {
        html += `<div class="lich-month-day lich-month-day-other"></div>`;
    }
    
    // Các ngày trong tháng
    for(let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const events = lichData.filter(item => {
            if(!item.thoiGianBatDau) return false;
            return item.thoiGianBatDau.split('T')[0] === dateStr;
        });
        
        html += `
            <div class="lich-month-day" onclick="showAddLichWithDate('${dateStr}')">
                <div class="lich-month-day-number">${d}</div>
        `;
        events.slice(0, 3).forEach(event => {
            const colorClass = event.mucDoUuTien === 'cao' ? 'priority-cao' : (event.mucDoUuTien === 'trung' ? 'priority-trung' : 'priority-thap');
            html += `<div style="font-size: 10px; margin-top: 2px;"><span class="lich-event-dot ${colorClass}"></span> ${event.ten?.substring(0, 15)}</div>`;
        });
        if(events.length > 3) html += `<div style="font-size: 9px; color: #94a3b8;">+${events.length-3} nữa</div>`;
        html += `</div>`;
    }
    
    html += '</div></div>';
    document.getElementById('lichContent').innerHTML = html;
}

// Thêm công việc với ngày được chọn
function showAddLichWithDate(date) {
    showAddLichModal();
    document.getElementById('lichThoiGianBatDau').value = `${date}T08:00`;
    document.getElementById('lichThoiGianKetThuc').value = `${date}T17:00`;
}

// Hiển thị modal thêm
function showAddLichModal() {
    currentEditId = null;
    document.getElementById('lichModalTitle').innerText = 'Thêm công việc mới';
    document.getElementById('lichTen').value = '';
    document.getElementById('lichMoTa').value = '';
    document.getElementById('lichThoiGianBatDau').value = '';
    document.getElementById('lichThoiGianKetThuc').value = '';
    document.getElementById('lichMucDoUuTien').value = 'trung';
    document.getElementById('lichTrangThai').value = 'chua';
    document.getElementById('lichNguoiPhuTrach').value = '';
    document.getElementById('lichDonVi').value = '';
    document.getElementById('lichDiaDiem').value = '';
    document.getElementById('lichGhiChu').value = '';
    document.getElementById('lichModal').style.display = 'flex';
}

// Sửa công việc
function editLich(id) {
    const item = lichData.find(i => i.id === id);
    if(!item) return;
    currentEditId = id;
    document.getElementById('lichModalTitle').innerText = 'Sửa công việc';
    document.getElementById('lichTen').value = item.ten || '';
    document.getElementById('lichMoTa').value = item.moTa || '';
    document.getElementById('lichThoiGianBatDau').value = item.thoiGianBatDau || '';
    document.getElementById('lichThoiGianKetThuc').value = item.thoiGianKetThuc || '';
    document.getElementById('lichMucDoUuTien').value = item.mucDoUuTien || 'trung';
    document.getElementById('lichTrangThai').value = item.trangThai || 'chua';
    document.getElementById('lichNguoiPhuTrach').value = item.nguoiPhuTrach || '';
    document.getElementById('lichDonVi').value = item.donVi || '';
    document.getElementById('lichDiaDiem').value = item.diaDiem || '';
    document.getElementById('lichGhiChu').value = item.ghiChu || '';
    document.getElementById('lichModal').style.display = 'flex';
}

// Lưu công việc
async function saveLich() {
    const ten = document.getElementById('lichTen').value.trim();
    if(!ten) {
        showToast('Vui lòng nhập tên công việc!', 'error');
        return;
    }
    
    const data = {
        ten: ten,
        moTa: document.getElementById('lichMoTa').value,
        thoiGianBatDau: document.getElementById('lichThoiGianBatDau').value,
        thoiGianKetThuc: document.getElementById('lichThoiGianKetThuc').value,
        mucDoUuTien: document.getElementById('lichMucDoUuTien').value,
        trangThai: document.getElementById('lichTrangThai').value,
        nguoiPhuTrach: document.getElementById('lichNguoiPhuTrach').value,
        donVi: document.getElementById('lichDonVi').value,
        diaDiem: document.getElementById('lichDiaDiem').value,
        ghiChu: document.getElementById('lichGhiChu').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if(currentEditId) {
            await db.collection('lichCongTac').doc(currentEditId).update(data);
            showToast('Đã cập nhật công việc!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('lichCongTac').add(data);
            showToast('Đã thêm công việc mới!', 'success');
        }
        closeLichModal();
        await loadLich();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xóa công việc
async function deleteLich(id) {
    if(confirm('Bạn có chắc muốn xóa công việc này?')) {
        try {
            await db.collection('lichCongTac').doc(id).delete();
            showToast('Đã xóa!', 'success');
            await loadLich();
        } catch(error) {
            showToast('Lỗi: ' + error.message, 'error');
        }
    }
}

// Xem chi tiết công việc
function viewLichDetail(id) {
    const item = lichData.find(i => i.id === id);
    if(!item) return;
    
    const priorityText = item.mucDoUuTien === 'cao' ? '🔴 Cao' : (item.mucDoUuTien === 'trung' ? '🟡 Trung bình' : '🟢 Thấp');
    const statusText = item.trangThai === 'chua' ? '⏳ Chưa thực hiện' : (item.trangThai === 'dang' ? '🔄 Đang thực hiện' : '✅ Đã hoàn thành');
    
    document.getElementById('lichDetailContent').innerHTML = `
        <div style="margin-bottom: 15px;">
            <div><strong>📌 ${item.ten}</strong></div>
            <hr style="margin: 10px 0;">
            <div><strong>Mô tả:</strong> ${item.moTa || '---'}</div>
            <div><strong>Thời gian bắt đầu:</strong> ${formatDateTime(item.thoiGianBatDau)}</div>
            <div><strong>Thời gian kết thúc:</strong> ${formatDateTime(item.thoiGianKetThuc)}</div>
            <div><strong>Ưu tiên:</strong> ${priorityText}</div>
            <div><strong>Trạng thái:</strong> ${statusText}</div>
            <div><strong>Người phụ trách:</strong> ${item.nguoiPhuTrach || '---'}</div>
            <div><strong>Đơn vị:</strong> ${item.donVi || '---'}</div>
            <div><strong>Địa điểm:</strong> ${item.diaDiem || '---'}</div>
            <div><strong>Ghi chú:</strong> ${item.ghiChu || '---'}</div>
            <div style="margin-top: 15px;">
                <button onclick="editLich('${item.id}'); closeLichDetailModal();" style="background: #f59e0b;">✏️ Sửa</button>
                <button onclick="deleteLich('${item.id}'); closeLichDetailModal();" style="background: #e74c3c;">🗑️ Xóa</button>
            </div>
        </div>
    `;
    document.getElementById('lichDetailModal').style.display = 'flex';
}

// Tìm kiếm
function searchLich(keyword) {
    if(!keyword.trim()) {
        updateLichDisplay();
        return;
    }
    const filtered = lichData.filter(item => 
        (item.ten || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (item.nguoiPhuTrach || '').toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Hiển thị kết quả tìm kiếm dạng danh sách
    let html = '<div style="padding: 15px;">';
    filtered.forEach(item => {
        const priorityClass = item.mucDoUuTien === 'cao' ? 'priority-cao' : (item.mucDoUuTien === 'trung' ? 'priority-trung' : 'priority-thap');
        html += `
            <div class="list-item" onclick="viewLichDetail('${item.id}')" style="cursor: pointer;">
                <div class="list-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="list-info">
                    <div class="list-title">${item.ten}</div>
                    <div class="list-desc">📅 ${item.thoiGianBatDau?.split('T')[0] || '---'} | 👤 ${item.nguoiPhuTrach || '---'}</div>
                </div>
                <span class="lich-event-dot ${priorityClass}" style="width: 12px; height: 12px;"></span>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('lichContent').innerHTML = html || '<p style="text-align:center; padding:40px;">Không tìm thấy kết quả</p>';
}

// Xuất Excel
async function exportLichToExcel() {
    const data = lichData.map((item, i) => ({
        'STT': i + 1,
        'Tên công việc': item.ten,
        'Mô tả': item.moTa,
        'Thời gian bắt đầu': formatDateTime(item.thoiGianBatDau),
        'Thời gian kết thúc': formatDateTime(item.thoiGianKetThuc),
        'Ưu tiên': item.mucDoUuTien === 'cao' ? 'Cao' : (item.mucDoUuTien === 'trung' ? 'Trung bình' : 'Thấp'),
        'Trạng thái': item.trangThai === 'chua' ? 'Chưa thực hiện' : (item.trangThai === 'dang' ? 'Đang thực hiện' : 'Đã hoàn thành'),
        'Người phụ trách': item.nguoiPhuTrach,
        'Đơn vị': item.donVi,
        'Địa điểm': item.diaDiem,
        'Ghi chú': item.ghiChu
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch công tác');
    XLSX.writeFile(wb, `LichCongTac_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

// Hàm tiện ích
function formatDateShort(date) {
    return `${date.getDate()}/${date.getMonth()+1}`;
}

function formatDateTime(dateStr) {
    if(!dateStr) return '---';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function closeLichModal() {
    document.getElementById('lichModal').style.display = 'none';
    currentEditId = null;
}

function closeLichDetailModal() {
    document.getElementById('lichDetailModal').style.display = 'none';
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}