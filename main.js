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
      "word": "toat",
      "definition": "kg ma layy",
      "display": 2
  },
  {
      "word": "tout tout",
      "definition": "phoe gyi",
      "display": 2
  },
  {
      "word": "pekie",
      "definition": "toat akg",
      "display": 2
  },
  // {
  //     "word": "kyg mll",
  //     "definition": "tha ngl chinn",
  //     "display": 2
  // },
  // {
  //     "word": "nono",
  //     "definition": "myak hnr cho",
  //     "display": 2
  // },
  // {
  //     "word": "pekie akg thayy",
  //     "definition": "lgg gasrr kg",
  //     "display": 2
  // }
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


  fileInput.addEventListener('change', (event) => {
   
    console.log("csv uploaded")
    let file = fileInput.files.item(0)
    
    const reader = new FileReader();
    reader.readAsText(file)
    reader.addEventListener("load", () => {
      // console.log(reader.result)
      csvReader.fromString(reader.result)
        .then( (result) => {
          // console.log(result)
          var newResult = result.map((item) => {
            return {...item, "display": 2};       
          })

          console.log(newResult);
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
          
        }

        )
    })
  }, false);

  studyButton.addEventListener('click', (event) => {
    start()
  });

  resetButton.addEventListener('click', (event) => {
    console.log('reset')
    resetProgress();
  });

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
  //console.log("check answer");
  document.getElementById("definition").style.visibility = "visible";
  toggleButtons(displayGrading);
}

function moveToHard() {
  //console.log("hard");
  setLevel(levelHard, i);
  toggleButtons(displayCheckAnswer);
  nextCard();
}

function moveToNormal() {
  //console.log("normal");    
  setLevel(levelNormal, i);
  toggleButtons(displayCheckAnswer);
  nextCard();
}

function moveToEasy() {
  //console.log("easy");
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
      document.getElementById("progress-bar").style.display = "none";    
  } else if (state == displayCard) {
      document.getElementById("card").style.visibility = "visible";
  } else if (state == hideStudyDeck) {
      document.getElementById("study-deck").style.display = "none";
  } else if (state == displayProgess) {
    document.getElementById("progress-bar").style.display = "flex"; 
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
  console.log("db.data:");
  console.log(db.data);
}

function moveToComplete(element) {   
  //console.log("moveToComplete");
  let completed = db.data.splice(element, 1);
  completeDb.data.push(completed[0]);
  completeDb.write();
  progressCountDb.data.progress = completeDb.data.length;
  progressCountDb.write();
  console.log("completeDb.data:");
  console.log(completeDb.data);
}

function resetProgress() {
  // reset deck
  newDb.read();
  console.log("newdb after read:")
  console.log(newDb.data);
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
}

function start() {
  toggleButtons(displayProgess);
  db.read();
  nextCard();
}

function nextCard() {
  
  if (db.data.length > 0) {
    console.log("here");
      //i = db.data.length - 1; // get the last element of the array

      // get random element of the array
      const random = Math.floor(Math.random() * db.data.length);
      i = random;
      //console.log(`random: ${i}`);
      console.log(db.data[i].word);
      document.getElementById("word").innerHTML = db.data[i].word;
      document.getElementById("definition").innerHTML = db.data[i].definition;
      document.getElementById("word").style.visibility = "visible";
      document.getElementById("definition").style.visibility = "hidden"; 
      document.getElementById("progress-no").innerText = progressCountDb.data.progress;
      document.getElementById("deck-size").innerText = progressCountDb.data.deckSize;
      toggleButtons(displayCheckAnswer);
      toggleButtons(displayCard);
      toggleButtons(hideStudyDeck);
      
  } else {
      //console.log("finished");
      toggleButtons(displayMessage);
  }
}




