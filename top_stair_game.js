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

// Start game when "Start Game" button is clicked
document.getElementById('startButton').addEventListener('click', startGame);

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
    isBonus = false;
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${playerName}'s turn`;
    document.getElementById('throwResults').innerHTML = '';
    document.getElementById('roundSummary').innerHTML = '';
    document.getElementById('throwButton').style.display = 'block';
}

// Handle player's throw
document.getElementById('throwButton').addEventListener('click', playerThrow);

function playerThrow() {
    if (currentAttempt < maxAttempts) {
        let n = Math.floor(Math.random() * 13) + 1; // Random stair from 1 to 13
        let points = calculatePoints(n);
        displayThrowResult(playerName, n, points);
        currentAttempt++;
        if (currentAttempt === maxAttempts) {
            let maxPoints = getMaxScore(playerName);
            if (!isBonus) {
                playerScores.push(maxPoints);
                document.getElementById('roundSummary').textContent = `Your best score for this round: ${maxPoints}`;
                document.getElementById('throwButton').style.display = 'none';
                setTimeout(() => virtualTurn(currentRound), 2000); // Wait before virtual turn
            } else {
                bonusScore = maxPoints;
                document.getElementById('roundSummary').textContent = `Your bonus score: ${maxPoints}`;
                document.getElementById('throwButton').style.display = 'none';
                endGame();
            }
        }
    }
}

// Calculate points for a given stair
function calculatePoints(n) {
    return 2 * n - 4;
}

// Display throw result
function displayThrowResult(player, n, points) {
    let resultDiv = document.createElement('p');
    resultDiv.textContent = `${player} landed on stair ${n}, points: ${points}`;
    document.getElementById('throwResults').appendChild(resultDiv);
}

// Get max score for current round
function getMaxScore(player) {
    let throws = Array.from(document.getElementById('throwResults').children);
    let scores = throws.map(el => parseInt(el.textContent.split('points: ')[1]));
    return Math.max(...scores);
}

// Virtual player's turn
function virtualTurn(round) {
    let virtualName = "The Master of TopStair";
    document.getElementById('roundDisplay').textContent = `Round ${round}, ${virtualName}'s turn`;
    let virtualThrows = [];
    for (let i = 0; i < maxAttempts; i++) {
        let n = Math.floor(Math.random() * 13) + 1;
        let points = calculatePoints(n);
        displayThrowResult(virtualName, n, points);
        virtualThrows.push(points);
    }
    let maxPoints = Math.max(...virtualThrows);
    virtualScores.push(maxPoints);
    document.getElementById('roundSummary').textContent += ` | ${virtualName}'s best score: ${maxPoints}`;
    if (round < totalRounds) {
        currentRound++;
        setTimeout(() => startRound(currentRound), 2000); // Wait before next round
    } else {
        if (playerScores[playerScores.length - 1] >= 20) {
            bonusPlayerTurn();
        } else {
            endGame();
        }
    }
}

// Bonus round for player
function bonusPlayerTurn() {
    isBonus = true;
    document.getElementById('roundDisplay').textContent = 'Bonus Round!';
    document.getElementById('throwResults').innerHTML = '';
    document.getElementById('roundSummary').innerHTML = '';
    document.getElementById('throwButton').style.display = 'block';
    currentAttempt = 0;
}

// End game and show results
function endGame() {
    document.getElementById('gameDiv').style.display = 'none';
    document.getElementById('endDiv').style.display = 'block';
    let playerTotal = playerScores.reduce((a, b) => a + b, 0) + bonusScore;
    let virtualTotal = virtualScores.reduce((a, b) => a + b, 0);
    document.getElementById('playerTotal').textContent = `${playerName}'s total score: ${playerTotal}`;
    document.getElementById('virtualTotal').textContent = `The Master of TopStair's total score: ${virtualTotal}`;
    let winner = playerTotal > virtualTotal ? playerName : (playerTotal < virtualTotal ? 'The Master of TopStair' : 'Tie');
    document.getElementById('winner').textContent = `Winner: ${winner}`;
}