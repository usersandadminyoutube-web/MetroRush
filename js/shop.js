// --- ADVANCED SKINS & PETS CONFIGURATION SYSTEM ---
const SKINS_DATA = {
    default: { name: 'CYBER RUNNER', cost: 0, desc: 'Standard cyber gear built for agile movement.' },
    ninja: { name: 'NEON NINJA', cost: 200, desc: 'Stealth-focused outfit with glowing neon accents.' },
    gold: { name: 'GOLD BOT', cost: 500, desc: 'Luxurious heavy plating built for high-rollers.' },
    shadow: { name: 'SHADOW RUNNER', cost: 1000, desc: 'Elite futuristic runner suit for ultimate speed.' }
};

const PETS_DATA = {
    dragon: { name: 'CYBER DRAGON', cost: 300, desc: 'Loyal futuristic companion that grants bonus multipliers.' },
    tiger: { name: 'NEON TIGER', cost: 300, desc: 'Fierce cybernetic pet that increases coin gathering rate.' }
};

document.addEventListener('DOMContentLoaded', () => {
    const tabSkins = document.getElementById('tab-skins');
    const tabPets = document.getElementById('tab-pets');
    const contentSkins = document.getElementById('shop-skins-content');
    const contentPets = document.getElementById('shop-pets-content');

    if (tabSkins && tabPets) {
        tabSkins.addEventListener('click', () => {
            tabSkins.className = 'flex-1 py-3 rounded-xl font-black text-xs tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transition-all cursor-pointer transform scale-105';
            tabPets.className = 'flex-1 py-3 rounded-xl font-black text-xs tracking-wider text-gray-400 hover:text-white bg-gray-900/40 transition-all cursor-pointer';
            contentSkins.classList.remove('hidden');
            contentPets.classList.add('hidden');
            playSoundEffect('click');
        });

        tabPets.addEventListener('click', () => {
            tabPets.className = 'flex-1 py-3 rounded-xl font-black text-xs tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transition-all cursor-pointer transform scale-105';
            tabSkins.className = 'flex-1 py-3 rounded-xl font-black text-xs tracking-wider text-gray-400 hover:text-white bg-gray-900/40 transition-all cursor-pointer';
            contentPets.classList.remove('hidden');
            contentSkins.classList.add('hidden');
            playSoundEffect('click');
        });
    }

    // Attach click listeners for skins
    Object.keys(SKINS_DATA).forEach(skinKey => {
        const btn = document.getElementById(`btn-skin-${skinKey}`);
        if (btn) {
            btn.addEventListener('click', () => {
                handleSkinAction(skinKey);
                playSoundEffect('purchase');
            });
        }
    });

    // Attach click listeners for pets
    Object.keys(PETS_DATA).forEach(petKey => {
        const btn = document.getElementById(`btn-pet-${petKey}`);
        if (btn) {
            btn.addEventListener('click', () => {
                handlePetAction(petKey);
                playSoundEffect('purchase');
            });
        }
    });

    updateShopButtons();
});

// Update Shop UI elements and buttons dynamically
function updateShopButtons() {
    // Update Skins UI
    Object.keys(SKINS_DATA).forEach(skinKey => {
        const btn = document.getElementById(`btn-skin-${skinKey}`);
        if (!btn) return;

        if (!gameState.unlockedSkins) gameState.unlockedSkins = ['default'];

        if (gameState.equippedSkin === skinKey) {
            btn.innerText = 'EQUIPPED ✨';
            btn.className = 'px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-black text-xs tracking-wider rounded-xl shadow-md shadow-cyan-500/20 cursor-default';
        } else if (gameState.unlockedSkins.includes(skinKey)) {
            btn.innerText = 'EQUIP 🛡️';
            btn.className = 'px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-gray-950 font-black text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer transform hover:scale-105';
        } else {
            const cost = SKINS_DATA[skinKey].cost;
            btn.innerText = `UNLOCK (${cost} 🪙)`;
            btn.className = 'px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs tracking-wider rounded-xl transition-all shadow-md shadow-purple-500/20 cursor-pointer transform hover:scale-105';
        }
    });

    // Update Pets UI
    Object.keys(PETS_DATA).forEach(petKey => {
        const btn = document.getElementById(`btn-pet-${petKey}`);
        if (!btn) return;

        if (!gameState.unlockedPets) gameState.unlockedPets = [];

        if (gameState.equippedPet === petKey) {
            btn.innerText = 'EQUIPPED 🐾';
            btn.className = 'px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-black text-xs tracking-wider rounded-xl shadow-md shadow-cyan-500/20 cursor-default';
        } else if (gameState.unlockedPets.includes(petKey)) {
            btn.innerText = 'EQUIP 🐉';
            btn.className = 'px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-gray-950 font-black text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer transform hover:scale-105';
        } else {
            const cost = PETS_DATA[petKey].cost;
            btn.innerText = `UNLOCK (${cost} 🪙)`;
            btn.className = 'px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs tracking-wider rounded-xl transition-all shadow-md shadow-purple-500/20 cursor-pointer transform hover:scale-105';
        }
    });

    // Update live coin display in shop if available
    const shopCoinsEl = document.getElementById('shop-coin-balance');
    if (shopCoinsEl) {
        shopCoinsEl.innerText = gameState.coins;
    }
}

// Handle Skin Purchase & Equipment Action
function handleSkinAction(skinKey) {
    if (!gameState.unlockedSkins) gameState.unlockedSkins = ['default'];

    if (gameState.unlockedSkins.includes(skinKey)) {
        gameState.equippedSkin = skinKey;
        saveProgress();
    } else {
        const cost = SKINS_DATA[skinKey].cost;
        const isSuperUser = localStorage.getItem('metro_current_user') === '@ruhi_pro';
        
        if (isSuperUser || gameState.coins >= cost) {
            if (!isSuperUser) {
                gameState.coins -= cost;
            }
            gameState.unlockedSkins.push(skinKey);
            gameState.equippedSkin = skinKey;
            saveProgress();
            
            // Apply skin instantly if player instance exists
            if (typeof player !== 'undefined' && player) {
                player.setSkin(skinKey);
            }
        } else {
            showNotification("Not enough coins to unlock this skin!");
        }
    }
    updateShopButtons();
}

// Handle Pet Purchase & Equipment Action
function handlePetAction(petKey) {
    if (!gameState.unlockedPets) gameState.unlockedPets = [];

    if (gameState.unlockedPets.includes(petKey)) {
        gameState.equippedPet = (gameState.equippedPet === petKey) ? null : petKey;
        saveProgress();
    } else {
        const cost = PETS_DATA[petKey].cost;
        const isSuperUser = localStorage.getItem('metro_current_user') === '@ruhi_pro';

        if (isSuperUser || gameState.coins >= cost) {
            if (!isSuperUser) {
                gameState.coins -= cost;
            }
            gameState.unlockedPets.push(petKey);
            gameState.equippedPet = petKey;
            saveProgress();
        } else {
            showNotification("Not enough coins to unlock this pet!");
        }
    }
    updateShopButtons();
}

// Helper for UI Notification Alerts
function showNotification(msg) {
    const notif = document.getElementById('shop-notification');
    if (notif) {
        notif.innerText = msg;
        notif.classList.remove('opacity-0');
        setTimeout(() => {
            notif.classList.add('opacity-0');
        }, 2000);
    }
}

// Optional Sound Handler Wrapper
function playSoundEffect(type) {
    if (typeof sounds !== 'undefined') {
        if (type === 'click' && sounds.playClick) sounds.playClick();
        if (type === 'purchase' && sounds.playCoinSound) sounds.playCoinSound();
    }
}