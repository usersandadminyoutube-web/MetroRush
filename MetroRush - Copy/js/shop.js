// --- SKINS & PETS CONFIGURATION ---
const SKINS_DATA = {
    default: { name: 'CYBER RUNNER', cost: 0 },
    ninja: { name: 'NEON NINJA', cost: 200 },
    gold: { name: 'GOLD BOT', cost: 500 },
    shadow: { name: 'SHADOW RUNNER', cost: 1000 }
};

const PETS_DATA = {
    dragon: { name: 'CYBER DRAGON', cost: 300 },
    tiger: { name: 'NEON TIGER', cost: 300 }
};

document.addEventListener('DOMContentLoaded', () => {
    const tabSkins = document.getElementById('tab-skins');
    const tabPets = document.getElementById('tab-pets');
    const contentSkins = document.getElementById('shop-skins-content');
    const contentPets = document.getElementById('shop-pets-content');

    if (tabSkins && tabPets) {
        tabSkins.addEventListener('click', () => {
            tabSkins.className = 'flex-1 py-2 rounded-lg font-black text-sm bg-purple-500 text-gray-950 transition cursor-pointer';
            tabPets.className = 'flex-1 py-2 rounded-lg font-black text-sm text-gray-400 hover:text-white transition cursor-pointer';
            contentSkins.classList.remove('hidden');
            contentPets.classList.add('hidden');
        });

        tabPets.addEventListener('click', () => {
            tabPets.className = 'flex-1 py-2 rounded-lg font-black text-sm bg-purple-500 text-gray-950 transition cursor-pointer';
            tabSkins.className = 'flex-1 py-2 rounded-lg font-black text-sm text-gray-400 hover:text-white transition cursor-pointer';
            contentPets.classList.remove('hidden');
            contentSkins.classList.add('hidden');
        });
    }

    document.getElementById('btn-skin-default')?.addEventListener('click', () => handleSkinAction('default'));
    document.getElementById('btn-skin-ninja')?.addEventListener('click', () => handleSkinAction('ninja'));
    document.getElementById('btn-skin-gold')?.addEventListener('click', () => handleSkinAction('gold'));
    document.getElementById('btn-skin-shadow')?.addEventListener('click', () => handleSkinAction('shadow'));

    document.getElementById('btn-pet-dragon')?.addEventListener('click', () => handlePetAction('dragon'));
    document.getElementById('btn-pet-tiger')?.addEventListener('click', () => handlePetAction('tiger'));
});

function updateShopButtons() {
    Object.keys(SKINS_DATA).forEach(skinKey => {
        const btn = document.getElementById(`btn-skin-${skinKey}`);
        if (!btn) return;

        if (gameState.equippedSkin === skinKey) {
            btn.innerText = 'EQUIPPED';
            btn.className = 'px-4 py-2 bg-cyan-500 text-gray-950 font-black text-xs rounded-lg cursor-default';
        } else if (gameState.unlockedSkins && gameState.unlockedSkins.includes(skinKey)) {
            btn.innerText = 'EQUIP';
            btn.className = 'px-4 py-2 bg-green-500 hover:bg-green-400 text-gray-950 font-black text-xs rounded-lg transition cursor-pointer';
        } else {
            btn.innerText = `BUY (${SKINS_DATA[skinKey].cost} 🪙)`;
            btn.className = 'px-4 py-2 bg-purple-500 hover:bg-purple-400 text-gray-950 font-black text-xs rounded-lg transition cursor-pointer';
        }
    });

    Object.keys(PETS_DATA).forEach(petKey => {
        const btn = document.getElementById(`btn-pet-${petKey}`);
        if (!btn) return;

        if (!gameState.unlockedPets) gameState.unlockedPets = [];

        if (gameState.equippedPet === petKey) {
            btn.innerText = 'EQUIPPED';
            btn.className = 'px-4 py-2 bg-cyan-500 text-gray-950 font-black text-xs rounded-lg cursor-default';
        } else if (gameState.unlockedPets.includes(petKey)) {
            btn.innerText = 'EQUIP';
            btn.className = 'px-4 py-2 bg-green-500 hover:bg-green-400 text-gray-950 font-black text-xs rounded-lg transition cursor-pointer';
        } else {
            btn.innerText = `BUY (${PETS_DATA[petKey].cost} 🪙)`;
            btn.className = 'px-4 py-2 bg-purple-500 hover:bg-purple-400 text-gray-950 font-black text-xs rounded-lg transition cursor-pointer';
        }
    });
}

function handleSkinAction(skinKey) {
    if (!gameState.unlockedSkins) gameState.unlockedSkins = ['default'];

    if (gameState.unlockedSkins.includes(skinKey)) {
        gameState.equippedSkin = skinKey;
        saveProgress();
    } else {
        const cost = SKINS_DATA[skinKey].cost;
        if (localStorage.getItem('metro_current_user') === '@ruhi_pro' || gameState.coins >= cost) {
            if (localStorage.getItem('metro_current_user') !== '@ruhi_pro') {
                gameState.coins -= cost;
            }
            gameState.unlockedSkins.push(skinKey);
            gameState.equippedSkin = skinKey;
            saveProgress();
        }
    }
}

function handlePetAction(petKey) {
    if (!gameState.unlockedPets) gameState.unlockedPets = [];

    if (gameState.unlockedPets.includes(petKey)) {
        gameState.equippedPet = (gameState.equippedPet === petKey) ? null : petKey;
        saveProgress();
    } else {
        const cost = PETS_DATA[petKey].cost;
        if (localStorage.getItem('metro_current_user') === '@ruhi_pro' || gameState.coins >= cost) {
            if (localStorage.getItem('metro_current_user') !== '@ruhi_pro') {
                gameState.coins -= cost;
            }
            gameState.unlockedPets.push(petKey);
            gameState.equippedPet = petKey;
            saveProgress();
        }
    }
}