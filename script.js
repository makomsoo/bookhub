// ===== 1. БЕТТЕРДІ АУЫСТЫРУ (Навигация) =====
function openTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    
    if (tabId === 'profile-tab') updateProfile();
    if (tabId === 'chat-tab') renderChat();
    if (tabId === 'market-tab') renderMarket();
}

// ===== 2. КІТАП ТРЕКЕРІ =====
let books = JSON.parse(localStorage.getItem('neonBooks')) || [];
let currentBookId = null;

function renderBooks() {
    const list = document.getElementById('book-list');
    list.innerHTML = '';
    let totalPages = 0;

    books.forEach(book => {
        const percent = Math.round((book.readPages / book.totalPages) * 100) || 0;
        totalPages += book.readPages;
        
        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => openBookModal(book.id);
        card.innerHTML = `
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${percent}%"></div></div>
            <div class="book-percent">${percent}% оқылды</div>
        `;
        list.appendChild(card);
    });
    document.getElementById('total-pages-read').innerText = totalPages;
}

function addBook() {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim() || "Белгісіз автор";
    const pages = parseInt(document.getElementById('total-pages').value);
    
    if (!title || !pages || pages <= 0) return alert("Кітап аты мен бет санын дұрыс енгізіңіз!");
    
    books.push({ id: Date.now(), title, author, totalPages: pages, readPages: 0 });
    localStorage.setItem('neonBooks', JSON.stringify(books));
    renderBooks();
    
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('total-pages').value = '';
}

// ===== 3. КІТАПТЫ АШУ ЖӘНЕ ТАЙМЕР =====
let timerInterval;
let timeLeft = 25 * 60; // 25 минут
let isTimerRunning = false;

function openBookModal(id) {
    currentBookId = id;
    const book = books.find(b => b.id === id);
    
    document.getElementById('modal-title').innerText = book.title;
    document.getElementById('modal-author').innerText = book.author;
    document.getElementById('modal-progress').innerText = Оқылды: ${book.readPages} / ${book.totalPages} бет;
    
    // Таймерді 25 минутқа қалпына келтіру
    resetTimer();
    
    document.getElementById('reading-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('reading-modal').style.display = 'none';
    document.getElementById('pages-read-input').value = '';
    resetTimer(); // Терезе жабылғанда таймер тоқтайды
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    document.getElementById('timer-btn').innerHTML = '<i class="fas fa-play"></i> Оқуды бастау';
    document.getElementById('timer-btn').classList.remove('pink');
    document.getElementById('timer-btn').classList.add('purple');
    
    // Кейіпкердің аузын қалыпты күйге қайтару
    const mouth = document.querySelector('#lamp-character path[stroke="#111"]');
    if(mouth) mouth.setAttribute('d', 'M 85 110 Q 100 120 115 110');
}

function toggleTimer() {
    const btn = document.getElementById('timer-btn');
    
    if (isTimerRunning) {
        // ТОҚТАТУ
        clearInterval(timerInterval);
        isTimerRunning = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Жалғастыру';
        btn.classList.remove('pink');
        btn.classList.add('purple');
        
        // Ауызды қалыпты қылу
        const mouth = document.querySelector('#lamp-character path[stroke="#111"]');
        if(mouth) mouth.setAttribute('d', 'M 85 110 Q 100 120 115 110');
        
    } else {
        // БАСТАУ
        isTimerRunning = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> Тоқтату';
        btn.classList.remove('purple');
        btn.classList.add('pink');
        
        // Кейіпкердің аузын үлкен күлімсіреуге өзгерту (Оқып жатқанда қуанады)
        const mouth = document.querySelector('#lamp-character path[stroke="#111"]');
        if(mouth) mouth.setAttribute('d', 'M 80 105 Q 100 125 120 105');
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                alert("Керемет! Сіз 25 минут үздіксіз оқыдыңыз. Енді демалыңыз!");
                resetTimer();
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').innerText = 
        ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')};
}

// ===== 4. ПРОГРЕСТІ САҚТАУ =====
function saveProgress() {
    const val = parseInt(document.getElementById('pages-read-input').value);
    const book = books.find(b => b.id === currentBookId);
    
    if (val >= 0 && val <= book.totalPages) {
        book.readPages = val;
        localStorage.setItem('neonBooks', JSON.stringify(books));
        renderBooks();
        closeModal();
        updateProfile();
    } else {
        alert(0 мен ${book.totalPages} аралығында сан енгізіңіз!);
    }
}

// ===== 5. ЧАТ (КЛУБ) =====
let chatMessages = JSON.parse(localStorage.getItem('neonChat')) || [];
let currentRoom = 'general';

function renderChat() {
    const box = document.getElementById('chat-box');
    box.innerHTML = '';
    const roomMessages = chatMessages.filter(m => m.room === currentRoom);
    
    if (roomMessages.length === 0) {
        box.innerHTML = <div class="message other">Бұл бөлмеде әзірге хабарлама жоқ. Бірінші болып жазыңыз!</div>;
    }

    roomMessages.forEach(m => {
        const div = document.createElement('div');
        div.className = message ${m.self ? 'self' : 'other'};
        div.innerHTML = <b>${m.author}:</b> ${m.text};
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-message');
    const text = input.value.trim();
    if (!text) return;

    chatMessages.push({ room: currentRoom, author: "Сіз", text: text, self: true });
    localStorage.setItem('neonChat', JSON.stringify(chatMessages));
    input.value = '';
    renderChat();
}

function switchRoom() {
    currentRoom = document.getElementById('chat-room').value;
    renderChat();
}

// ===== 6. АЛМАСУ (МАРКЕТ) =====
let marketItems = JSON.parse(localStorage.getItem('neonMarket')) || [
    { id: 1, title: "Қан мен тер", price: "Айырбастауға" },
    { id: 2, title: "Көшпенділер", price: "1500 тг" }
];

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '';
    
    marketItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'market-card glass';
        card.innerHTML = `
            <div class="book-cover">Кітап</div>
            <div class="market-info">
                <h4 style="color:#fff; margin-bottom:5px;">${item.title}</h4>
                <p class="price">${item.price}</p>
                <button class="neon-btn cyan" style="padding: 5px 10px; font-size: 12px; margin-top:5px;" onclick="alert('Байланыс: 87071234567')">Хабарласу</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function addMarketItem() {
    const title = document.getElementById('market-title').value.trim();
    const price = document.getElementById('market-price').value.trim();
    if (!title || !price) return alert("Кітап аты мен бағасын енгізіңіз!");
    
    marketItems.push({ id: Date.now(), title, price });
    localStorage.setItem('neonMarket', JSON.stringify(marketItems));
    renderMarket();
    
    document.getElementById('market-title').value = '';
    document.getElementById('market-price').value = '';
}

// ===== 7. ПРОФИЛЬ (МЕДАЛЬДАР) =====
function updateProfile() {
    let totalRead = 0;
    books.forEach(b => totalRead += b.readPages);
    
    const container = document.getElementById('badges-container');
    container.innerHTML = '';

    const allBadges = [
        { name: "Жаңадан бастаушы", req: 1, icon: "fa-seedling" },
        { name: "Белсенді оқырман", req: 100, icon: "fa-book" },
        { name: "Кітап құрты", req: 500, icon: "fa-fire" },
        { name: "Кітапханашы", req: 1000, icon: "fa-crown" }
    ];

    allBadges.forEach(badge => {
        const div = document.createElement('div');
        if (totalRead >= badge.req) {
            div.className = 'badge';
            div.innerHTML = <i class="fas ${badge.icon}"></i> ${badge.name};
        } else {
            div.className = 'badge locked';
            div.innerHTML = <i class="fas fa-lock"></i> ${badge.name} (${badge.req} бет);
        }
        container.appendChild(div);
    });
}

// Бетті алғаш ашқанда іске қосылатын функциялар
window.onload = () => {
    renderBooks();
    renderChat();
    renderMarket();
    updateProfile();
};
