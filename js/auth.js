// auth.js - Player Authentication & LocalStorage Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Check if player name exists in localStorage, otherwise set default
    if (!localStorage.getItem('mr_player_name')) {
        localStorage.setItem('mr_player_name', 'CYBER_RUNNER');
    }
    
    // Player name display update
    const playerNameDisplay = document.getElementById("player-name");
    if (playerNameDisplay) {
        playerNameDisplay.textContent = localStorage.getItem('mr_player_name');
    }
});