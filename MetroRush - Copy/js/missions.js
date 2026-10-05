// --- MISSIONS & REWARDS SYSTEM ---
class MissionSystem {
    constructor() {
        this.target = parseInt(localStorage.getItem('mr_mission_target')) || 30;
        this.progress = parseInt(localStorage.getItem('mr_mission_progress')) || 0;
        this.claimed = localStorage.getItem('mr_mission_claimed') === 'true';
    }

    save() {
        localStorage.setItem('mr_mission_target', this.target);
        localStorage.setItem('mr_mission_progress', this.progress);
        localStorage.setItem('mr_mission_claimed', this.claimed);
    }

    addProgress(amount) {
        if (!this.claimed && this.progress < this.target) {
            this.progress += amount;
            if (this.progress > this.target) {
                this.progress = this.target;
            }
            this.save();
        }
    }

    claimReward() {
        if (!this.claimed && this.progress >= this.target) {
            gameState.coins += 200;
            this.claimed = true;
            this.save();
            if (typeof sounds !== 'undefined') sounds.playCoinSound();
            saveProgress();
            return true;
        }
        return false;
    }

    updateUI() {
        const missionText = document.getElementById('mission-desc');
        const missionBtn = document.getElementById('btn-claim-mission');
        if (missionText) {
            missionText.innerText = `Collect ${this.target} Coins (Progress: ${this.progress}/${this.target})`;
        }
        if (missionBtn) {
            if (this.claimed) {
                missionBtn.innerText = "Claimed!";
                missionBtn.disabled = true;
            } else if (this.progress >= this.target) {
                missionBtn.innerText = "Claim 200 Coins!";
                missionBtn.disabled = false;
            } else {
                missionBtn.innerText = "In Progress";
                missionBtn.disabled = true;
            }
        }
    }
}

const missions = new MissionSystem();