import './style.css'

// json database in browser local storage
// https://github.com/typicode/lowdb
import { LowSync } from 'lowdb'
import { LocalStorage } from 'lowdb/browser'

// csv to json converter
// https://github.com/Keyang/node-csvtojson
import { csv } from "csvtojson";

const csvReader = new csv()
// const adapter = new LocalStorage('db')

let defaultCards = [
  {
      "word": "question1",
      "definition": "answer1",
      "display": 2
  },
  {
      "word": "question2",
      "definition": "answer2",
      "display": 2
  },
  {
      "word": "question3",
      "definition": "answer3",
      "display": 2
  },

]

let defaultCount = {
  "progress": 0,
  "deckSize": 0
}
let completeCards = [];
let levelHard = 3;
let levelNormal = 2;
let levelEasy = 1;
let displayCheckAnswer = 0;
let displayGrading = 1;
let displayMessage = 2;
let displayCard = 3;
let hideStudyDeck = 4;
let displayProgess = 5;
let displayStart = 6;
let i = 0; 

const db = new LowSync(new LocalStorage('db'), defaultCards);
const progressCountDb = new LowSync(new LocalStorage('progressCountDb'), defaultCount);
const completeDb = new LowSync(new LocalStorage('completeDb'), completeCards);
const newDb = new LowSync(new LocalStorage('newDb'), defaultCards);

let deckSize = 0;
let progress = 0;

if (newDb.data === null) {
  newDb.write();
} else {
  newDb.read();
}

if (db.data === null) {
  db.write();
} else {
  db.read();
}

if (completeDb.data == null) {
  completeDb.write();
} else {
  completeDb.read();
}

if (progressCountDb.data == null) {
  // calculate progress from db 
  progressCountDb.data.progress = completeDb.data.length;
  // calculate decksize from db
  progressCountDb.data.deckSize = deckSize;
  progressCountDb.write();
} else {
  progressCountDb.read();
}

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('#main')
  main.style.display = "block";
  const studyButton = main.querySelector('#study');
  const resetButton = main.querySelector('#reset');
  const answerButton = main.querySelector('#answer');
  const hardButton = main.querySelector('#hard');
  const normalButton = main.querySelector('#normal');
  const easyButton = main.querySelector('#easy');
  const fileInput = main.querySelector('#file');
  const resetDeckButton = main.querySelector('#reset-deck');

  displayMainPage();

  fileInput.addEventListener('change', (event) => {
    let file = fileInput.files.item(0)
    
    const reader = new FileReader();
    reader.readAsText(file)
    reader.addEventListener("load", () => {
      csvReader.fromString(reader.result)
        .then( (result) => {
          var newResult = result.map((item) => {
            return {...item, "display": 2};       
          })

          db.data = newResult;          
          db.write();

          // Backup database
          newDb.data = newResult;
          newDb.write();

          // Progress bar for new deck
          deckSize = newResult.length;
          progress = 0;
          completeDb.data = [];
          progressCountDb.data.progress = progress;
          progressCountDb.data.deckSize = deckSize;
          completeDb.write();
          progressCountDb.write(); 
          toggleButtons(displayStart);
          displayMainPage();
        }

        )
    })
  }, false);

  studyButton.addEventListener('click', (event) => {
    start()
  });

  resetButton.addEventListener('click', (event) => {
    resetProgress();
    
  });

  resetDeckButton.addEventListener('click', (event) => {
    resetProgress();
  })

  answerButton.addEventListener('click', (event) => {
    checkAnswer()
  });

  hardButton.addEventListener('click', (event) => {
    moveToHard()
  });

  normalButton.addEventListener('click', (event) => {
    moveToNormal()
  });

  easyButton.addEventListener('click', (event) => {
    moveToEasy()
  });
});



function checkAnswer() {
  document.getElementById("definition").style.display = "block";
  toggleButtons(displayGrading);
}

function moveToHard() {
  setLevel(levelHard, i);
  toggleButtons(displayCheckAnswer);
  nextCard();
}

function moveToNormal() {   
  setLevel(levelNormal, i);
  toggleButtons(displayCheckAnswer);
  nextCard();
}

function moveToEasy() {
  setLevel(levelEasy, i);
  toggleButtons(displayCheckAnswer);
  nextCard();
}

function toggleButtons(state) {
  // reveal definition
  if (state == displayCheckAnswer) {
      document.getElementById("check-answer").style.display = "block";
      document.getElementById("grading").style.display = "none";
  } else if (state == displayGrading) {
      document.getElementById("check-answer").style.display = "none";
      document.getElementById("grading").style.display = "block";
  } else if (state == displayMessage) {
      document.getElementById("check-answer").style.display = "none";
      document.getElementById("grading").style.display = "none"; 
      //document.getElementById("card").style.visibility = "hidden";
      document.getElementById("word").style.display = "none";
      document.getElementById("definition").style.display = "none";
      document.getElementById("message").style.display = "block";  
      document.getElementById("progress-bar").style.display = "flex";    
  } else if (state == displayCard) {
      document.getElementById("card").style.visibility = "visible";
  } else if (state == hideStudyDeck) {
      document.getElementById("study-deck").style.display = "none";
  } else if (state == displayProgess) {
      document.getElementById("progress-bar").style.display = "flex"; 
  } else if (state == displayStart) {
      document.getElementById("progress-bar").style.display = "none";
      document.getElementById("message").style.display = "none";
      document.getElementById("card").style.visibility = "visible";
      document.getElementById("study-deck").style.display = "block";
      document.getElementById("word").style.display = "none";
      document.getElementById("definition").style.definition = "none";
      document.getElementById("check-answer").style.display = "none";
      document.getElementById("grading").style.display = "none"; 
  }

}

function setLevel(level, element) {
  if (level == levelHard) {
      db.data[element].display = db.data[element].display + 1;
  }

  if (level == levelNormal) {
      db.data[element].display = db.data[element].display - 1;
  }

  if (level == levelEasy) {
      db.data[element].display = db.data[element].display - 2;
      if (db.data[element].display <= 0) {
          moveToComplete(element);
          progress = progress + 1;
      }       
  }
  db.write();
}

function moveToComplete(element) {   
  let completed = db.data.splice(element, 1);
  completeDb.data.push(completed[0]);
  completeDb.write();
  progressCountDb.data.progress = completeDb.data.length;
  progressCountDb.write();
}

function resetProgress() {
  // reset deck
  newDb.read();
  db.data = newDb.data;
  db.write();
  // reset completedb
  completeDb.data = [];
  completeDb.write();
  // reset progress count
  progressCountDb.data.progress = 0;
  // reset deck Size
  progressCountDb.data.deckSize = newDb.data.length;
  progressCountDb.write();
  document.getElementById("progress-no").innerText = progressCountDb.data.progress;
  document.getElementById("deck-size").innerText = progressCountDb.data.deckSize;
  toggleButtons(displayStart);
  displayMainPage();
}

function start() {
  toggleButtons(displayProgess); 
  db.read();
  nextCard();
}

function displayMainPage() {
  progressCountDb.read();
  if (progressCountDb.data.progress == 0) {
    // start
    document.getElementById("instruction").innerHTML = "Click start to study.";
    document.getElementById("study").innerHTML = "Start";
    document.getElementById("reset-deck").style.display = "none";
  } else if (progressCountDb.data.progress > 0 && progressCountDb.data.progress < progressCountDb.data.deckSize) {
    // continue
    document.getElementById("instruction").innerHTML = "Click continue to study.";
    document.getElementById("study").innerHTML = "Continue";
    document.getElementById("reset-deck").style.display = "block";
  }
};

function nextCard() {
  db.read();
  if (db.data.length > 0) {
      //i = db.data.length - 1; // get the last element of the array

      // get random element of the array
      const random = Math.floor(Math.random() * db.data.length);
      i = random;
      document.getElementById("word").innerHTML = db.data[i].word;
      document.getElementById("definition").innerHTML = db.data[i].definition;
      document.getElementById("word").style.display = "block";
      document.getElementById("definition").style.display = "none"; 

      toggleButtons(displayCheckAnswer);
      toggleButtons(displayCard);
      toggleButtons(hideStudyDeck);
      
  } else {
      // Finished the whole deck
      toggleButtons(displayMessage);
  }
  document.getElementById("progress-no").innerText = progressCountDb.data.progress;
  document.getElementById("deck-size").innerText = progressCountDb.data.deckSize;
}




