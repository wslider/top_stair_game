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
let xpPoint = 0;
let currentLocation;

// Locations with unique mechanics
const locations = [
    { name: 'Gaurab House', missProbability: 0.7, maxStairs: 13, pointMultiplier: 2, description: 'Distractions increase miss chance.' },
    { name: 'The Moon', missProbability: 0.65, maxStairs: 20, pointMultiplier: 2, description: 'Lower gravity allows higher throws.' },
    { name: 'Mammoth Cave', missProbability: 0.6, maxStairs: 13, pointMultiplier: 2, monsterChance: 0.1, description: 'Cave monsters may interfere.' },
    { name: 'Iceland', missProbability: 0.6, maxStairs: 13, pointMultiplier: 1.5, description: 'Icy stairs reduce points.' }
];

// Theme update based on time of day
function updateColorScheme() {
    const hour = new Date().getHours();
    document.documentElement.className = 
        (hour >= 17 && hour < 21) ? 'evening' : 
        (hour >= 21 || hour < 6) ? 'night' : 'daytime';
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error('Start button not found in DOM');
    }
    updateColorScheme();
    setInterval(updateColorScheme, 60000);
    populateLocationSelect();
});

// Populate location dropdown
function populateLocationSelect() {
    const select = document.getElementById('locationSelect');
    if (select) {
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.name;
            option.textContent = `${location.name} - ${location.description}`;
            select.appendChild(option);
        });
    }
}

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
    
    const selectedLocation = document.getElementById('locationSelect')?.value;
    currentLocation = locations.find(loc => loc.name === selectedLocation) || locations[0];
    
    document.getElementById('startDiv').style.display = 'none';
    document.getElementById('gameDiv').style.display = 'block';
    document.getElementById('errorMessage').textContent = '';
    startRound(currentRound);
}

// Start a new round
function startRound(round) {
    currentAttempt = 0;
    playerRoundScores = [];
    document.getElementById('throwResults').innerHTML = '';
    document.getElementById('roundSummary').innerHTML = '';
    document.getElementById('throwButton').style.display = 'block';
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${playerName}'s turn at ${current locatieon.name}`;
    document.getElementById('xpDisplay').textContent = `XP: ${xpPoint}`;
}

// Handle player's throw
document.getElementById('throwButton')?.addEventListener('click', playerThrow);

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

// Simulate a throw based on location
function simulateThrow() {
    if (Math.random() < (currentLocation.monsterChance || 0) || Math.random() < currentLocation.missProbability) {
        return { landed: false, stair: null, points: 0 };
    }
    const stair = Math.floor(Math.random() * currentLocation.maxStairs) + 1;
    const points = currentLocation.pointMultiplier * stair - 4;
    if (stair === BONUS_STAIR) xpPoint += 10;
    if (points >= HIGH_SCORE_THRESHOLD) xpPoint += 15;
    return { landed: true, stair, points };
}

// Calculate points for a given stair
function calculatePoints(stair) {
    return currentLocation.pointMultiplier * stair - 4;
}

// Display throw result
function displayThrowResult(player, result) {
    const resultDiv = document.createElement('p');
    resultDiv.className = result.landed ? 'throw-success' : 'throw-miss';
    if (!result.landed) {
        const message = player === playerName ? 'Your ball' : `${player.split(' ')[0]}'s ball`;
        resultDiv.textContent = `${message} did not land on a stair. (0 points)`;
    } else {
        resultDiv.textContent = `${player} landed on stair ${result.stair}, points: ${result.points}`;
    }
    document.getElementById('throwResults').appendChild(resultDiv);
}

// Virtual player's turn
function virtualTurn(round) {
    document.getElementById('throwResults').innerHTML = '';
    const virtualName = 'The Master of TopStair';
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${virtualName}'s turn at ${currentLocation.name}`;
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
    document.getElementById('roundDisplay').textContent = `Bonus Round at ${currentLocation.name}!`;
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
    
    // Save high score
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    highScores.push({ name: playerName, score: playerTotal, location: currentLocation.name, date: new Date().toISOString() });
    localStorage.setItem('highScores', JSON.stringify(highScores));
    
    document.getElementById('gameDiv').style.display = 'none';
    document.getElementById('endDiv').style.display = 'block';
    document.getElementById('playerTotal').textContent = `${playerName}'s total score: ${playerTotal} (XP: ${xpPoint})`;
    document.getElementById('virtualTotal').textContent = `The Master of TopStair's total score: ${virtualTotal}`;
    const winner = playerTotal > virtualTotal ? playerName : (playerTotal < virtualTotal ? 'The Master of TopStair' : 'Tie');
    document.getElementById('winner').textContent = `Winner: ${winner}`;
    
    displayHighScores();
}

// Display high scores
function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    const highScoresDiv = document.getElementById('highScores');
    highScoresDiv.innerHTML = '<h3>High Scores</h3>';
    highScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .forEach(score => {
            const scoreP = document.createElement('p');
            scoreP.textContent = `${score.name}: ${score.score} (${score.location}, ${new Date(score.date).toLocaleDateString()})`;
            highScoresDiv.appendChild(scoreP);
        });
}