// ========== MODULE CHAT - HOÀN CHỈNH ==========

let currentChatRoom = null;
let messageListeners = {};
let unreadCounts = {};

const chatRooms = [
    { id: 'all', name: '🏛️ Toàn đơn vị', icon: '🏛️' },
    { id: 'team1', name: '👥 Trung đội 1', icon: '👥' },
    { id: 'team2', name: '👥 Trung đội 2', icon: '👥' },
    { id: 'team3', name: '👥 Trung đội 3', icon: '👥' }
];

// HÀM KHỞI TẠO CHÍNH - PHẢI CÓ TÊN NÀY
function initChat() {
    console.log('initChat called');
    
    document.getElementById('contentArea').innerHTML = `
        <style>
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
            .chat-room-lastmsg { font-size: 12px; color: #94a3b8; }
            .chat-room-time { font-size: 10px; color: #94a3b8; }
            .chat-room-unread {
                background: #e74c3c;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 20px;
            }
            .chat-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 15px;
                background: white;
                border-bottom: 1px solid #eef2f6;
            }
            .chat-back-btn {
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
                height: 400px;
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
                border: 1px solid #ddd;
                border-radius: 25px;
                outline: none;
            }
            .chat-send-btn {
                background: #3b82f6;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                color: white;
                cursor: pointer;
            }
        </style>
        
        <div id="chatContainer">
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
            
            <div id="chatDetailPanel" style="display:none;">
                <div class="chat-header">
                    <button class="chat-back-btn" onclick="closeChatRoom()"><i class="fas fa-arrow-left"></i></button>
                    <div class="chat-header-info">
                        <div class="chat-header-name" id="chatHeaderName"></div>
                        <div class="chat-header-status">Đang hoạt động</div>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input-area">
                    <input type="text" id="messageInput" class="chat-input" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') sendMessage()">
                    <button class="chat-send-btn" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    
    startMessageListeners();
    loadLastMessages();
    loadUnreadCounts();
}

// Bắt đầu lắng nghe tin nhắn
function startMessageListeners() {
    for(const room of chatRooms) {
        if(messageListeners[room.id]) messageListeners[room.id]();
        messageListeners[room.id] = db.collection('chats').where('room', '==', room.id).orderBy('timestamp', 'asc').onSnapshot(() => {
            loadLastMessages();
            loadUnreadCounts();
            if(currentChatRoom === room.id) {
                loadChatMessages();
                markAsRead(room.id);
            }
        });
    }
}

// Load tin nhắn cuối
async function loadLastMessages() {
    for(const room of chatRooms) {
        try {
            const snapshot = await db.collection('chats').where('room', '==', room.id).orderBy('timestamp', 'desc').limit(1).get();
            if(!snapshot.empty) {
                const msg = snapshot.docs[0].data();
                let lastText = msg.text || '';
                const lastMsgElem = document.getElementById(`lastMsg_${room.id}`);
                if(lastMsgElem) lastMsgElem.innerHTML = lastText.substring(0, 50) || 'Nhấn để chat';
                if(msg.timestamp) {
                    const time = msg.timestamp.toDate();
                    const timeElem = document.getElementById(`time_${room.id}`);
                    if(timeElem) timeElem.innerHTML = `${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}`;
                }
            }
        } catch(e) { console.log(e); }
    }
}

// Load số tin nhắn chưa đọc
async function loadUnreadCounts() {
    let totalUnread = 0;
    for(const room of chatRooms) {
        try {
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
            if(unreadElem) {
                if(unread > 0) {
                    unreadElem.style.display = 'inline-block';
                    unreadElem.innerText = unread > 99 ? '99+' : unread;
                } else {
                    unreadElem.style.display = 'none';
                }
            }
        } catch(e) { console.log(e); }
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

// Load tin nhắn
async function loadChatMessages() {
    if(!currentChatRoom) return;
    try {
        const snapshot = await db.collection('chats').where('room', '==', currentChatRoom).orderBy('timestamp', 'asc').limit(200).get();
        let html = '';
        for(const doc of snapshot.docs) {
            const m = doc.data();
            const isSent = m.userId === currentUser?.uid;
            const time = m.timestamp ? new Date(m.timestamp.toDate()).toLocaleTimeString() : '';
            const userName = m.userName || m.userEmail?.split('@')[0] || 'Thành viên';
            
            html += `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-bubble">${escapeHtml(m.text || '')}</div>
                    <div class="message-info"><span>${userName}</span><span>${time}</span></div>
                </div>
            `;
        }
        const messagesDiv = document.getElementById('chatMessages');
        if(messagesDiv) {
            messagesDiv.innerHTML = html || '<div style="text-align:center;padding:40px;">Chưa có tin nhắn</div>';
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    } catch(e) { console.log(e); }
}

// Gửi tin nhắn
async function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if(!text || !currentChatRoom) return;
    
    try {
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
    } catch(error) {
        alert('Lỗi: ' + error.message);
    }
}

// Đánh dấu đã đọc
async function markAsRead(roomId) {
    try {
        const lastReadKey = `lastRead_${roomId}_${currentUser?.uid}`;
        await db.collection('readReceipts').doc(lastReadKey).set({
            timestamp: new Date().toISOString(),
            userId: currentUser?.uid,
            roomId: roomId
        });
        loadUnreadCounts();
    } catch(e) { console.log(e); }
}

// Gửi tin nhắn mẫu
async function sendSampleMessages() {
    for(const room of chatRooms) {
        const snapshot = await db.collection('chats').where('room', '==', room.id).limit(1).get();
        if(snapshot.empty) {
            await db.collection('chats').add({
                room: room.id,
                text: `Chào mừng bạn đến với ${room.name}!`,
                type: 'text',
                userId: 'system',
                userName: 'Hệ thống',
                userEmail: 'system@sh13a.com',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

function escapeHtml(text) {
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

// Tự động gửi tin nhắn mẫu khi có user
if(typeof currentUser !== 'undefined' && currentUser) {
    setTimeout(() => sendSampleMessages(), 1000);
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}