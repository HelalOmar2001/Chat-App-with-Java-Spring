/* ═══════════════════════════════════════════════════════
   ChatApp Frontend — JavaScript
   Connects to Spring Boot REST API + STOMP WebSocket
   ═══════════════════════════════════════════════════════ */

const API = 'http://localhost:8080';
const WS_ENDPOINT = `${API}/ws`;

// ─── State ───
let currentUser = null;   // { id, name }
let currentChatId = null;
let allChats = [];
let allUsers = [];
let stompClient = null;
let stompSubscription = null;

// ═══════════════════ INIT ═══════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadUsersForLogin();
});

// ═══════════════════ LOGIN ═══════════════════
function switchLoginTab(tab) {
    document.getElementById('login-tab-btn').classList.toggle('active', tab === 'login');
    document.getElementById('register-tab-btn').classList.toggle('active', tab === 'register');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

async function loadUsersForLogin() {
    try {
        const res = await fetch(`${API}/api/v1/users`);
        const users = await res.json();
        allUsers = users;
        const select = document.getElementById('login-user-select');
        if (users.length === 0) {
            select.innerHTML = '<option value="">No users — create one first</option>';
        } else {
            select.innerHTML = '<option value="">Select your account...</option>'
                + users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
        }
    } catch (e) {
        console.error('Failed to load users:', e);
        showToast('Cannot reach server. Is the backend running?', 'error');
    }
}

function loginUser() {
    const select = document.getElementById('login-user-select');
    const userId = select.value;
    if (!userId) { showToast('Please select an account', 'error'); return; }
    const user = allUsers.find(u => u.id == userId);
    currentUser = user;
    enterApp();
}

async function registerUser() {
    const input = document.getElementById('register-name-input');
    const name = input.value.trim();
    if (!name) { showToast('Please enter a name', 'error'); return; }
    try {
        const res = await fetch(`${API}/api/v1/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const id = await res.json();
        currentUser = { id, name };
        input.value = '';
        showToast('Account created!', 'success');
        enterApp();
    } catch (e) {
        showToast('Failed to create account', 'error');
    }
}

function enterApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-app').classList.remove('hidden');
    document.getElementById('current-user-name').textContent = currentUser.name;
    setAvatarInitials('user-avatar', currentUser.name);
    loadAllUsers();
    loadChats();
    connectWebSocket();
}

function logout() {
    disconnectWebSocket();
    currentUser = null;
    currentChatId = null;
    allChats = [];
    document.getElementById('chat-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('chat-view').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('chat-info-panel').classList.add('hidden');
    loadUsersForLogin();
}

// ═══════════════════ WEBSOCKET ═══════════════════
function connectWebSocket() {
    try {
        const socket = new SockJS(WS_ENDPOINT);
        stompClient = Stomp.over(socket);
        stompClient.debug = null; // silence logs
        stompClient.connect({}, () => {
            stompSubscription = stompClient.subscribe('/topic/messages', (msg) => {
                handleIncomingWsMessage(msg.body);
            });
        }, (err) => {
            console.error('WebSocket error:', err);
        });
    } catch (e) {
        console.error('WebSocket connection failed:', e);
    }
}

function disconnectWebSocket() {
    if (stompSubscription) stompSubscription.unsubscribe();
    if (stompClient) stompClient.disconnect();
    stompClient = null;
    stompSubscription = null;
}

function handleIncomingWsMessage(body) {
    try {
        const data = JSON.parse(body);
        if (data.chatId === currentChatId) {
            appendMessage(data, false);
        }
        // Refresh chat list to update previews
        loadChats();
    } catch {
        // plain text fallback
        if (currentChatId) {
            appendMessage({ message: body, chatId: currentChatId }, false);
        }
    }
}

function sendViaWebSocket(payload) {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/chat', {}, JSON.stringify(payload));
    }
}

// ═══════════════════ USERS ═══════════════════
async function loadAllUsers() {
    try {
        const res = await fetch(`${API}/api/v1/users`);
        allUsers = await res.json();
    } catch (e) { console.error(e); }
}

// ═══════════════════ CHATS ═══════════════════
async function loadChats() {
    try {
        const res = await fetch(`${API}/api/v1/chats`);
        allChats = await res.json();
        renderChatList(allChats);
    } catch (e) {
        console.error('Failed to load chats:', e);
    }
}

function renderChatList(chats) {
    const list = document.getElementById('chat-list');
    if (!chats || chats.length === 0) {
        list.innerHTML = `
            <div class="chat-list-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <p>No chats yet</p>
                <span>Start a new conversation!</span>
            </div>`;
        return;
    }
    list.innerHTML = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        const name = chat.chatName || 'Unnamed Chat';
        const typeLabel = chat.isGroupChat ? 'Group' : 'Direct';
        return `
            <div class="chat-item ${isActive ? 'active' : ''}" onclick="openChat('${chat.id}')" id="chat-item-${chat.id}">
                <div class="avatar">${getInitials(name)}</div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${escapeHtml(name)}</div>
                    <div class="chat-item-preview">${typeLabel} chat</div>
                </div>
                ${chat.isGroupChat ? '<span class="chat-item-badge">GRP</span>' : ''}
            </div>`;
    }).join('');
}

function filterChats() {
    const query = document.getElementById('search-chats').value.toLowerCase();
    if (!query) { renderChatList(allChats); return; }
    const filtered = allChats.filter(c =>
        (c.chatName || '').toLowerCase().includes(query)
    );
    renderChatList(filtered);
}

// ─── Create Chat ───
function openNewChatModal() {
    document.getElementById('new-chat-modal').classList.remove('hidden');
    document.getElementById('chat-name-input').value = '';
    document.getElementById('is-group-chat').checked = false;
    document.getElementById('chat-name-input').focus();
}
function closeNewChatModal() {
    document.getElementById('new-chat-modal').classList.add('hidden');
}

async function createNewChat() {
    const name = document.getElementById('chat-name-input').value.trim();
    const isGroup = document.getElementById('is-group-chat').checked;
    if (!name) { showToast('Please enter a chat name', 'error'); return; }
    try {
        const res = await fetch(`${API}/api/v1/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatName: name, isGroupChat: isGroup })
        });
        const chatId = await res.json();
        closeNewChatModal();
        showToast('Chat created!', 'success');

        // Add current user as OWNER participant
        try {
            await fetch(`${API}/api/v1/chatParticipants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, chatId: chatId, role: 'OWNER' })
            });
        } catch (e) { console.error('Failed to add participant', e); }

        await loadChats();
        openChat(chatId);
    } catch (e) {
        showToast('Failed to create chat', 'error');
    }
}

// ─── Open Chat ───
async function openChat(chatId) {
    currentChatId = chatId;

    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('chat-view').classList.remove('hidden');

    // On mobile, hide sidebar
    document.getElementById('sidebar').classList.add('sidebar-hidden');

    // Highlight active chat
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    const item = document.getElementById(`chat-item-${chatId}`);
    if (item) item.classList.add('active');

    // Load chat info
    const chat = allChats.find(c => c.id === chatId);
    const chatName = chat ? (chat.chatName || 'Unnamed Chat') : 'Chat';
    document.getElementById('chat-title').textContent = chatName;
    document.getElementById('chat-subtitle').textContent = chat?.isGroupChat ? 'Group Chat' : 'Direct Chat';
    setAvatarInitials('chat-avatar', chatName);

    // Load messages
    await loadMessages(chatId);

    // Focus input
    document.getElementById('message-input').focus();
}

async function loadMessages(chatId) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '<p class="muted" style="text-align:center;padding:20px;">Loading messages...</p>';
    try {
        const res = await fetch(`${API}/api/v1/messages/${chatId}`);
        const messages = await res.json();
        container.innerHTML = '';
        if (messages.length === 0) {
            container.innerHTML = '<p class="muted" style="text-align:center;padding:40px;">No messages yet. Say hello! 👋</p>';
            return;
        }
        messages.forEach(msg => appendMessage(msg, true));
        scrollToBottom();
    } catch (e) {
        container.innerHTML = '<p class="muted" style="text-align:center;padding:20px;">Failed to load messages</p>';
    }
}

function appendMessage(msg, skipScroll) {
    const container = document.getElementById('messages-container');
    // Remove empty state text if present
    const emptyMsg = container.querySelector('.muted');
    if (emptyMsg) emptyMsg.remove();

    const isSent = false; // In a real app, compare sender ID
    const row = document.createElement('div');
    row.className = `message-row ${isSent ? 'sent' : 'received'}`;
    row.innerHTML = `
        <div class="message-bubble">
            <div>${escapeHtml(msg.message || '')}</div>
            <div class="message-meta">
                <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>`;
    container.appendChild(row);
    if (!skipScroll) scrollToBottom();
}

function scrollToBottom() {
    const area = document.getElementById('messages-area');
    setTimeout(() => { area.scrollTop = area.scrollHeight; }, 50);
}

// ─── Send Message ───
async function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text || !currentChatId) return;
    input.value = '';

    // Optimistic UI
    const msgData = { message: text, chatId: currentChatId };
    const container = document.getElementById('messages-container');
    const emptyMsg = container.querySelector('.muted');
    if (emptyMsg) emptyMsg.remove();

    const row = document.createElement('div');
    row.className = 'message-row sent';
    row.innerHTML = `
        <div class="message-bubble">
            <div>${escapeHtml(text)}</div>
            <div class="message-meta">
                <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>`;
    container.appendChild(row);
    scrollToBottom();

    try {
        await fetch(`${API}/api/v1/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgData)
        });
        // Also broadcast via WebSocket
        sendViaWebSocket(msgData);
    } catch (e) {
        showToast('Failed to send message', 'error');
    }
}

function handleMessageKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// ─── Delete Chat ───
async function deleteCurrentChat() {
    if (!currentChatId) return;
    if (!confirm('Delete this chat and all its messages?')) return;
    try {
        await fetch(`${API}/api/v1/chats/${currentChatId}`, { method: 'DELETE' });
        showToast('Chat deleted', 'info');
        currentChatId = null;
        document.getElementById('chat-view').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('hidden');
        document.getElementById('chat-info-panel').classList.add('hidden');
        await loadChats();
    } catch (e) {
        showToast('Failed to delete chat', 'error');
    }
}

function closeChatView() {
    document.getElementById('sidebar').classList.remove('sidebar-hidden');
    document.getElementById('chat-view').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');
    currentChatId = null;
}

// ═══════════════════ CHAT INFO PANEL ═══════════════════
function toggleChatInfo() {
    const panel = document.getElementById('chat-info-panel');
    const isHidden = panel.classList.contains('hidden');
    if (isHidden) {
        panel.classList.remove('hidden');
        loadChatInfoPanel();
    } else {
        panel.classList.add('hidden');
    }
}

async function loadChatInfoPanel() {
    const chat = allChats.find(c => c.id === currentChatId);
    if (!chat) return;
    const name = chat.chatName || 'Unnamed Chat';
    document.getElementById('panel-chat-name').textContent = name;
    document.getElementById('panel-chat-type').textContent = chat.isGroupChat ? 'Group' : 'Direct';
    const panelAvatar = document.getElementById('panel-chat-avatar');
    panelAvatar.textContent = getInitials(name);

    // Load participants
    const partList = document.getElementById('panel-participants');
    partList.innerHTML = '<p class="muted">Loading...</p>';
    try {
        const res = await fetch(`${API}/api/v1/chatParticipants`);
        const allParts = await res.json();
        const chatParts = allParts.filter(p => p.chatId === currentChatId);
        if (chatParts.length === 0) {
            partList.innerHTML = '<p class="muted">No participants yet</p>';
            return;
        }
        const items = await Promise.all(chatParts.map(async (p) => {
            let userName = `User #${p.userId}`;
            try {
                const uRes = await fetch(`${API}/api/v1/users/${p.userId}`);
                const u = await uRes.json();
                userName = u.name;
            } catch {}
            return `
                <div class="participant-item">
                    <div class="avatar sm">${getInitials(userName)}</div>
                    <span class="participant-name">${escapeHtml(userName)}</span>
                    <span class="participant-role">${p.role}</span>
                </div>`;
        }));
        partList.innerHTML = items.join('');
    } catch (e) {
        partList.innerHTML = '<p class="muted">Failed to load</p>';
    }
}

// ─── Add Participant ───
function openAddParticipantModal() {
    document.getElementById('add-participant-modal').classList.remove('hidden');
    const select = document.getElementById('participant-user-select');
    select.innerHTML = '<option value="">Choose a user...</option>'
        + allUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}
function closeAddParticipantModal() {
    document.getElementById('add-participant-modal').classList.add('hidden');
}

async function addParticipant() {
    const userId = document.getElementById('participant-user-select').value;
    const role = document.getElementById('participant-role-select').value;
    if (!userId) { showToast('Please select a user', 'error'); return; }
    try {
        await fetch(`${API}/api/v1/chatParticipants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), chatId: currentChatId, role })
        });
        closeAddParticipantModal();
        showToast('Participant added!', 'success');
        loadChatInfoPanel();
    } catch (e) {
        showToast('Failed to add participant', 'error');
    }
}

// ═══════════════════ MODAL HELPERS ═══════════════════
function closeModalOnBackdrop(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.add('hidden');
    }
}

// ═══════════════════ TOASTS ═══════════════════
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };
    toast.innerHTML = `${icons[type] || icons.info}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ═══════════════════ UTILITIES ═══════════════════
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
}

function setAvatarInitials(elementId, name) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = getInitials(name);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
