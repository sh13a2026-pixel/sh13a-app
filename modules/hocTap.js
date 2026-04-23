function initHocTap() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>📚 QUẢN LÝ HỌC TẬP</h3></div>
        <div class="search-bar"><input type="text" id="baiHoc" placeholder="Tên bài học"><button onclick="addBaiHoc()" class="success">+ Thêm</button></div>
        <div id="baiHocList"></div>
    `;
    loadBaiHoc();
}

let baiHocList = [];
async function loadBaiHoc() {
    const snap = await db.collection('baiHoc').get();
    baiHocList = [];
    snap.forEach(d => baiHocList.push(d.data()));
    displayBaiHoc();
}
function displayBaiHoc() {
    const html = baiHocList.map(b => `<div class="list-item"><div class="list-icon">📖</div><div class="list-info"><div class="list-title">${b.tenBai}</div></div></div>`).join('');
    document.getElementById('baiHocList').innerHTML = html || '<p>Chưa có bài học</p>';
}
async function addBaiHoc() {
    const ten = document.getElementById('baiHoc').value;
    if(ten) await db.collection('baiHoc').add({ tenBai: ten });
    loadBaiHoc();
}