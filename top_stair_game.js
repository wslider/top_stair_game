/* 
// Constants
const MISS_PROBABILITY = 0.6;
const MAX_STAIRS = 13;
const TOTAL_ROUNDS = 5;
const MAX_ATTEMPTS = 5;
const BONUS_STAIR = 8;
const BONUS_POINTS = 12;
const HIGH_SCORE_THRESHOLD = 22;
const MAX_NAME_LENGTH = 20;

// Game state
let playerName = '';
let playerScores = [];
let virtualScores = [];
let currentRound = 1;
let currentAttempt = 0;
let isBonus = false;
let bonusScore = 0;
let playerRoundScores = [];
let virtualRoundScores = [];

// Function to switch stylesheets based on time
function updateColorScheme() {
    const hour = new Date().getHours();
    const stylesheet = document.getElementById('theme-stylesheet');
    if (!stylesheet) {
        console.warn('Theme stylesheet not found');
        return;
    }
    if (hour >= 17 && hour < 21) { // Evening (5PM - 9PM)
        stylesheet.href = 'evening.css';
    } else if (hour >= 21 || hour < 6) { // Night (9PM - 6AM)
        stylesheet.href = 'night.css';
    } else { // Daytime
        stylesheet.href = 'daytime.css';
    }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error('Start button not found in DOM. Ensure element with id="startButton" exists.');
    }

    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            // Reset game state
            playerName = '';
            playerScores = [];
            virtualScores = [];
            currentRound = 1;
            currentAttempt = 0;
            isBonus = false;
            bonusScore = 0;
            playerRoundScores = [];
            virtualRoundScores = [];
            document.getElementById('nameInput').value = '';
            document.getElementById('endDiv').style.display = 'none';
            document.getElementById('startDiv').style.display = 'block';
            document.getElementById('roundScores').innerHTML = '';
        });
    }

    const throwButton = document.getElementById('throwButton');
    if (throwButton) {
        throwButton.addEventListener('click', playerThrow);
    } else {
        console.warn('Throw button not found in DOM.');
    }

    updateColorScheme();
    setInterval(updateColorScheme, 60000);
});

// Start the game
function startGame() {
    playerName = document.getElementById('nameInput')?.value.trim();
    const errorDiv = document.getElementById('errorMessage');
    
    if (!playerName || playerName.length > MAX_NAME_LENGTH) {
        if (errorDiv) {
            errorDiv.textContent = `Please enter a valid name (1-${MAX_NAME_LENGTH} characters)`;
            errorDiv.setAttribute('role', 'alert');
        }
        return;
    }
    
    document.getElementById('startDiv').style.display = 'none';
    document.getElementById('gameDiv').style.display = 'block';
    document.getElementById('scoreBoard').style.display = 'block';
    if (errorDiv) errorDiv.textContent = '';
    startRound(currentRound);
}

// Start a new round
function startRound(round) {
    currentAttempt = 0;
    playerRoundScores = [];
    document.getElementById('throwResults').innerHTML = '';
    document.getElementById('roundSummary').innerHTML = '';
    document.getElementById('throwButton').style.display = 'block';
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${playerName}'s turn`;
}

// Handle player's throw
function playerThrow() {
    if (currentAttempt < MAX_ATTEMPTS) {
        const result = simulateThrow();
        displayThrowResult(playerName, result);
        playerRoundScores.push(result.points);
        currentAttempt++;
        
        if (currentAttempt === MAX_ATTEMPTS) {
            const maxPoints = Math.max(...playerRoundScores);
            if (!isBonus) {
                playerScores.push(maxPoints);
                document.getElementById('roundSummary').textContent = `Your best score for this round: ${maxPoints}`;
                document.getElementById('throwButton').style.display = 'none';
                setTimeout(() => virtualTurn(currentRound), 2000);
            } else {
                bonusScore = maxPoints;
                document.getElementById('roundSummary').textContent = `Your bonus score: ${maxPoints}`;
                document.getElementById('throwButton').style.display = 'none';
                endGame();
            }
        }
    }
}

// Simulate a throw
function simulateThrow() {
    if (Math.random() < MISS_PROBABILITY) {
        return { landed: false, stair: null, points: 0 };
    }
    const stair = Math.floor(Math.random() * MAX_STAIRS) + 1;
    const points = 2 * stair - 4;
    return { landed: true, stair, points };
}

// Display throw result
function displayThrowResult(player, result) {
    const resultDiv = document.createElement('p');
    if (!result.landed) {
        const message = player === playerName ? 'Your ball' : `${player.split(' ')[0]}'s ball`;
        resultDiv.textContent = `${message} did not land on a stair. (0 points)`;
        resultDiv.className = 'throw-miss';
    } else {
        resultDiv.textContent = `${player} landed on stair ${result.stair}, points: ${result.points}`;
        resultDiv.className = 'throw-success';
    }
    document.getElementById('throwResults').appendChild(resultDiv);
}

// Virtual player's turn
function virtualTurn(round) {
    document.getElementById('throwResults').innerHTML = '';
    const virtualName = 'The Master of TopStair';
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${virtualName}'s turn`;
    virtualRoundScores = [];
    
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const result = simulateThrow();
        displayThrowResult(virtualName, result);
        virtualRoundScores.push(result.points);
    }
    
    const maxPoints = Math.max(...virtualRoundScores);
    virtualScores.push(maxPoints);
    document.getElementById('roundSummary').textContent += ` | ${virtualName}'s best score: ${maxPoints}`;
    updateScoreBoard(round);
    
    if (round < TOTAL_ROUNDS) {
        currentRound++;
        setTimeout(() => startRound(currentRound), 2000);
    } else {
        if (playerScores.includes(BONUS_POINTS) || playerScores[playerScores.length - 1] >= HIGH_SCORE_THRESHOLD) {
            bonusPlayerTurn();
        } else {
            endGame();
        }
    }
}

// Update scoreboard
function updateScoreBoard(round) {
    const roundScoresDiv = document.getElementById('roundScores');
    const roundScoreP = document.createElement('p');
    roundScoreP.textContent = `Round ${round}: ${playerName}: ${playerScores[round - 1]}, Master: ${virtualScores[round - 1]}`;
    roundScoresDiv.appendChild(roundScoreP);
}

// Bonus round for player
function bonusPlayerTurn() {
    isBonus = true;
    document.getElementById('roundDisplay').textContent = `Bonus Round!`;
    document.getElementById('throwResults').innerHTML = '';
    document.getElementById('roundSummary').innerHTML = '';
    document.getElementById('throwButton').style.display = 'block';
    currentAttempt = 0;
    playerRoundScores = [];
}

// End game and show results
function endGame() {
    if (isBonus) {
        const bonusP = document.createElement('p');
        bonusP.textContent = `Bonus Round: ${playerName}: ${bonusScore}, Master: N/A`;
        document.getElementById('roundScores').appendChild(bonusP);
    }
    
    const playerTotal = playerScores.reduce((a, b) => a + b, 0) + (isBonus ? bonusScore : 0);
    const virtualTotal = virtualScores.reduce((a, b) => a + b, 0);
    
    document.getElementById('gameDiv').style.display = 'none';
    document.getElementById('scoreBoard').style.display = 'block';
    document.getElementById('endDiv').style.display = 'block';
    document.getElementById('playerTotal').textContent = `${playerName}'s total score: ${playerTotal}`;
    document.getElementById('virtualTotal').textContent = `The Master of TopStair's total score: ${virtualTotal}`;
    const winner = playerTotal > virtualTotal ? playerName : (playerTotal < virtualTotal ? 'The Master of TopStair' : 'Tie');
    document.getElementById('winner').textContent = `Winner: ${winner}`;
}