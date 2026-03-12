const Scoring = {
    init(gameId, scoreDisplayElement, resetButtonElement) {
        this.gameId = gameId;
        this.scoreKey = `${gameId}Score`;
        this.scoreDisplay = scoreDisplayElement;
        this.resetButton = resetButtonElement;
        
        this.score = Storage.get(this.scoreKey, 0);
        this.updateDisplay();
        
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.reset());
        }
    },

    add(points) {
        this.score += points;
        Storage.set(this.scoreKey, this.score);
        this.updateDisplay();
    },

    reset() {
        if (confirm('Are you sure you want to reset your score?')) {
            this.score = 0;
            Storage.set(this.scoreKey, 0);
            this.updateDisplay();
        }
    },

    updateDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = this.score;
        }
    },

    getScore() {
        return this.score;
    }
};
