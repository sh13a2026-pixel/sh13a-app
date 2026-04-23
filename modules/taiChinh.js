function initTaiChinh() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>💰 QUẢN LÝ TÀI CHÍNH</h3></div>
        <div class="stats-grid"><div class="stat-card total"><div class="stat-value" id="tongQuy">0</div><div class="stat-label">Tổng quỹ</div></div></div>
        <div class="search-bar"><input type="number" id="soTien" placeholder="Số tiền"><input type="text" id="lyDo" placeholder="Lý do"><select id="loaiGD"><option value="thu">Thu</option><option value="chi">Chi</option></select><button onclick="addGiaoDich()" class="success">+ Thêm</button></div>
        <div id="gdList"></div>
    `;
    loadGiaoDich();
}

let gdList = [];
async function loadGiaoDich() {
    const snap = await db.collection('taiChinh').get();
    gdList = [];
    let tong = 0;
    snap.forEach(d => { const item = d.data(); gdList.push(item); if(item.loai === 'thu') tong += item.soTien; else tong -= item.soTien; });
    document.getElementById('tongQuy').innerText = tong.toLocaleString();
    displayGiaoDich();
}
function displayGiaoDich() {
    const html = gdList.map(g => `<div class="list-item"><div class="list-icon">${g.loai === 'thu' ? '📥' : '📤'}</div><div class="list-info"><div class="list-title">${g.lyDo} - ${g.soTien.toLocaleString()}đ</div></div></div>`).join('');
    document.getElementById('gdList').innerHTML = html || '<p>Chưa có giao dịch</p>';
}
async function addGiaoDich() {
    const soTien = parseInt(document.getElementById('soTien').value);
    const lyDo = document.getElementById('lyDo').value;
    const loai = document.getElementById('loaiGD').value;
    if(soTien && lyDo) await db.collection('taiChinh').add({ soTien, lyDo, loai });
    loadGiaoDich();
}