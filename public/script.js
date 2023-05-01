let btnRef = document.querySelectorAll(".button-option");
let popupRef = document.querySelector(".popup");
let newgameBtn = document.getElementById("new-game");
let restartBtn = document.getElementById("restart");
let msgRef = document.getElementById("message");
const firstPlayerSpan = document.getElementById('first');
const secondPlayerSpan = document.getElementById('second');
const loaderDiv = document.getElementById('loader-screen');
const gameDiv = document.getElementById("main-game-div");

var firstPlayerName,secondPlayerName;

//Socket IO Code

const {username,room} = Qs.parse(location.search,{
  ignoreQueryPrefix: true
})

console.log(username,room)
const socket = io();

socket.emit('joinRoom',{username,room});

socket.on('firstPlayer',username=>{
  firstPlayerSpan.innerHTML = username;
  gameDiv.classList.add('d-none');
  loaderDiv.classList.remove('d-none');
})

socket.on('secondPlayer',({firstPlayer,secondPlayer})=>{
  firstPlayerSpan.innerHTML = firstPlayer;
  secondPlayerSpan.innerHTML = secondPlayer;
  firstPlayerName = firstPlayer;
  secondPlayerName = secondPlayer;
  loaderDiv.classList.add('d-none');
  gameDiv.classList.remove('d-none');
})
let step = 0;
socket.on('playerStepClient',({element_id,value})=>{
  console.log('inside client play step')
  step++;
  if(step%2==0){
    xTurn = true;
  }else{
    xTurn= false;
  }
  var elem = document.getElementById(element_id);
  elem.innerHTML=value;
  elem.disabled = true;
  winChecker();
})

//send value to other Player
function sendToOtherPlayer(element_id,value){
  console.log("Method called")
  socket.emit('playerStep',{element_id,value,room});
}







//Winning Pattern Array
let winningPattern = [
  [0, 1, 2],
  [0, 3, 6],
  [2, 5, 8],
  [6, 7, 8],
  [3, 4, 5],
  [1, 4, 7],
  [0, 4, 8],
  [2, 4, 6],
];
//Player 'X' plays first
let xTurn = true;
let count = 0;

//Disable All Buttons
const disableButtons = () => {
  btnRef.forEach((element) => (element.disabled = true));
  //enable popup
  popupRef.classList.remove("hide");
};

//Enable all buttons (For New Game and Restart)
const enableButtons = () => {
  btnRef.forEach((element) => {
    element.innerText = "";
    element.disabled = false;
  });
  //disable popup
  popupRef.classList.add("hide");
};

//This function is executed when a player wins
const winFunction = (letter) => {
  disableButtons();
  if (letter == "X") {
    msgRef.innerHTML = `&#x1F389; <br> ${firstPlayerName} Wins`;
  } else {
    msgRef.innerHTML = `&#x1F389; <br> ${secondPlayerName} Wins`;
  }
};

//Function for draw
const drawFunction = () => {
  disableButtons();
  msgRef.innerHTML = "&#x1F60E; <br> It's a Draw";
};

//New Game
newgameBtn.addEventListener("click", () => {
  count = 0;
  enableButtons();
});
restartBtn.addEventListener("click", () => {
  count = 0;
  enableButtons();
});

//Win Logic
const winChecker = () => {
  //Loop through all win patterns
  for (let i of winningPattern) {
    let [element1, element2, element3] = [
      btnRef[i[0]].innerText,
      btnRef[i[1]].innerText,
      btnRef[i[2]].innerText,
    ];
    //Check if elements are filled
    //If 3 empty elements are same and would give win as would
    if (element1 != "" && (element2 != "") & (element3 != "")) {
      if (element1 == element2 && element2 == element3) {
        //If all 3 buttons have same values then pass the value to winFunction
        winFunction(element1);
      }
    }
  }
};

//Display X/O on click
btnRef.forEach((element) => {
  element.addEventListener("click", () => {
    if (xTurn) {
      xTurn = false;
      sendToOtherPlayer(element.id,'X');
      //Display X
      element.innerText = "X";
      element.disabled = true;
    } else {
      xTurn = true;
      sendToOtherPlayer(element.id,'O');
      //Display Y
      element.innerText = "O";
      element.disabled = true;
    }
    //Increment count on each click
    count += 1;
    if (count == 9) {
      drawFunction();
    }
    //Check for win on every click
    winChecker();
  });
});

//Enable Buttons and disable popup on page load
window.onload = enableButtons;
