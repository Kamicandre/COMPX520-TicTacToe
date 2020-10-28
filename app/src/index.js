import Web3 from 'web3';
import contract from 'truffle-contract'
import $ from "jquery";

//Import our contract artifacts and turn them into usable abstractions.
import tictactoe_artifacts from "../../build/contracts/TicTacToe.json";

var TicTacToe = contract(tictactoe_artifacts);

var accounts;
var account;
var ticTacToeInstance;
var nextPlayerEvent;
var gameOverWithWinEvent;
var gameOverWithDrawEvent;
var arrEventsFired;

window.App = {
  start: function() {
    var self = this;
    //Bootstrap the Tictactoe for use
    TicTacToe.setProvider(web3.currentProvider);

    //Get the initial account balance so it can be displayed
    web3.eth.getAccounts(function(err, accs) {
      if(err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Etherum client is configured correctly.");
        return;
      }

      //Store all the accounts in this variable
      accounts = accs;
      //Set the first account to the current account
      account = accounts[0];

      arrEventsFired = [];
    });
  },

  useAccountOne: function() {
    account = accounts[1];
  },

  createNewGame: function() {
    TicTacToe.new({from:account, value:web3.utils.toWei("0.1","ether"), gas:3000000}).then(instance => {
      ticTacToeInstance = instance;

      for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
          $($("#board")[0].children[0].children[i].children[j]).off('click').click({x:i,y:j},App.setStone);
        }
      }

      /*var playerJoinedEvent = ticTacToeInstance.PlayerJoined();

      playerJoinedEvent.on("data",(error,eventObj) => {
        if(!error) {
          console.log(eventObj);
        } else {
          console.error(error);
        }
      })*/
      //var nextPlayerEvent = ticTacToeInstance.NextPlayer();
      //nextPlayerEvent.on("data",App.nextPlayer);
      console.log(instance);
    }).catch(error => {
      console.error(error);
    })
  },
  /*//On Click in box Event Handler
  for(var i = 0; i <3; i++) {
    for(var j = 0; j < 3; j++) {
      $($("#board")[0].children[0].children[i].children[j]).off('click').click({x: i, y:j}, App.setStone);
    }
  }*/
  joinGame: function() {
    var gameAddress = prompt("Address of the Game");
    if(gameAddress != null) {
      TicTacToe.at(gameAddress).then(instance => {
        ticTacToeInstance = instance;

        return ticTacToeInstance.joinGame({from:account, value:web3.utils.toWei("0.1","ether"), gas:3000000});
      }).then(txResult => {
          for(var i = 0; i < 3; i++) {
            for(var j = 0; j < 3; j++) {
              $($("#board")[0].children[0].children[i].children[j]).off('click').click({x:i,y:j},App.setStone);
            }
          }
          console.log(txResult)
      })
    }
  },
  nextPlayer: function(error, eventObj) {

      console.log(eventObj);

      App.printBoard();

      if(eventObj.args[0] == account) {
        //our turn
        /**
        Set the On-Click Handler
        **/
        for(var i = 0; i < 3; i++) {
          for(var j = 0; j < 3; j++) {
            $($("#board")[0].children[0].children[i].children[j]).off('click').click({x:i,y:j},App.setStone);
          }
        }
      } else {
        //opponents turn
      }
  },
  setStone: function(event) {
    console.log(event);

    /*for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
        $($("#board")[0].children[0].children[i].children[j]).prop('onclick',null).off('click');
      }
    }*/

    ticTacToeInstance.setStone(event.data.x, event.data.y, {from: account}).then(txResult => {
      console.log(txResult);
      App.printBoard();
    })
  },
  printBoard: function() {
    ticTacToeInstance.getBoard.call().then(board => {
      for(var i=0; i < board.length; i++) {
        for(var j=0; j<board[i].length; j++){
          if(board[i][j] == accounts[0]){
            $("#board")[0].children[0].children[i].children[j].innerHTML = "X";
          }else if(board[i][j] == accounts[1]) {
            $("#board")[0].children[0].children[i].children[j].innerHTML = "O";
          }
        }
      }
    });
  },
};

window.addEventListener("load", function() {
  if(typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly.")

    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No Web3 detected. Falling back to http://127.0.0.1:9545.");
    window.web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:9545"));
  }

  App.start();
});
