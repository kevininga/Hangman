// Get the canvas element and its context for drawing the hangman
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Data for the game, divided into categories
const categoriesData = {
  countries: ["ALBANIA", "ALGERIA", "BERMUDA", "CANADA", "CHILE", "DENMARK", "ENGLAND", "ECUADOR", "FIJI",  "GERMANY", "HAITI", "MADAGASCAR"],
  food: ["APPLE", "BAGEL", "BURRITO", "CURRY", "DRAGONFRUIT", "HAMBURGER", "LASAGNA", "PIE", "PIZZA", "QUICHE", "RICE", "SALAD"],
  jobs: ["ARCHITECT", "ANIMATOR", "BARISTA", "DOCTOR", "DANCER", "ENGINEER", "TEACHER", "CHEF", "TEACHER", "FIREFIGHTER", "JUDGE", "ORTHODONTIST", "PILOT", "PLUMBER"]
};

// Maximum number of wrong guesses before the game is lost
const maxWrong = 6;

// All possible letters to guess
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let word = ''; // The current word to guess
let mistakes = 0; // The number of wrong guesses made so far
let guessed = []; // The letters that have been guessed so far
let wordStatus = null; // The current status of the word, with underscores for unknown letters
let hintRevealed = false; // Whether a hint has been revealed
let score = 0; // The current score
let highScores = JSON.parse(localStorage.getItem('highScores')) || []; // High scores saved in local storage
let category = categoriesData.countries; // Default category for the game

// Function to open the category selection modal
function selectCategory() {
  const categoryModal = document.getElementById("categoryModal");
  categoryModal.style.display = "block";
  const categoryButtons = document.getElementsByClassName("category-button");
  for (let i = 0; i < categoryButtons.length; i++) {
    categoryButtons[i].addEventListener("click", function () {
      const selectedCategory = this.getAttribute("data-category");
      setCategory(selectedCategory);
      categoryModal.style.display = "none";
    });
  }
}

// Function to set the category based on user's selection
function setCategory(selectedCategory) {
  switch (selectedCategory) {
    case "countries":
      category = categoriesData.countries;
      break;
    case "food":
      category = categoriesData.food;
      break;
    case "jobs":
      category = categoriesData.jobs;
      break;
    default:
      alert("Invalid category");
  }
  reset();
  letters.split('').forEach(letter => document.getElementById(letter).removeAttribute('disabled'));
}

// Drawing functions for the gallows
function drawInitialGameBoard() {
  ctx.lineWidth = "6";
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.rect(310, 290, 180, 1);
  ctx.rect(400, 10, 1, 280);
  ctx.rect(240, 10, 160, 1);
  ctx.rect(240, 10, 1, 30);
  ctx.stroke();
}

// Drawing functions for the hangman
function drawBodyPart() {
  ctx.beginPath();
  switch (mistakes) {
    case 1: ctx.arc(240, 70, 30, 0, Math.PI * 2, true); // Head
      break;
    case 2: ctx.moveTo(240, 100); ctx.lineTo(240, 220); // Body
      break;
    case 3: ctx.moveTo(240, 140); ctx.lineTo(200, 200); // Left Arm
      break;
    case 4: ctx.moveTo(240, 140); ctx.lineTo(280, 200); // Right Arm
      break;
    case 5: ctx.moveTo(240, 215); ctx.lineTo(200, 280); // Left Leg
      break;
    case 6: ctx.moveTo(240, 215); ctx.lineTo(280, 280); // Right Leg
      break;
    default: break;
  }
  ctx.stroke();
}

// Game initialization functions
// Function to randomly select a word from the current category
function randomWordFromCategory() {
  word = category[Math.floor(Math.random() * category.length)];
}

// Function to generate the letter buttons for the game interface
function generateButtons() {
  let buttonsHTML = letters.split('').map(letter => `<button class="letter-button" id='${letter}' onClick="processGuessedLetter('${letter}')" disabled>${letter}</button>`).join('');
  let buttonsContainer = `<div class="keyboard">${buttonsHTML}</div>`;
  document.getElementById('message').innerHTML = buttonsContainer;
}

// Game play functions
// Function to handle keypress events
function processKeyPress(event) {
  if (!category) return; // If no category is selected, don't process key press
  let letter = event.key.toUpperCase();
  if (/^[A-Z]$/.test(letter)) {
    processGuessedLetter(letter);
  }
}

// Function to process a guessed letter
function processGuessedLetter(chosenLetter) {
  if (!category || guessed.includes(chosenLetter)) return; // If no category is selected or letter is already guessed, don't process it
  guessed.push(chosenLetter);
  document.getElementById(chosenLetter).setAttribute('disabled', true);
  if (word.includes(chosenLetter)) {
    updateWordStatus();
    checkIfGameWon();
  } else {
    mistakes++;
    updateMistakes();
    checkIfGameLost();
    drawBodyPart();
  }
  updateGuessedLetters();
}

// Function to update the list of guessed letters
function updateGuessedLetters() {
  const guessedLettersHTML = guessed.map(letter => `<span>${letter}</span>`).join(' ');
  document.getElementById('guessedLetters').innerHTML = guessedLettersHTML;
}

// Function to update the displayed word status
function updateWordStatus() {
  wordStatus = word.split('').map(letter => {
    if (guessed.includes(letter)) {
      return letter;
    } else if (letter === ' ') {
      return '   ';
    } else if (letter === '-') {
      return '-';
    } else {
      return ' _ ';
    }
  }).join('');
  document.getElementById('wordSpotlight').innerHTML = wordStatus;
}

// Function to check if the game has been won
function checkIfGameWon() {
  if (wordStatus === word) {
    score++; // Increase the score
    document.getElementById('score').innerHTML = score; // Update the score display
    document.getElementById('message').innerHTML = 'You Won!!!';
    document.getElementById('hint').setAttribute('disabled', true); // Disable hint button
  }
}

// Function to check if the game has been lost
function checkIfGameLost() {
  if (mistakes !== maxWrong) return;
  document.getElementById('wordSpotlight').innerHTML = `The answer was: ${word}`;
  document.getElementById('message').innerHTML = 'You failed to guess the word in time. Better luck next time!';
  drawBodyPart(); // Draw the right leg before showing the prompt
  document.getElementById('hint').setAttribute('disabled', true); // Disable hint button
  setTimeout(() => {
    let playerName = prompt("Please enter your name for the high score table:");
    highScores.push({ name: playerName.toUpperCase(), score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10); // Only keep the top 10
    localStorage.setItem('highScores', JSON.stringify(highScores)); // Store the scores
    displayHighScores();
    score = 0; // Reset the score
    document.getElementById('score').innerHTML = score; // Update the score display
  }, 250); // Delay the prompt by .5 seconds (500 milliseconds)
}

// Function to display the high scores
function displayHighScores() {
  const highScoresList = highScores
    .map((score, i) => `<tr><td>${i + 1}</td><td>${score.name}</td><td>${score.score}</td></tr>`).join('');
  document.getElementById('highScores').querySelector('tbody').innerHTML = highScoresList;
  // Get the modal
  const modal = document.getElementById("highScoresModal");
  // Get the <span> element that closes the modal
  let span = document.getElementsByClassName("close")[0];
  // Show the modal
  modal.style.display = "block";
  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

// Function to update the number of mistakes displayed
function updateMistakes() {
  document.getElementById('mistakes').innerHTML = mistakes;
}


function revealHint() {
  if (hintRevealed) return;
  let hintIndex;
  const wordLetters = word.split('');
  do {
    hintIndex = Math.floor(Math.random() * wordLetters.length);
  } while (guessed.includes(wordLetters[hintIndex]) || wordLetters[hintIndex] === '-' || wordLetters[hintIndex] === ' ');
  guessed.push(wordLetters[hintIndex]); // Add the hint letter to the guessed array
  updateWordStatus(); // Update the word status
  checkIfGameWon(); // Check if the game is won
  hintRevealed = true;
  document.getElementById('hint').setAttribute('disabled', true);
}

// Reset Function
function reset() {
  selectCategory();
  mistakes = 0;
  guessed = [];
  hintRevealed = false;
  randomWordFromCategory();
  updateWordStatus();
  updateMistakes();
  generateButtons();
  document.getElementById('hint').removeAttribute('disabled'); // Re-enable hint button
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawInitialGameBoard();
}

// Initialization code to run when the page loads
document.addEventListener('DOMContentLoaded', function () {
  drawInitialGameBoard();
  randomWordFromCategory();
  generateButtons();
  updateWordStatus();
  document.getElementById('maxWrong').innerHTML = maxWrong;
  document.getElementById('score').innerHTML = score; // Initialize score display

  // Event Listeners
  selectCategory();
  document.addEventListener('keypress', processKeyPress);
  document.getElementById('hint').addEventListener('click', revealHint);
  document.getElementById('reset').addEventListener('click', reset);
});