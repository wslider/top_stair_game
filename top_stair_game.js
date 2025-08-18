let score = 0;
let points; 

const throwButton = document.getElementById('throwButton');
const scoreBoardScore = document.getElementById('scoreBoardScore');

throwButton.addEventListener('click', () => {
   points = (Math.floor((Math.random() * 13))*2) -4; 
   if (points > 0) {
    score += points;
   }
   else {
    score += 0; 
   }
   scoreBoardScore.textContent= `Player Score: ${score}`; 
})
        
        
