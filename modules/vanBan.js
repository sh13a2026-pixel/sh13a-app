// ========== MODULE VĂN BẢN - QUẢN LÝ CÔNG VĂN, TÀI LIỆU ==========

let vanBanData = [];
let currentEditId = null;
let selectedFile = null;

function initVanBan() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📄 QUẢN LÝ VĂN BẢN - CÔNG VĂN</h3></div>
        
        <!-- Thống kê -->
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-value" id="vbTotal">0</div><div class="stat-label">Tổng văn bản</div></div>
            <div class="stat-card present"><div class="stat-value" id="vbDen">0</div><div class="stat-label">Văn bản đến</div></div>
            <div class="stat-card absent"><div class="stat-value" id="vbDi">0</div><div class="stat-label">Văn bản đi</div></div>
            <div class="stat-card leave"><div class="stat-value" id="vbNoiBo">0</div><div class="stat-label">Nội bộ</div></div>
        </div>

        <!-- Tab chuyển đổi loại văn bản -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="btnVbDen" onclick="switchVanBanTab('den')" class="active-tab" style="flex:1; background: #3498db;">📥 Văn bản đến</button>
            <button id="btnVbDi" onclick="switchVanBanTab('di')" style="flex:1; background: #95a5a6;">📤 Văn bản đi</button>
            <button id="btnVbNoiBo" onclick="switchVanBanTab('noibo')" style="flex:1; background: #95a5a6;">🏢 Nội bộ</button>
        </div>

        <!-- Thanh công cụ -->
        <div class="search-bar">
            <input type="text" id="searchVB" placeholder="🔍 Tìm kiếm theo số, trích yếu...">
            <button onclick="showAddVanBanModal()" class="success"><i class="fas fa-plus"></i> Thêm</button>
            <button onclick="exportVanBanToExcel()" class="success" style="background:#27ae60;"><i class="fas fa-file-excel"></i> Excel</button>
        </div>

        <!-- Danh sách văn bản -->
        <div id="vbList"></div>

        <!-- Modal Thêm/Sửa văn bản -->
        <div id="vbModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3 id="vbModalTitle">Thêm văn bản mới</h3>
                
                <select id="vbLoai">
                    <option value="den">📥 Văn bản đến</option>
                    <option value="di">📤 Văn bản đi</option>
                    <option value="noibo">🏢 Văn bản nội bộ</option>
                </select>
                
                <input type="text" id="vbSoKyHieu" placeholder="Số/Ký hiệu văn bản *">
                <input type="text" id="vbTrichYeu" placeholder="Trích yếu nội dung *">
                <input type="text" id="vbNoiBanHanh" placeholder="Nơi ban hành">
                <input type="date" id="vbNgayBanHanh">
                <input type="date" id="vbNgayNhan" placeholder="Ngày nhận (nếu có)">
                <input type="text" id="vbNguoiKy" placeholder="Người ký">
                <select id="vbDoMat">
                    <option value="thuong">Thường</option>
                    <option value="mat">Mật</option>
                    <option value="tuyetmat">Tuyệt mật</option>
                </select>
                <textarea id="vbGhiChu" rows="2" placeholder="Ghi chú"></textarea>
                
                <!-- Upload file -->
                <div style="margin: 10px 0;">
                    <label style="display: block; margin-bottom: 5px;"><i class="fas fa-paperclip"></i> File đính kèm:</label>
                    <input type="file" id="vbFile" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png">
                    <div id="vbFileName" style="font-size: 11px; color: #6c757d; margin-top: 5px;"></div>
                </div>
                
                <div class="modal-buttons">
                    <button onclick="saveVanBan()" class="success">Lưu</button>
                    <button onclick="closeVbModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>

        <!-- Modal Xem chi tiết văn bản -->
        <div id="vbDetailModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>📄 CHI TIẾT VĂN BẢN</h3>
                <div id="vbDetailContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeVbDetailModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    // CSS cho nút tab
    const style = document.createElement('style');
    style.textContent = `
        .active-tab { opacity: 1; filter: brightness(1); background: #2c3e50 !important; color: white; }
        .file-attachment { background: #eef2f6; padding: 8px 12px; border-radius: 8px; margin-top: 5px; cursor: pointer; }
        .file-attachment:hover { background: #d5d8dc; }
        .badge-mat { background: #f39c12; color: white; }
        .badge-tuyetmat { background: #e74c3c; color: white; }
    `;
    document.head.appendChild(style);
    
    loadVanBan();
    
    // Tìm kiếm
    document.getElementById('searchVB').addEventListener('input', function(e) {
        searchVanBan(e.target.value);
    });
    
    // Xử lý chọn file
    document.getElementById('vbFile').addEventListener('change', function(e) {
        if(e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            document.getElementById('vbFileName').innerHTML = `<i class="fas fa-check-circle"></i> Đã chọn: ${selectedFile.name}`;
        } else {
            selectedFile = null;
            document.getElementById('vbFileName').innerHTML = '';
        }
    });
}

// Biến lưu loại văn bản đang xem
let currentVbType = 'den';

// Chuyển tab loại văn bản
function switchVanBanTab(type) {
    currentVbType = type;
    
    // Cập nhật style button
    const btnDen = document.getElementById('btnVbDen');
    const btnDi = document.getElementById('btnVbDi');
    const btnNoiBo = document.getElementById('btnVbNoiBo');
    
    const buttons = [btnDen, btnDi, btnNoiBo];
    buttons.forEach(btn => { if(btn) btn.style.background = '#95a5a6'; });
    
    if(type === 'den') btnDen.style.background = '#3498db';
    else if(type === 'di') btnDi.style.background = '#e67e22';
    else btnNoiBo.style.background = '#9b59b6';
    
    // Hiển thị dữ liệu theo loại
    displayVanBanByType();
}

// Load dữ liệu từ Firestore
async function loadVanBan() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const snapshot = await db.collection('vanBan').orderBy('ngayBanHanh', 'desc').get();
        vanBanData = [];
        snapshot.forEach(doc => {
            vanBanData.push({ id: doc.id, ...doc.data() });
        });
        displayVanBanByType();
        updateVanBanStats();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Hiển thị theo loại
function displayVanBanByType() {
    const filtered = vanBanData.filter(item => item.loai === currentVbType);
    displayVanBanList(filtered);
}

// Hiển thị danh sách văn bản
function displayVanBanList(items) {
    const container = document.getElementById('vbList');
    if(!container) return;
    
    if(items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu. Nhấn "Thêm" để thêm văn bản.</div>';
        return;
    }
    
    let html = '';
    items.forEach(item => {
        const icon = item.loai === 'den' ? '📥' : (item.loai === 'di' ? '📤' : '🏢');
        const bgColor = item.loai === 'den' ? '#3498db' : (item.loai === 'di' ? '#e67e22' : '#9b59b6');
        const doMatText = getDoMatText(item.doMat);
        const doMatClass = item.doMat === 'tuyetmat' ? 'badge-tuyetmat' : (item.doMat === 'mat' ? 'badge-mat' : '');
        
        html += `
            <div class="list-item" onclick="viewVanBanDetail('${item.id}')" style="cursor: pointer;">
                <div class="list-icon" style="background: ${bgColor}; color: white;">${icon}</div>
                <div class="list-info">
                    <div class="list-title">${item.soKyHieu || 'Chưa có số'} - ${item.trichYeu || ''}</div>
                    <div class="list-desc">🏢 ${item.noiBanHanh || 'Chưa rõ'} | 📅 ${item.ngayBanHanh || 'Chưa có ngày'}</div>
                    <div class="list-desc">✍️ ${item.nguoiKy || 'Chưa có'} | <span class="${doMatClass}" style="padding: 2px 6px; border-radius: 12px; font-size: 10px;">${doMatText}</span></div>
                </div>
                <div>
                    ${item.hasFile ? '<i class="fas fa-paperclip" style="color: #27ae60;"></i>' : ''}
                    <div style="margin-top: 5px;">
                        <button onclick="event.stopPropagation(); editVanBan('${item.id}')" style="width: auto; padding: 5px 10px; background: #f59e0b; font-size: 11px;"><i class="fas fa-edit"></i></button>
                        <button onclick="event.stopPropagation(); deleteVanBan('${item.id}')" style="width: auto; padding: 5px 10px; background: #e74c3c; font-size: 11px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Lấy text độ mật
function getDoMatText(doMat) {
    const levels = {
        'thuong': 'Thường',
        'mat': '🔒 Mật',
        'tuyetmat': '🔒🔒 Tuyệt mật'
    };
    return levels[doMat] || 'Thường';
}

// Cập nhật thống kê
function updateVanBanStats() {
    const total = vanBanData.length;
    const den = vanBanData.filter(item => item.loai === 'den').length;
    const di = vanBanData.filter(item => item.loai === 'di').length;
    const noiBo = vanBanData.filter(item => item.loai === 'noibo').length;
    
    document.getElementById('vbTotal').innerText = total;
    document.getElementById('vbDen').innerText = den;
    document.getElementById('vbDi').innerText = di;
    document.getElementById('vbNoiBo').innerText = noiBo;
}

// Tìm kiếm
function searchVanBan(keyword) {
    if(!keyword.trim()) {
        displayVanBanByType();
        return;
    }
    const filtered = vanBanData.filter(item => 
        item.loai === currentVbType && (
            (item.soKyHieu || '').toLowerCase().includes(keyword.toLowerCase()) ||
            (item.trichYeu || '').toLowerCase().includes(keyword.toLowerCase()) ||
            (item.noiBanHanh || '').toLowerCase().includes(keyword.toLowerCase())
        )
    );
    displayVanBanList(filtered);
}

// Hiển thị modal thêm
function showAddVanBanModal() {
    currentEditId = null;
    selectedFile = null;
    document.getElementById('vbModalTitle').innerText = 'Thêm văn bản mới';
    document.getElementById('vbLoai').value = currentVbType;
    document.getElementById('vbSoKyHieu').value = '';
    document.getElementById('vbTrichYeu').value = '';
    document.getElementById('vbNoiBanHanh').value = '';
    document.getElementById('vbNgayBanHanh').value = new Date().toISOString().split('T')[0];
    document.getElementById('vbNgayNhan').value = '';
    document.getElementById('vbNguoiKy').value = '';
    document.getElementById('vbDoMat').value = 'thuong';
    document.getElementById('vbGhiChu').value = '';
    document.getElementById('vbFile').value = '';
    document.getElementById('vbFileName').innerHTML = '';
    document.getElementById('vbModal').style.display = 'flex';
}

// Sửa văn bản
function editVanBan(id) {
    const item = vanBanData.find(i => i.id === id);
    if(!item) return;
    currentEditId = id;
    document.getElementById('vbModalTitle').innerText = 'Sửa văn bản';
    document.getElementById('vbLoai').value = item.loai;
    document.getElementById('vbSoKyHieu').value = item.soKyHieu || '';
    document.getElementById('vbTrichYeu').value = item.trichYeu || '';
    document.getElementById('vbNoiBanHanh').value = item.noiBanHanh || '';
    document.getElementById('vbNgayBanHanh').value = item.ngayBanHanh || '';
    document.getElementById('vbNgayNhan').value = item.ngayNhan || '';
    document.getElementById('vbNguoiKy').value = item.nguoiKy || '';
    document.getElementById('vbDoMat').value = item.doMat || 'thuong';
    document.getElementById('vbGhiChu').value = item.ghiChu || '';
    document.getElementById('vbFile').value = '';
    document.getElementById('vbFileName').innerHTML = item.hasFile ? `<i class="fas fa-paperclip"></i> Đã có file đính kèm` : '';
    document.getElementById('vbModal').style.display = 'flex';
}

// Upload file lên Firebase Storage
async function uploadFile(file, docId) {
    if(!file) return null;
    const storageRef = storage.ref(`vanBan/${docId}_${file.name}`);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
}

// Lưu văn bản
async function saveVanBan() {
    const soKyHieu = document.getElementById('vbSoKyHieu').value.trim();
    const trichYeu = document.getElementById('vbTrichYeu').value.trim();
    
    if(!soKyHieu || !trichYeu) {
        showToast('Vui lòng nhập số/ký hiệu và trích yếu!', 'error');
        return;
    }
    
    const data = {
        loai: document.getElementById('vbLoai').value,
        soKyHieu: soKyHieu,
        trichYeu: trichYeu,
        noiBanHanh: document.getElementById('vbNoiBanHanh').value,
        ngayBanHanh: document.getElementById('vbNgayBanHanh').value,
        ngayNhan: document.getElementById('vbNgayNhan').value,
        nguoiKy: document.getElementById('vbNguoiKy').value,
        doMat: document.getElementById('vbDoMat').value,
        ghiChu: document.getElementById('vbGhiChu').value,
        hasFile: !!selectedFile,
        updatedAt: new Date().toISOString()
    };
    
    try {
        let docId = currentEditId;
        
        if(currentEditId) {
            await db.collection('vanBan').doc(currentEditId).update(data);
            docId = currentEditId;
            showToast('Đã cập nhật văn bản!', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            const docRef = await db.collection('vanBan').add(data);
            docId = docRef.id;
            showToast('Đã thêm văn bản mới!', 'success');
        }
        
        // Upload file nếu có
        if(selectedFile) {
            const fileUrl = await uploadFile(selectedFile, docId);
            await db.collection('vanBan').doc(docId).update({ fileUrl: fileUrl });
        }
        
        closeVbModal();
        await loadVanBan();
    } catch(error) {
        showToast('Lỗi: ' + error.message, 'error');
    }
}

// Xóa văn bản
async function deleteVanBan(id) {
    if(confirm('Bạn có chắc muốn xóa văn bản này?')) {
        try {
            await db.collection('vanBan').doc(id).delete();
            showToast('Đã xóa!', 'success');
            await loadVanBan();
        } catch(error) {
            showToast('Lỗi: ' + error.message, 'error');
        }
    }
}

// Xem chi tiết văn bản
async function viewVanBanDetail(id) {
    const item = vanBanData.find(i => i.id === id);
    if(!item) return;
    
    const icon = item.loai === 'den' ? '📥' : (item.loai === 'di' ? '📤' : '🏢');
    const loaiText = item.loai === 'den' ? 'Văn bản đến' : (item.loai === 'di' ? 'Văn bản đi' : 'Văn bản nội bộ');
    
    let fileHtml = '';
    if(item.fileUrl) {
        fileHtml = `<div class="file-attachment" onclick="window.open('${item.fileUrl}', '_blank')">
                        <i class="fas fa-download"></i> Tải xuống file đính kèm
                    </div>`;
    }
    
    document.getElementById('vbDetailContent').innerHTML = `
        <div style="margin-bottom: 15px;">
            <div><strong>${icon} ${loaiText}</strong></div>
            <hr style="margin: 10px 0;">
            <div><strong>Số/Ký hiệu:</strong> ${item.soKyHieu || '---'}</div>
            <div><strong>Trích yếu:</strong> ${item.trichYeu || '---'}</div>
            <div><strong>Nơi ban hành:</strong> ${item.noiBanHanh || '---'}</div>
            <div><strong>Ngày ban hành:</strong> ${item.ngayBanHanh || '---'}</div>
            <div><strong>Ngày nhận:</strong> ${item.ngayNhan || '---'}</div>
            <div><strong>Người ký:</strong> ${item.nguoiKy || '---'}</div>
            <div><strong>Độ mật:</strong> ${getDoMatText(item.doMat)}</div>
            <div><strong>Ghi chú:</strong> ${item.ghiChu || '---'}</div>
            ${fileHtml}
        </div>
    `;
    document.getElementById('vbDetailModal').style.display = 'flex';
}

function closeVbDetailModal() {
    document.getElementById('vbDetailModal').style.display = 'none';
}

// Đóng modal
function closeVbModal() {
    document.getElementById('vbModal').style.display = 'none';
    currentEditId = null;
    selectedFile = null;
}

// Xuất Excel
async function exportVanBanToExcel() {
    const data = vanBanData.filter(item => item.loai === currentVbType).map((item, i) => ({
        'STT': i + 1,
        'Số/Ký hiệu': item.soKyHieu,
        'Trích yếu': item.trichYeu,
        'Nơi ban hành': item.noiBanHanh,
        'Ngày ban hành': item.ngayBanHanh,
        'Người ký': item.nguoiKy,
        'Độ mật': getDoMatText(item.doMat),
        'Loại': item.loai === 'den' ? 'Văn bản đến' : (item.loai === 'di' ? 'Văn bản đi' : 'Nội bộ'),
        'Ghi chú': item.ghiChu
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentVbType === 'den' ? 'VanBanDen' : (currentVbType === 'di' ? 'VanBanDi' : 'VanBanNoiBo'));
    XLSX.writeFile(wb, `VanBan_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Khởi tạo biến storage
const storage = firebase.storage();