// Global variables
let playerName;
let playerScores = [];
let virtualScores = [];
let currentRound = 1;
let currentAttempt = 0;
let maxAttempts = 5;
let totalRounds = 5;
let isBonus = false;
let bonusScore = 0;
let playerRoundScores = [];
let virtualRoundScores = [];

// Function to switch stylesheets based on time
function updateColorScheme() {
    const hour = new Date().getHours();
    const stylesheet = document.getElementById('theme-stylesheet');

    if (hour >= 15 && hour < 21) { // Evening (3PM - 9PM)
        stylesheet.href = 'evening.css';
    } else if (hour >= 21 || hour < 6) { // Night (9PM - 6AM)
        stylesheet.href = 'night.css';
    } else {
        // For daytime, fall back to daytime.css
        stylesheet.href = '';
    }
}

// Start game when "Start Game" button is clicked
document.getElementById('startButton').addEventListener('click', startGame);

// Modified DOMContentLoaded to include updateColorScheme
document.addEventListener('DOMContentLoaded', function() {
    // Existing event listener for startButton
    document.getElementById('startButton').addEventListener('click', startGame);
    // Initialize color scheme on page load
    updateColorScheme();
});

// Update color scheme every minute
setInterval(updateColorScheme, 60000);

function startGame() {
    playerName = document.getElementById('nameInput').value;
    if (playerName) {
        document.getElementById('startDiv').style.display = 'none';
        document.getElementById('gameDiv').style.display = 'block';
        startRound(currentRound);
    } else {
        alert('Please enter your name');
    }
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
document.getElementById('throwButton').addEventListener('click', playerThrow);

function playerThrow() {
    if (currentAttempt < maxAttempts) {
        let result = simulateThrow();
        displayThrowResult(playerName, result);
        playerRoundScores.push(result.points);
        currentAttempt++;
        if (currentAttempt === maxAttempts) {
            let maxPoints = Math.max(...playerRoundScores);
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

// Simulate a throw with miss probability
function simulateThrow() {
    if (Math.random() < 0.6) {
        return { landed: false, stair: null, points: 0 };
    } else {
        let stair = Math.floor(Math.random() * 13) + 1;
        let points = calculatePoints(stair);
        return { landed: true, stair: stair, points: points };
    }
}

// Calculate points for a given stair
function calculatePoints(n) {
    return 2 * n - 4;
}

//display throw result

function displayThrowResult(player, result) {
    let resultDiv = document.createElement('p');
    if (!result.landed) {
        let message = player === playerName ? "Your ball" : `${player.split(" ")[0]}'s ball`;
        resultDiv.textContent = `${message} did not land on a stair. (0 points)`;
        const hour = new Date().getHours();
        resultDiv.style.color = (hour >= 15 && hour < 21) ? '#ff6666' : (hour >= 21 || hour < 6) ? '#ff6666' : 'red'; // Theme-specific miss color
    } else {
        resultDiv.textContent = `${player} landed on stair ${result.stair}, points: ${result.points}`;
    }
    document.getElementById('throwResults').appendChild(resultDiv);
}
// Virtual player's turn
function virtualTurn(round) {
    document.getElementById('throwResults').innerHTML = '';
    let virtualName = "The Master of TopStair";
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${virtualName}'s turn`;
    virtualRoundScores = [];
    for (let i = 0; i < maxAttempts; i++) {
        let result = simulateThrow();
        displayThrowResult(virtualName, result);
        virtualRoundScores.push(result.points);
    }
    let maxPoints = Math.max(...virtualRoundScores);
    virtualScores.push(maxPoints);
    document.getElementById('roundSummary').textContent += ` | ${virtualName}'s best score: ${maxPoints}`;
    updateScoreBoard(round);
    if (round < totalRounds) {
        currentRound++;
        setTimeout(() => startRound(currentRound), 2000);
    } else {
        if (playerScores.includes(12)) {
            bonusPlayerTurn();
        } else if (playerScores[playerScores.length - 1] >= 22) {
            bonusPlayerTurn();
        } else {
            endGame();
        }
    }
}

// Update scoreboard after each round
function updateScoreBoard(round) {
    let roundScoresDiv = document.getElementById('roundScores');
    let roundScoreP = document.createElement('p');
    roundScoreP.textContent = `Round ${round}: ${playerName}: ${playerScores[round - 1]}, Master: ${virtualScores[round - 1]}`;
    roundScoresDiv.appendChild(roundScoreP);
}

// Bonus round for player
function bonusPlayerTurn() {
    isBonus = true;
    document.getElementById('roundDisplay').textContent = 'Bonus Round!';
    document.getElementById('throwResults').innerHTML = '';
    document.getElementById('roundSummary').innerHTML = '';
    document.getElementById('throwButton').style.display = 'block';
    currentAttempt = 0;
    playerRoundScores = [];
}

// End game and show results
function endGame() {
    if (isBonus) {
        let bonusP = document.createElement('p');
        bonusP.textContent = `Bonus Round: ${playerName}: ${bonusScore}, Master: N/A`;
        document.getElementById('roundScores').appendChild(bonusP);
    }
    let playerTotal = playerScores.reduce((a, b) => a + b, 0) + (isBonus ? bonusScore : 0);
    let virtualTotal = virtualScores.reduce((a, b) => a + b, 0);
    document.getElementById('gameDiv').style.display = 'none';
    document.getElementById('endDiv').style.display = 'block';
    document.getElementById('playerTotal').textContent = `${playerName}'s total score: ${playerTotal}`;
    document.getElementById('virtualTotal').textContent = `The Master of TopStair's total score: ${virtualTotal}`;
    let winner = playerTotal > virtualTotal ? playerName : (playerTotal < virtualTotal ? 'The Master of TopStair' : 'Tie');
    document.getElementById('winner').textContent = `Winner: ${winner}`;
}