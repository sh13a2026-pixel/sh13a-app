function initTrucGac() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>🛡️ QUẢN LÝ TRỰC GÁC</h3></div>
        <div class="search-bar"><input type="text" id="tgName" placeholder="Tên người gác"><input type="date" id="tgDate"><button onclick="addTrucGac()" class="success">+ Thêm</button></div>
        <div id="tgList"></div>
    `;
    loadTrucGac();
}

let tgList = [];
async function loadTrucGac() {
    const snap = await db.collection('trucGac').get();
    tgList = [];
    snap.forEach(d => tgList.push(d.data()));
    displayTrucGac();
}
function displayTrucGac() {
    const html = tgList.map(t => `<div class="list-item"><div class="list-icon">🛡️</div><div class="list-info"><div class="list-title">${t.ten} - ${t.ngay}</div></div></div>`).join('');
    document.getElementById('tgList').innerHTML = html || '<p>Chưa có lịch gác</p>';
}
async function addTrucGac() {
    const ten = document.getElementById('tgName').value;
    const ngay = document.getElementById('tgDate').value;
    if(ten) await db.collection('trucGac').add({ ten: ten, ngay: ngay });
    loadTrucGac();
}