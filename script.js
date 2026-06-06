const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

let score = 0;
let earnedTokens = 0; 
let gameActive = false;

let basket = { x: 140, y: 255, width: 60, height: 15, speed: 25 };
let coin = { x: Math.random() * (canvas.width - 20) + 10, y: 0, radius: 10, speed: 4 };

let audioCtx = null;
let musicInterval = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playCoinSound() {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = "sine"; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start(); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.stop(audioCtx.currentTime + 0.1);
}

function playBgMusic() {
    if (!audioCtx || !gameActive) return;
    let notes = [261.63, 329.63, 392.00, 329.63];
    let current = 0;
    musicInterval = setInterval(() => {
        if (!gameActive) { clearInterval(musicInterval); return; }
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = "triangle"; osc.frequency.setValueAtTime(notes[current], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.stop(audioCtx.currentTime + 0.4);
        current = (current + 1) % notes.length;
    }, 600);
}

function switchTab(sectionId, buttonElement) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    buttonElement.classList.add('active');
    
    if(sectionId === 'profile-sec' || sectionId === 'reward-sec') {
        updateProfileAndWallet();
    }
}

function updateProfileAndWallet() {
    document.getElementById("profCoins").innerText = earnedTokens;
    document.getElementById("walletBal").innerText = earnedTokens;
    
    const rankBadge = document.getElementById("profRank");
    
    if (earnedTokens < 1000) {
        rankBadge.innerText = "Bronze 🥉";
        rankBadge.className = "rank-badge bronze";
    } else if (earnedTokens >= 1000 && earnedTokens < 5000) {
        rankBadge.innerText = "Silver 🥈";
        rankBadge.className = "rank-badge silver";
    } else {
        rankBadge.innerText = "Gold 🥇";
        rankBadge.className = "rank-badge gold";
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && basket.x > 0) basket.x -= basket.speed;
    if (e.key === "ArrowRight" && basket.x < canvas.width - basket.width) basket.x += basket.speed;
});
canvas.addEventListener("touchmove", (e) => {
    let rect = canvas.getBoundingClientRect();
    let rootX = e.touches.clientX - rect.left;
    if(rootX > 0 && rootX < canvas.width - basket.width) basket.x = rootX;
});
canvas.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    let rootX = e.clientX - rect.left;
    if(rootX > 0 && rootX < canvas.width - basket.width) basket.x = rootX;
});

startBtn.addEventListener("click", () => {
    if (gameActive) return;
    initAudio();
    gameActive = true;
    score = 0;
    document.getElementById("scoreVal").innerText = score;
    startBtn.style.display = "none";
    coin.y = 0; coin.x = Math.random() * (canvas.width - 20) + 10; coin.speed = 4;
    playBgMusic();
    updateGame();
});

function updateGame() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24"; ctx.fill(); ctx.closePath();
    
    coin.y += coin.speed;
    
    if (coin.y + coin.radius >= basket.y && coin.x >= basket.x && coin.x <= basket.x + basket.width) {
        score += 10;
        document.getElementById("scoreVal").innerText = score;
        playCoinSound();
        
        if(score % 100 === 0) {
            earnedTokens += 1;
            document.getElementById("coinVal").innerText = earnedTokens;
        }
        coin.y = 0; coin.x = Math.random() * (canvas.width - 20) + 10; coin.speed += 0.2;
    }
    
    if (coin.y > canvas.height) {
        gameActive = false;
        clearInterval(musicInterval);
        alert("Game Over! You have earned tokens honestly. Check your rank in the Profile tab.");
        startBtn.style.display = "block";
        startBtn.innerText = "Play Again";
        return;
    }
    requestAnimationFrame(updateGame);
}

withdrawBtn.addEventListener("click", () => {
    if (earnedTokens < 1000) {
        alert("Withdraw Error: You do not have the minimum 1,000 tokens required. Play more to earn!");
        return;
    }

    // 🔒 FUTURE FIREBASE CONNECTION JOINS HERE
    
    let uName = prompt("Enter your real name for Sunday Payout:");
    let uUPI = prompt("Enter your Paytm Number or UPI ID:");
    
    if (uName && uUPI) {
        alert("🎉 Request Locked!\nName: " + uName + "\nTokens: " + earnedTokens + "\nThis data is ready to transfer to the Sunday Payout List.");
        earnedTokens = 0; 
        updateProfileAndWallet();
        document.getElementById("coinVal").innerText = earnedTokens;
    }
});
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  // ... बाकी कोड
};
// फायरबेस इनिशियलाइज करने का कोड
firebase.initializeApp(firebaseConfig);
