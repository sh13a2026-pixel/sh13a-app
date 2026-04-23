// ========== MODULE BÁO CÁO - THỐNG KÊ, BIỂU ĐỒ ==========

let baoCaoData = {
    quanSo: [],
    diemDanh: [],
    taiChinh: [],
    hocTap: []
};

let currentReportType = 'quanSo';
let currentPeriod = 'month';

function initBaoCao() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📊 BÁO CÁO - THỐNG KÊ</h3></div>
        
        <!-- Tab chuyển đổi loại báo cáo -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px; flex-wrap: wrap;">
            <button id="btnQS" onclick="switchReportType('quanSo')" class="active-report" style="flex:1; background: #2c3e50;">👥 Quân số</button>
            <button id="btnDD" onclick="switchReportType('diemDanh')" style="flex:1; background: #95a5a6;">✅ Điểm danh</button>
            <button id="btnTC" onclick="switchReportType('taiChinh')" style="flex:1; background: #95a5a6;">💰 Tài chính</button>
            <button id="btnHT" onclick="switchReportType('hocTap')" style="flex:1; background: #95a5a6;">📚 Học tập</button>
        </div>

        <!-- Chọn kỳ báo cáo -->
        <div style="display: flex; gap: 10px; padding: 0 15px 15px;">
            <button id="periodWeek" onclick="switchPeriod('week')" class="active-period" style="flex:1; background: #2c3e50;">Tuần</button>
            <button id="periodMonth" onclick="switchPeriod('month')" style="flex:1; background: #95a5a6;">Tháng</button>
            <button id="periodYear" onclick="switchPeriod('year')" style="flex:1; background: #95a5a6;">Năm</button>
            <button id="periodCustom" onclick="openDateRange()" style="flex:1; background: #27ae60;">Tùy chọn</button>
        </div>

        <!-- Chọn thời gian -->
        <div style="padding: 0 15px 15px;">
            <select id="monthSelect" style="margin-bottom: 10px;">
                <option value="1">Tháng 1</option><option value="2">Tháng 2</option><option value="3">Tháng 3</option>
                <option value="4">Tháng 4</option><option value="5">Tháng 5</option><option value="6">Tháng 6</option>
                <option value="7">Tháng 7</option><option value="8">Tháng 8</option><option value="9">Tháng 9</option>
                <option value="10">Tháng 10</option><option value="11">Tháng 11</option><option value="12">Tháng 12</option>
            </select>
            <select id="yearSelect"></select>
        </div>

        <!-- Nội dung báo cáo -->
        <div id="reportContent"></div>

        <!-- Nút xuất báo cáo -->
        <div style="display: flex; gap: 10px; padding: 15px;">
            <button onclick="exportReportToPDF()" style="flex:1; background: #e74c3c;"><i class="fas fa-file-pdf"></i> Xuất PDF</button>
            <button onclick="exportReportToExcel()" style="flex:1; background: #27ae60;"><i class="fas fa-file-excel"></i> Xuất Excel</button>
            <button onclick="printReport()" style="flex:1; background: #3498db;"><i class="fas fa-print"></i> In báo cáo</button>
        </div>
    `;
    
    // Tạo danh sách năm
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    for(let y = currentYear - 2; y <= currentYear + 1; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        if(y === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // CSS cho biểu đồ
    const style = document.createElement('style');
    style.textContent = `
        .active-report, .active-period { background: #2c3e50 !important; color: white; }
        .stat-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 15px; }
        .stat-summary-item { background: #f8fafc; border-radius: 16px; padding: 15px; text-align: center; }
        .stat-summary-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
        .stat-summary-label { font-size: 11px; color: #6c757d; margin-top: 5px; }
        .chart-container { background: white; border-radius: 16px; padding: 15px; margin: 15px; border: 1px solid #eef2f6; }
        .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .report-table th, .report-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eef2f6; }
        .report-table th { background: #f8fafc; font-weight: 600; color: #1e3a5f; }
        .progress-bar { background: #eef2f6; border-radius: 10px; height: 8px; overflow: hidden; }
        .progress-fill { background: #27ae60; height: 100%; border-radius: 10px; width: 0%; }
    `;
    document.head.appendChild(style);
    
    loadAllData();
}

// Chuyển loại báo cáo
function switchReportType(type) {
    currentReportType = type;
    
    const btns = ['btnQS', 'btnDD', 'btnTC', 'btnHT'];
    btns.forEach(btn => {
        const el = document.getElementById(btn);
        if(el) el.style.background = '#95a5a6';
    });
    document.getElementById(`btn${type === 'quanSo' ? 'QS' : (type === 'diemDanh' ? 'DD' : (type === 'taiChinh' ? 'TC' : 'HT'))}`).style.background = '#2c3e50';
    
    updateReport();
}

// Chọn kỳ báo cáo
function switchPeriod(period) {
    currentPeriod = period;
    
    const btns = ['periodWeek', 'periodMonth', 'periodYear'];
    btns.forEach(btn => {
        const el = document.getElementById(btn);
        if(el) el.style.background = '#95a5a6';
    });
    document.getElementById(`period${period.charAt(0).toUpperCase() + period.slice(1)}`).style.background = '#2c3e50';
    
    updateReport();
}

// Mở chọn ngày tùy chỉnh
function openDateRange() {
    const startDate = prompt('Nhập ngày bắt đầu (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    const endDate = prompt('Nhập ngày kết thúc (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if(startDate && endDate) {
        currentPeriod = 'custom';
        updateReportWithDateRange(startDate, endDate);
    }
}

// Load tất cả dữ liệu
async function loadAllData() {
    showToast('Đang tải dữ liệu...', 'success');
    try {
        const [quanSoSnap, diemDanhSnap, taiChinhSnap, hocTapSnap] = await Promise.all([
            db.collection('members').get(),
            db.collection('attendance').get(),
            db.collection('funds').get(),
            db.collection('baiHoc').get()
        ]);
        
        baoCaoData.quanSo = [];
        quanSoSnap.forEach(doc => baoCaoData.quanSo.push({ id: doc.id, ...doc.data() }));
        
        baoCaoData.diemDanh = [];
        diemDanhSnap.forEach(doc => baoCaoData.diemDanh.push({ id: doc.id, ...doc.data(), date: doc.id }));
        
        baoCaoData.taiChinh = [];
        taiChinhSnap.forEach(doc => baoCaoData.taiChinh.push({ id: doc.id, ...doc.data() }));
        
        baoCaoData.hocTap = [];
        hocTapSnap.forEach(doc => baoCaoData.hocTap.push({ id: doc.id, ...doc.data() }));
        
        updateReport();
    } catch(error) {
        showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

// Cập nhật báo cáo
function updateReport() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const year = parseInt(document.getElementById('yearSelect').value);
    
    let startDate, endDate;
    if(currentPeriod === 'week') {
        const now = new Date();
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    } else if(currentPeriod === 'month') {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
    } else if(currentPeriod === 'year') {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
    }
    
    displayReport(startDate, endDate);
}

function updateReportWithDateRange(startDate, endDate) {
    displayReport(new Date(startDate), new Date(endDate));
}

// Hiển thị báo cáo
function displayReport(startDate, endDate) {
    const container = document.getElementById('reportContent');
    if(!container) return;
    
    let html = '';
    
    if(currentReportType === 'quanSo') {
        html = generateQuanSoReport(startDate, endDate);
    } else if(currentReportType === 'diemDanh') {
        html = generateDiemDanhReport(startDate, endDate);
    } else if(currentReportType === 'taiChinh') {
        html = generateTaiChinhReport(startDate, endDate);
    } else if(currentReportType === 'hocTap') {
        html = generateHocTapReport(startDate, endDate);
    }
    
    container.innerHTML = html;
}

// Báo cáo Quân số
function generateQuanSoReport(startDate, endDate) {
    const total = baoCaoData.quanSo.length;
    const nam = baoCaoData.quanSo.filter(m => m.gender === 'Nam').length;
    const nu = total - nam;
    const siQuan = baoCaoData.quanSo.filter(m => m.position === 'Sĩ quan' || m.rank?.includes('úy')).length;
    const haSiQuan = baoCaoData.quanSo.filter(m => m.rank?.includes('sĩ') || m.rank?.includes('Thượng')).length;
    const chienSi = total - siQuan - haSiQuan;
    
    // Thống kê theo cấp bậc
    const rankStats = {};
    baoCaoData.quanSo.forEach(m => {
        const rank = m.rank || 'Chiến sĩ';
        rankStats[rank] = (rankStats[rank] || 0) + 1;
    });
    
    let rankHtml = '';
    for(const [rank, count] of Object.entries(rankStats)) {
        const percent = (count / total * 100).toFixed(1);
        rankHtml += `
            <tr>
                <td>${rank}</td>
                <td>${count}</td>
                <td>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%;"></div></div>
                </td>
                <td>${percent}%</td>
            </tr>
        `;
    }
    
    return `
        <div class="stat-summary">
            <div class="stat-summary-item"><div class="stat-summary-value">${total}</div><div class="stat-summary-label">Tổng quân số</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${nam}</div><div class="stat-summary-label">Nam</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${nu}</div><div class="stat-summary-label">Nữ</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${siQuan}</div><div class="stat-summary-label">Sĩ quan</div></div>
        </div>
        <div class="chart-container">
            <h4 style="margin-bottom: 15px;">📊 Phân bố theo cấp bậc</h4>
            <table class="report-table">
                <thead><tr><th>Cấp bậc</th><th>Số lượng</th><th>Tỷ lệ</th><th></th></tr></thead>
                <tbody>${rankHtml}</tbody>
            </table>
        </div>
    `;
}

// Báo cáo Điểm danh
function generateDiemDanhReport(startDate, endDate) {
    let filteredAttendance = [];
    baoCaoData.diemDanh.forEach(item => {
        const itemDate = new Date(item.date);
        if(itemDate >= startDate && itemDate <= endDate) {
            filteredAttendance.push(item);
        }
    });
    
    let totalDays = 0;
    let totalPresent = 0;
    let dailyStats = [];
    
    filteredAttendance.forEach(day => {
        totalDays++;
        const presentCount = Object.values(day).filter(v => v === true).length;
        totalPresent += presentCount;
        dailyStats.push({ date: day.date, present: presentCount, total: baoCaoData.quanSo.length });
    });
    
    const avgAttendance = totalDays > 0 ? (totalPresent / totalDays).toFixed(1) : 0;
    const avgRate = totalDays > 0 ? ((totalPresent / (totalDays * baoCaoData.quanSo.length)) * 100).toFixed(1) : 0;
    
    let dailyHtml = '';
    dailyStats.forEach(day => {
        const rate = ((day.present / day.total) * 100).toFixed(1);
        dailyHtml += `
            <tr>
                <td>${day.date}</td>
                <td>${day.present}</td>
                <td>${day.total}</td>
                <td>${rate}%</td>
                <td><div class="progress-bar"><div class="progress-fill" style="width: ${rate}%; background: ${rate >= 90 ? '#27ae60' : (rate >= 70 ? '#f39c12' : '#e74c3c')};"></div></div></td>
            </tr>
        `;
    });
    
    return `
        <div class="stat-summary">
            <div class="stat-summary-item"><div class="stat-summary-value">${totalDays}</div><div class="stat-summary-label">Số ngày</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${avgAttendance}</div><div class="stat-summary-label">Trung bình/ngày</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${avgRate}%</div><div class="stat-summary-label">Tỷ lệ chung</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${totalPresent}</div><div class="stat-summary-label">Tổng lượt</div></div>
        </div>
        <div class="chart-container">
            <h4 style="margin-bottom: 15px;">📅 Chi tiết theo ngày</h4>
            <table class="report-table">
                <thead><tr><th>Ngày</th><th>Có mặt</th><th>Tổng số</th><th>Tỷ lệ</th><th></th></tr></thead>
                <tbody>${dailyHtml || '<tr><td colspan="5">Không có dữ liệu</td></tr>'}</tbody>
            </table>
        </div>
    `;
}

// Báo cáo Tài chính
function generateTaiChinhReport(startDate, endDate) {
    let filteredTrans = [];
    baoCaoData.taiChinh.forEach(item => {
        const itemDate = new Date(item.date);
        if(itemDate >= startDate && itemDate <= endDate) {
            filteredTrans.push(item);
        }
    });
    
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeByReason = {};
    let expenseByReason = {};
    
    filteredTrans.forEach(t => {
        if(t.type === 'income') {
            totalIncome += t.amount;
            incomeByReason[t.reason] = (incomeByReason[t.reason] || 0) + t.amount;
        } else {
            totalExpense += t.amount;
            expenseByReason[t.reason] = (expenseByReason[t.reason] || 0) + t.amount;
        }
    });
    
    let incomeHtml = '';
    for(const [reason, amount] of Object.entries(incomeByReason)) {
        incomeHtml += `<tr><td>${reason}</td><td class="amount-income">${amount.toLocaleString()}đ</td><td>${((amount / totalIncome) * 100).toFixed(1)}%</td></tr>`;
    }
    
    let expenseHtml = '';
    for(const [reason, amount] of Object.entries(expenseByReason)) {
        expenseHtml += `<tr><td>${reason}</td><td class="amount-expense">${amount.toLocaleString()}đ</td><td>${((amount / totalExpense) * 100).toFixed(1)}%</td></tr>`;
    }
    
    return `
        <div class="stat-summary">
            <div class="stat-summary-item"><div class="stat-summary-value" style="color: #27ae60;">+${totalIncome.toLocaleString()}đ</div><div class="stat-summary-label">Tổng thu</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value" style="color: #e74c3c;">-${totalExpense.toLocaleString()}đ</div><div class="stat-summary-label">Tổng chi</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${(totalIncome - totalExpense).toLocaleString()}đ</div><div class="stat-summary-label">Chênh lệch</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${filteredTrans.length}</div><div class="stat-summary-label">Số giao dịch</div></div>
        </div>
        <div class="chart-container">
            <h4 style="margin-bottom: 15px;">📥 Chi tiết thu</h4>
            <table class="report-table"><thead><tr><th>Khoản thu</th><th>Số tiền</th><th>Tỷ lệ</th></tr></thead><tbody>${incomeHtml || '<tr><td colspan="3">Không có dữ liệu</td></tr>'}</tbody></table>
        </div>
        <div class="chart-container">
            <h4 style="margin-bottom: 15px;">📤 Chi tiết chi</h4>
            <table class="report-table"><thead><tr><th>Khoản chi</th><th>Số tiền</th><th>Tỷ lệ</th></tr></thead><tbody>${expenseHtml || '<tr><td colspan="3">Không có dữ liệu</td></tr>'}</tbody></table>
        </div>
    `;
}

// Báo cáo Học tập
function generateHocTapReport(startDate, endDate) {
    const totalBai = baoCaoData.hocTap.length;
    const daHoc = baoCaoData.hocTap.filter(b => b.daHoc).length;
    const chuaHoc = totalBai - daHoc;
    const hoanThanhRate = totalBai > 0 ? ((daHoc / totalBai) * 100).toFixed(1) : 0;
    
    let baiHtml = '';
    baoCaoData.hocTap.forEach(b => {
        baiHtml += `<tr><td>${b.tenBai || 'Không tên'}</td><td>${b.daHoc ? '✅ Đã học' : '⏳ Chưa học'}</td><td>${b.ngayHoc ? new Date(b.ngayHoc).toLocaleDateString() : '---'}</td></tr>`;
    });
    
    return `
        <div class="stat-summary">
            <div class="stat-summary-item"><div class="stat-summary-value">${totalBai}</div><div class="stat-summary-label">Tổng bài học</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${daHoc}</div><div class="stat-summary-label">Đã học</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${chuaHoc}</div><div class="stat-summary-label">Chưa học</div></div>
            <div class="stat-summary-item"><div class="stat-summary-value">${hoanThanhRate}%</div><div class="stat-summary-label">Hoàn thành</div></div>
        </div>
        <div class="chart-container">
            <h4 style="margin-bottom: 15px;">📖 Danh sách bài học</h4>
            <table class="report-table"><thead><tr><th>Tên bài học</th><th>Trạng thái</th><th>Ngày học</th></tr></thead><tbody>${baiHtml || '<tr><td colspan="3">Chưa có bài học</td></tr>'}</tbody></table>
        </div>
    `;
}

// Xuất Excel
async function exportReportToExcel() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const year = parseInt(document.getElementById('yearSelect').value);
    const fileName = `BaoCao_${currentReportType}_${month}_${year}`;
    
    let data = [];
    if(currentReportType === 'quanSo') {
        data = baoCaoData.quanSo.map((m, i) => ({
            'STT': i+1, 'Họ tên': m.name, 'Cấp bậc': m.rank, 'Chức vụ': m.position, 'Giới tính': m.gender
        }));
    } else if(currentReportType === 'diemDanh') {
        data = baoCaoData.diemDanh.map(d => ({ 'Ngày': d.date, 'Dữ liệu': JSON.stringify(d) }));
    } else if(currentReportType === 'taiChinh') {
        data = baoCaoData.taiChinh.map(t => ({ 'Loại': t.type, 'Số tiền': t.amount, 'Lý do': t.reason, 'Ngày': new Date(t.date).toLocaleDateString() }));
    } else {
        data = baoCaoData.hocTap.map(b => ({ 'Bài học': b.tenBai, 'Trạng thái': b.daHoc ? 'Đã học' : 'Chưa học' }));
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    showToast('Đã xuất file Excel!', 'success');
}

// Xuất PDF (in ấn)
function exportReportToPDF() {
    printReport();
}

function printReport() {
    const printContent = document.getElementById('reportContent').innerHTML;
    const title = `BÁO CÁO ${currentReportType.toUpperCase()} - ${new Date().toLocaleDateString('vi-VN')}`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>SH13A - Báo cáo</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #1e3a5f; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f0f2f5; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
        </head><body>
        <h2>${title}</h2>
        ${printContent}
        <div class="footer">SH13A - Hệ thống quản lý đơn vị | Ngày in: ${new Date().toLocaleString('vi-VN')}</div>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}