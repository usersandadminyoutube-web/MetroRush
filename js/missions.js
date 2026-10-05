// --- ADVANCED MISSIONS & ACHIEVEMENTS SYSTEM ---
class MissionSystem {
    constructor() {
        this.missionsList = [
            { id: 1, title: "Collect 30 Coins", type: "coins", target: 30, progress: parseInt(localStorage.getItem('mr_m1_prog')) || 0, reward: 200, claimed: localStorage.getItem('mr_m1_claimed') === 'true' },
            { id: 2, title: "Reach Score 500", type: "score", target: 500, progress: parseInt(localStorage.getItem('mr_m2_prog')) || 0, reward: 350, claimed: localStorage.getItem('mr_m2_claimed') === 'true' },
            { id: 3, title: "Collect 100 Coins", type: "coins", target: 100, progress: parseInt(localStorage.getItem('mr_m3_prog')) || 0, reward: 500, claimed: localStorage.getItem('mr_m3_claimed') === 'true' }
        ];
        this.activeMissionIndex = parseInt(localStorage.getItem('mr_active_mission')) || 0;
    }

    save() {
        const m = this.missionsList[this.activeMissionIndex];
        localStorage.setItem(`mr_m${m.id}_prog`, m.progress);
        localStorage.setItem(`mr_m${m.id}_claimed`, m.claimed);
        localStorage.setItem('mr_active_mission', this.activeMissionIndex);
    }

    addProgress(amount, type = "coins") {
        let currentMission = this.missionsList[this.activeMissionIndex];
        if (!currentMission.claimed && currentMission.type === type) {
            currentMission.progress += amount;
            if (currentMission.progress > currentMission.target) {
                currentMission.progress = currentMission.target;
            }
            this.save();
            this.updateUI();
        }
    }

    claimReward() {
        let currentMission = this.missionsList[this.activeMissionIndex];
        if (!currentMission.claimed && currentMission.progress >= currentMission.target) {
            gameState.coins += currentMission.reward;
            currentMission.claimed = true;
            this.save();
            
            if (typeof sounds !== 'undefined') sounds.playCoinSound();
            saveProgress();

            // Agla mission activate karein agar available ho
            if (this.activeMissionIndex < this.missionsList.length - 1) {
                this.activeMissionIndex++;
                this.save();
            }
            
            this.updateUI();
            return true;
        }
        return false;
    }

    updateUI() {
        const missionText = document.getElementById('mission-desc');
        const missionBtn = document.getElementById('btn-claim-mission');
        
        let currentMission = this.missionsList[this.activeMissionIndex];

        if (missionText) {
            missionText.innerText = `${currentMission.title} (Progress: ${currentMission.progress}/${currentMission.target})`;
        }
        
        if (missionBtn) {
            if (currentMission.claimed) {
                missionBtn.innerText = "Completed!";
                missionBtn.disabled = true;
            } else if (currentMission.progress >= currentMission.target) {
                missionBtn.innerText = `Claim ${currentMission.reward} Coins!`;
                missionBtn.disabled = false;
            } else {
                missionBtn.innerText = "In Progress";
                missionBtn.disabled = true;
            }
        }
    }
}

const missions = new MissionSystem();