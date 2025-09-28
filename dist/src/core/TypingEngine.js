export class TypingEngine {
    constructor(text) {
        this.text = '';
        this.currentPosition = 0;
        this.startTime = 0;
        this.keystrokes = [];
        this.errors = 0;
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.isStarted = false;
        this.isFinished = false;
        this.text = text;
        this.reset();
    }
    reset() {
        this.currentPosition = 0;
        this.startTime = 0;
        this.keystrokes = [];
        this.errors = 0;
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.isStarted = false;
        this.isFinished = false;
    }
    processKeystroke(key) {
        if (this.isFinished)
            return false;
        if (!this.isStarted) {
            this.startTime = Date.now();
            this.isStarted = true;
        }
        const timestamp = Date.now();
        const expectedChar = this.text[this.currentPosition];
        const isCorrect = key === expectedChar;
        // Handle special keys
        if (key === 'Backspace') {
            if (this.currentPosition > 0) {
                this.currentPosition--;
                // Remove last keystroke if it was incorrect
                if (this.keystrokes.length > 0 && this.keystrokes[this.keystrokes.length - 1].position === this.currentPosition) {
                    this.keystrokes.pop();
                }
            }
            return true;
        }
        // Skip non-printable keys
        if (key.length > 1 && key !== 'Space' && key !== 'Enter') {
            return false;
        }
        // Convert special keys
        if (key === 'Space')
            key = ' ';
        if (key === 'Enter')
            key = '\n';
        // Record keystroke
        this.keystrokes.push({
            key,
            timestamp,
            correct: isCorrect,
            position: this.currentPosition,
        });
        if (isCorrect) {
            this.currentPosition++;
            this.currentStreak++;
            this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
        }
        else {
            this.errors++;
            this.currentStreak = 0;
        }
        // Check if test is finished
        if (this.currentPosition >= this.text.length) {
            this.isFinished = true;
        }
        return isCorrect;
    }
    getCurrentMetrics() {
        const timeElapsed = this.isStarted ? (Date.now() - this.startTime) / 1000 : 0;
        const charactersTyped = this.keystrokes.filter(k => k.correct).length;
        const wordsTyped = charactersTyped / 5; // Standard word length
        const wpm = timeElapsed > 0 ? (wordsTyped / timeElapsed) * 60 : 0;
        const cpm = timeElapsed > 0 ? (charactersTyped / timeElapsed) * 60 : 0;
        const accuracy = this.keystrokes.length > 0 ? (charactersTyped / this.keystrokes.length) * 100 : 100;
        // Calculate consistency (standard deviation of WPM over time intervals)
        const consistency = this.calculateConsistency();
        return {
            wpm: Math.round(wpm * 100) / 100,
            cpm: Math.round(cpm * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100,
            consistency,
            streak: this.currentStreak,
            longestStreak: this.longestStreak,
            errorsCount: this.errors,
            timeElapsed,
        };
    }
    calculateConsistency() {
        if (this.keystrokes.length < 10)
            return 100;
        // Calculate WPM for each 5-second interval
        const intervals = [];
        const intervalDuration = 5000; // 5 seconds
        for (let i = 0; i < this.keystrokes.length; i += 10) {
            const intervalKeystrokes = this.keystrokes.slice(i, i + 10);
            if (intervalKeystrokes.length === 0)
                continue;
            const startTime = intervalKeystrokes[0].timestamp;
            const endTime = intervalKeystrokes[intervalKeystrokes.length - 1].timestamp;
            const timeSpan = (endTime - startTime) / 1000;
            if (timeSpan > 0) {
                const correctChars = intervalKeystrokes.filter(k => k.correct).length;
                const wpm = (correctChars / 5 / timeSpan) * 60;
                intervals.push(wpm);
            }
        }
        if (intervals.length < 2)
            return 100;
        // Calculate standard deviation
        const mean = intervals.reduce((sum, wpm) => sum + wpm, 0) / intervals.length;
        const variance = intervals.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        // Convert to consistency percentage (lower std dev = higher consistency)
        const consistency = Math.max(0, 100 - stdDev);
        return Math.round(consistency * 100) / 100;
    }
    getProgress() {
        return this.text.length > 0 ? (this.currentPosition / this.text.length) * 100 : 0;
    }
    getCurrentPosition() {
        return this.currentPosition;
    }
    getText() {
        return this.text;
    }
    getTypedText() {
        return this.text.substring(0, this.currentPosition);
    }
    getRemainingText() {
        return this.text.substring(this.currentPosition);
    }
    isTestFinished() {
        return this.isFinished;
    }
    isTestStarted() {
        return this.isStarted;
    }
    getReplayData() {
        return {
            keystrokes: [...this.keystrokes],
            text: this.text,
            startTime: this.startTime,
            endTime: this.isFinished ? Date.now() : this.startTime,
        };
    }
    getCharacterAtPosition(position) {
        if (position < 0 || position >= this.text.length) {
            return { char: '', status: 'untyped' };
        }
        const char = this.text[position];
        if (position === this.currentPosition) {
            return { char, status: 'cursor' };
        }
        if (position < this.currentPosition) {
            // Find the keystroke for this position
            const keystroke = this.keystrokes.find(k => k.position === position);
            if (keystroke) {
                return { char, status: keystroke.correct ? 'correct' : 'incorrect' };
            }
            return { char, status: 'correct' }; // Default to correct if no keystroke found
        }
        return { char, status: 'untyped' };
    }
}
