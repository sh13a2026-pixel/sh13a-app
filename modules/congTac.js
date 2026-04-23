function initCongTac() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📋 QUẢN LÝ CÔNG TÁC</h3></div>
        <div class="search-bar"><input type="text" id="cvName" placeholder="Tên công việc"><input type="date" id="cvDate"><button onclick="addCongViec()" class="success">+ Thêm</button></div>
        <div id="cvList"></div>
    `;
    loadCongViec();
}

let cvList = [];
async function loadCongViec() {
    const snap = await db.collection('congTac').get();
    cvList = [];
    snap.forEach(d => cvList.push(d.data()));
    displayCongViec();
}
function displayCongViec() {
    const html = cvList.map(c => `<div class="list-item"><div class="list-icon">📅</div><div class="list-info"><div class="list-title">${c.ten} - ${c.ngay}</div></div></div>`).join('');
    document.getElementById('cvList').innerHTML = html || '<p>Chưa có công việc</p>';
}
async function addCongViec() {
    const ten = document.getElementById('cvName').value;
    const ngay = document.getElementById('cvDate').value;
    if(ten) await db.collection('congTac').add({ ten: ten, ngay: ngay });
    loadCongViec();
}