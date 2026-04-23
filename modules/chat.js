// ========== MODULE CHAT - NHẮN TIN NỘI BỘ NHƯ ZALO ==========

let currentChatRoom = null;
let currentChatUser = null;
let unreadCounts = {};
let messageListeners = {};
let chatRooms = [
    { id: 'all', name: '🏛️ Toàn đơn vị', icon: '🏛️', type: 'group' },
    { id: 'team1', name: '👥 Trung đội 1', icon: '👥', type: 'group' },
    { id: 'team2', name: '👥 Trung đội 2', icon: '👥', type: 'group' },
    { id: 'team3', name: '👥 Trung đội 3', icon: '👥', type: 'group' }
];

function initChat() {
    document.getElementById('contentArea').innerHTML = `
        <div class="section-title"><h3>💬 CHAT NỘI BỘ</h3></div>
        
        <!-- Danh sách phòng chat -->
        <div id="chatRoomList">
            ${chatRooms.map(room => `
                <div class="chat-room-item" onclick="openChatRoom('${room.id}')">
                    <div class="chat-room-avatar">${room.icon}</div>
                    <div class="chat-room-info">
                        <div class="chat-room-name">${room.name}</div>
                        <div class="chat-room-lastmsg" id="lastMsg_${room.id}">Nhấn để chat</div>
                    </div>
                    <div class="chat-room-time" id="time_${room.id}"></div>
                    <div class="chat-room-unread" id="unread_${room.id}" style="display:none;">0</div>
                </div>
            `).join('')}
        </div>

        <!-- Màn hình chat chi tiết -->
        <div id="chatDetailPanel" class="chat-detail-panel" style="display:none;">
            <div class="chat-header">
                <button class="chat-back-btn" onclick="closeChatRoom()"><i class="fas fa-arrow-left"></i></button>
                <div class="chat-header-info">
                    <div class="chat-header-name" id="chatHeaderName"></div>
                    <div class="chat-header-status" id="chatHeaderStatus">Đang hoạt động</div>
                </div>
                <button class="chat-info-btn" onclick="showChatInfo()"><i class="fas fa-info-circle"></i></button>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-area">
                <button class="chat-attach-btn" onclick="openAttachMenu()"><i class="fas fa-paperclip"></i></button>
                <input type="text" id="messageInput" class="chat-input" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button class="chat-send-btn" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>

        <!-- Modal thông tin phòng chat -->
        <div id="chatInfoModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3><i class="fas fa-info-circle"></i> Thông tin phòng</h3>
                <div id="chatInfoContent"></div>
                <div class="modal-buttons">
                    <button onclick="closeChatInfoModal()" class="danger">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Modal gửi ảnh/file -->
        <div id="attachModal" class="modal" style="display:none;">
            <div class="modal-content">
                <h3><i class="fas fa-paperclip"></i> Gửi tập tin</h3>
                <div style="text-align: center; padding: 20px;">
                    <button onclick="uploadImage()" style="margin: 5px;"><i class="fas fa-image"></i> Chọn ảnh</button>
                    <button onclick="uploadFile()" style="margin: 5px;"><i class="fas fa-file"></i> Chọn file</button>
                </div>
                <div class="modal-buttons">
                    <button onclick="closeAttachModal()" class="danger">Hủy</button>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .chat-room-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            border-bottom: 1px solid #eef2f6;
            cursor: pointer;
            transition: background 0.2s;
        }
        .chat-room-item:hover { background: #f8fafc; }
        .chat-room-avatar {
            width: 50px;
            height: 50px;
            background: #2c3e50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
        }
        .chat-room-info { flex: 1; }
        .chat-room-name { font-weight: 600; font-size: 16px; color: #1e293b; }
        .chat-room-lastmsg { font-size: 12px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .chat-room-time { font-size: 10px; color: #94a3b8; }
        .chat-room-unread {
            background: #e74c3c;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 20px;
            min-width: 18px;
            text-align: center;
        }
        
        .chat-detail-panel {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 200px);
            background: white;
            border-radius: 16px;
            overflow: hidden;
        }
        .chat-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            background: white;
            border-bottom: 1px solid #eef2f6;
        }
        .chat-back-btn, .chat-info-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            width: auto;
            color: #2c3e50;
        }
        .chat-header-info { flex: 1; }
        .chat-header-name { font-weight: 600; font-size: 16px; }
        .chat-header-status { font-size: 11px; color: #27ae60; }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .message {
            display: flex;
            flex-direction: column;
            max-width: 80%;
        }
        .message.sent { align-self: flex-end; }
        .message.received { align-self: flex-start; }
        .message-bubble {
            padding: 10px 14px;
            border-radius: 18px;
            font-size: 14px;
            word-break: break-word;
        }
        .message.sent .message-bubble {
            background: #3b82f6;
            color: white;
            border-bottom-right-radius: 4px;
        }
        .message.received .message-bubble {
            background: white;
            border: 1px solid #eef2f6;
            border-bottom-left-radius: 4px;
        }
        .message-info {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 4px;
            display: flex;
            gap: 8px;
        }
        .message-img {
            max-width: 200px;
            max-height: 200px;
            border-radius: 12px;
            cursor: pointer;
            margin-top: 5px;
        }
        .message-file {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f1f5f9;
            padding: 8px 12px;
            border-radius: 12px;
            margin-top: 5px;
            cursor: pointer;
        }
        .chat-input-area {
            display: flex;
            gap: 10px;
            padding: 12px;
            background: white;
            border-top: 1px solid #eef2f6;
        }
        .chat-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #e2e8f0;
            border-radius: 25px;
            outline: none;
            font-size: 14px;
        }
        .chat-attach-btn, .chat-send-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            width: auto;
            color: #3b82f6;
        }
        .chat-send-btn { background: #3b82f6; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
        .emoji-picker { display: flex; gap: 8px; padding: 8px; background: white; border: 1px solid #eef2f6; border-radius: 20px; margin-bottom: 8px; flex-wrap: wrap; }
        .emoji { cursor: pointer; font-size: 20px; padding: 4px; }
    `;
    document.head.appendChild(style);
    
    startMessageListeners();
    loadLastMessages();
    loadUnreadCounts();
}

// Bắt đầu lắng nghe tin nhắn realtime
function startMessageListeners() {
    for(const room of chatRooms) {
        if(messageListeners[room.id]) messageListeners[room.id]();
        messageListeners[room.id] = db.collection('chats').where('room', '==', room.id).orderBy('timestamp', 'asc').onSnapshot(snapshot => {
            loadLastMessages();
            loadUnreadCounts();
            if(currentChatRoom === room.id) {
                loadChatMessages();
                markAsRead(room.id);
            }
        });
    }
}

// Load tin nhắn cuối của từng phòng
async function loadLastMessages() {
    for(const room of chatRooms) {
        const snapshot = await db.collection('chats').where('room', '==', room.id).orderBy('timestamp', 'desc').limit(1).get();
        if(!snapshot.empty) {
            const msg = snapshot.docs[0].data();
            let lastText = msg.text || (msg.type === 'image' ? '📷 Hình ảnh' : (msg.type === 'file' ? `📎 ${msg.fileName}` : ''));
            document.getElementById(`lastMsg_${room.id}`).innerHTML = lastText.substring(0, 50);
            if(msg.timestamp) {
                const time = msg.timestamp.toDate();
                document.getElementById(`time_${room.id}`).innerHTML = `${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}`;
            }
        }
    }
}

// Load số tin nhắn chưa đọc
async function loadUnreadCounts() {
    let totalUnread = 0;
    for(const room of chatRooms) {
        const lastReadKey = `lastRead_${room.id}_${currentUser?.uid}`;
        const lastReadDoc = await db.collection('readReceipts').doc(lastReadKey).get();
        const lastReadTime = lastReadDoc.exists ? lastReadDoc.data().timestamp : 0;
        
        const snapshot = await db.collection('chats').where('room', '==', room.id).where('timestamp', '>', lastReadTime).get();
        let unread = 0;
        snapshot.forEach(doc => {
            if(doc.data().userId !== currentUser?.uid) unread++;
        });
        unreadCounts[room.id] = unread;
        totalUnread += unread;
        
        const unreadElem = document.getElementById(`unread_${room.id}`);
        if(unread > 0) {
            unreadElem.style.display = 'inline-block';
            unreadElem.innerText = unread > 99 ? '99+' : unread;
        } else {
            unreadElem.style.display = 'none';
        }
    }
    
    const badge = document.getElementById('chatBadge');
    if(badge) {
        if(totalUnread > 0) {
            badge.style.display = 'inline-block';
            badge.innerText = totalUnread > 99 ? '99+' : totalUnread;
        } else {
            badge.style.display = 'none';
        }
    }
}

// Mở phòng chat
function openChatRoom(roomId) {
    currentChatRoom = roomId;
    const room = chatRooms.find(r => r.id === roomId);
    document.getElementById('chatHeaderName').innerHTML = room.name;
    document.getElementById('chatRoomList').style.display = 'none';
    document.getElementById('chatDetailPanel').style.display = 'flex';
    loadChatMessages();
    markAsRead(roomId);
}

// Đóng phòng chat
function closeChatRoom() {
    currentChatRoom = null;
    document.getElementById('chatRoomList').style.display = 'block';
    document.getElementById('chatDetailPanel').style.display = 'none';
    loadUnreadCounts();
}

// Load tin nhắn trong phòng
async function loadChatMessages() {
    if(!currentChatRoom) return;
    const snapshot = await db.collection('chats').where('room', '==', currentChatRoom).orderBy('timestamp', 'asc').limit(200).get();
    let html = '';
    for(const doc of snapshot.docs) {
        const m = doc.data();
        const isSent = m.userId === currentUser?.uid;
        const time = m.timestamp ? new Date(m.timestamp.toDate()).toLocaleTimeString() : '';
        
        if(m.type === 'text') {
            html += `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-bubble">${escapeHtml(m.text)}</div>
                    <div class="message-info">
                        <span>${m.userName || m.userEmail?.split('@')[0]}</span>
                        <span>${time}</span>
                    </div>
                </div>
            `;
        } else if(m.type === 'image') {
            html += `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-bubble">
                        <img src="${m.fileUrl}" class="message-img" onclick="window.open('${m.fileUrl}', '_blank')">
                    </div>
                    <div class="message-info">
                        <span>${m.userName || m.userEmail?.split('@')[0]}</span>
                        <span>${time}</span>
                    </div>
                </div>
            `;
        } else if(m.type === 'file') {
            const fileIcon = getFileIcon(m.fileName);
            html += `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-bubble">
                        <div class="message-file" onclick="downloadFile('${m.fileUrl}', '${m.fileName}')">
                            <i class="fas ${fileIcon}"></i>
                            <span>${m.fileName}</span>
                            <i class="fas fa-download"></i>
                        </div>
                    </div>
                    <div class="message-info">
                        <span>${m.userName || m.userEmail?.split('@')[0]}</span>
                        <span>${time}</span>
                    </div>
                </div>
            `;
        }
    }
    document.getElementById('chatMessages').innerHTML = html || '<div style="text-align:center;color:#94a3b8;padding:40px;">Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!</div>';
    document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

// Gửi tin nhắn
async function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if(!text || !currentChatRoom) return;
    
    await db.collection('chats').add({
        room: currentChatRoom,
        text: text,
        type: 'text',
        userId: currentUser.uid,
        userName: currentUser.email?.split('@')[0] || 'Thành viên',
        userEmail: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    document.getElementById('messageInput').value = '';
    loadChatMessages();
}

// Đánh dấu đã đọc
async function markAsRead(roomId) {
    const lastReadKey = `lastRead_${roomId}_${currentUser?.uid}`;
    await db.collection('readReceipts').doc(lastReadKey).set({
        timestamp: new Date().toISOString(),
        userId: currentUser?.uid,
        roomId: roomId
    });
    loadUnreadCounts();
}

// Mở menu đính kèm
function openAttachMenu() {
    document.getElementById('attachModal').style.display = 'flex';
}

function closeAttachModal() {
    document.getElementById('attachModal').style.display = 'none';
}

// Upload ảnh
async function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if(file && currentChatRoom) {
            await uploadFileToStorage(file, 'image');
        }
        closeAttachModal();
    };
    input.click();
}

// Upload file
async function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if(file && currentChatRoom) {
            await uploadFileToStorage(file, 'file');
        }
        closeAttachModal();
    };
    input.click();
}

// Upload lên Firebase Storage
async function uploadFileToStorage(file, type) {
    const fileId = `${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`chat_files/${fileId}`);
    
    showToast('Đang tải lên...', 'success');
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    
    // Lên lịch xóa sau 5 ngày
    setTimeout(async () => {
        await storageRef.delete();
    }, 5 * 24 * 60 * 60 * 1000);
    
    await db.collection('chats').add({
        room: currentChatRoom,
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: type,
        type: type,
        fileId: fileId,
        userId: currentUser.uid,
        userName: currentUser.email?.split('@')[0] || 'Thành viên',
        userEmail: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    loadChatMessages();
    showToast('Đã gửi!', 'success');
}

// Tải file về máy
function downloadFile(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
}

// Hiển thị thông tin phòng chat
function showChatInfo() {
    const room = chatRooms.find(r => r.id === currentChatRoom);
    document.getElementById('chatInfoContent').innerHTML = `
        <div style="text-align:center; padding:10px;">
            <div style="font-size:48px;">${room.icon}</div>
            <h3>${room.name}</h3>
            <p>Thành viên: Toàn bộ đơn vị</p>
            <p>Phòng chat nội bộ dành cho cán bộ, chiến sĩ trong đơn vị</p>
        </div>
    `;
    document.getElementById('chatInfoModal').style.display = 'flex';
}

function closeChatInfoModal() {
    document.getElementById('chatInfoModal').style.display = 'none';
}

// Hàm tiện ích
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if(['jpg','jpeg','png','gif','webp'].includes(ext)) return 'fa-image';
    if(['pdf'].includes(ext)) return 'fa-file-pdf';
    if(['doc','docx'].includes(ext)) return 'fa-file-word';
    if(['xls','xlsx'].includes(ext)) return 'fa-file-excel';
    if(['ppt','pptx'].includes(ext)) return 'fa-file-powerpoint';
    if(['txt'].includes(ext)) return 'fa-file-alt';
    return 'fa-file';
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}