// --- ADVANCED PLAYER AUTHENTICATION & PROFILE SYSTEM ---

class AuthManager {
    constructor() {
        this.initAuth();
    }

    initAuth() {
        // Check if player name exists in localStorage, otherwise set default
        if (!localStorage.getItem('mr_player_name')) {
            localStorage.setItem('mr_player_name', 'CYBER_RUNNER');
        }

        // Initialize general player stats if not present
        if (!localStorage.getItem('mr_total_runs')) {
            localStorage.setItem('mr_total_runs', '0');
        }

        if (!localStorage.getItem('mr_high_score')) {
            localStorage.setItem('mr_high_score', '0');
        }

        // Daily login streak initialization
        this.checkDailyStreak();
    }

    // Player Name Get/Set helpers
    getPlayerName() {
        return localStorage.getItem('mr_player_name') || 'CYBER_RUNNER';
    }

    setPlayerName(newName) {
        if (newName && newName.trim().length > 0) {
            const cleanName = newName.trim().substring(0, 15).toUpperCase();
            localStorage.setItem('mr_player_name', cleanName);
            this.updateUI();
            return true;
        }
        return false;
    }

    // Daily streak logic
    checkDailyStreak() {
        const lastLogin = localStorage.getItem('mr_last_login');
        const today = new Date().toDateString();
        
        let streak = parseInt(localStorage.getItem('mr_login_streak')) || 1;

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastLogin === yesterday.toDateString5) {
                streak += 1;
            } else if (lastLogin) {
                streak = 1; // Streak break
            }
            
            localStorage.setItem('mr_last_login', today);
            localStorage.setItem('mr_login_streak', streak.toString());
        }
    }

    // UI Update bindings
    updateUI() {
        const playerNameDisplay = document.getElementById("player-name");
        if (playerNameDisplay) {
            playerNameDisplay.textContent = this.getPlayerName();
        }

        // Agar profile stats dikhane ke liye koi elements hain toh update karein
        const highScoreDisplay = document.getElementById("high-score-display");
        if (highScoreDisplay) {
            highScoreDisplay.textContent = localStorage.getItem('mr_high_score') || '0';
        }
    }
}

// Global Auth Instance
const playerAuth = new AuthManager();

document.addEventListener("DOMContentLoaded", () => {
    playerAuth.updateUI();

    // Agar player name par click karke change karne ka option dena ho
    const playerNameDisplay = document.getElementById("player-name");
    if (playerNameDisplay) {
        playerNameDisplay.style.cursor = 'pointer';
        playerNameDisplay.title = 'Click to change name';
        playerNameDisplay.addEventListener('click', () => {
            const newName = prompt("Enter new Runner Name (Max 15 chars):", playerAuth.getPlayerName());
            if (newName) {
                playerAuth.setPlayerName(newName);
                if (typeof sounds !== 'undefined') sounds.playClickSound();
            }
        });
    }
});