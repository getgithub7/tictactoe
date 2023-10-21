import { useState } from "react";
import React, { useEffect } from "react";
import Ipixelu from "./fonts/I-pixel-u.ttf";
import "./App.css";
import { useRef } from "react";
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

const AudioPlayer = ({ audio }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const myRef = useRef(audio);
  const handleClick = () => {
    if (!isPlaying) {
      myRef.current.play();

      setIsPlaying(true);
    } else {
      myRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Play audio</button>
    </div>
  );
};

export default function Board() {
  const [xIsNext, setxIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [history, setHistory] = useState([{ squares: squares, player: null }]);
  const [play, setPlay] = useState([{ squares: squares, player: null }]);
  const [result, setResult] = useState([0, 0]);
  const [isDraw, setIsDraw] = useState(false);
  const [easy, setEasy] = useState(true);
  const [humanFirstMove, setHumanFirstMove] = useState(false);
  const [nameEasy, setNameEasy] = useState(true);
  const [nameImpossible, setNameImpossible] = useState(false);
  const [computerIsO, setComputerIsO] = useState(true);
  const [computerIsNext, setComputerIsNext] = useState(false);
  const [winning, setWinning] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [changeImage, setChangeImage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  let [valueNum, setValueNum] = useState(1);
  const audio = new Audio(process.env.PUBLIC_URL + "theme.mp3");

  const punch = new Audio(process.env.PUBLIC_URL + "punch.mp3");

  const kungfu = new Audio(process.env.PUBLIC_URL + "kungfu.mp3");
  /*
  const playPause = () => {
    audio.play();
  };

  const usePlayPause = () => {
    useEffect(() => {
      playPause();
    }, []);
  };

  usePlayPause();
*/
  //need to use those as components otherwise won't work when board is rendered.
  //nee to be outside Board component
  function playSound() {
    audio.play();
  }

  function pause() {
    console.log(audio);
    audio.pause();
  }

  // Function to randomly select an image source
  const chooseImage = () => {
    const randomNumber = Math.floor(Math.random() * 4) + 1;
    const imageName = `mk1`;
    const imagePath = `${imageName}.jpg`;
    setImageSrc(imagePath);

    console.log(imagePath);

    console.log(imageName);
  };

  const useChooseImage = () => {
    useEffect(() => {
      chooseImage();
    }, []);
  };

  useChooseImage();

  function minimax(board, depth, isMaximizingPlayer) {
    const winner = calculateWinner(board);
    if (winner === "X") {
      return -1;
    } else if (winner === "O") {
      return 1;
    } else if (winner === null && board.every((val) => val !== null)) {
      return 0;
    }

    if (isMaximizingPlayer) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = "O";
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = "X";
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  function findBestMove(board) {
    const makeRandomMove = Math.random() < 0.5;
    if (makeRandomMove && easy) {
      const emptyCells = board.reduce((acc, cell, index) => {
        if (!cell) acc.push(index);
        return acc;
      }, []);
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      return emptyCells[randomIndex];
    } else {
      let bestScore = -Infinity;
      let bestMove = null;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = "O";
          const score = minimax(newBoard, 0, false);
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      if (bestMove === null) {
        return null;
      }
      return bestMove;
    }
  }

  function handleClick(i) {
    kungfu.play();
    const nextSquares = squares.slice();
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    nextSquares[i] = computerIsO ? "X" : "O";
    setSquares(nextSquares);
    const winner = calculateWinner(nextSquares);
    if (winner) {
      updateResult(winner);
      setHumanFirstMove(true);
    } else {
      const bestMove = findBestMove(nextSquares);
      nextSquares[bestMove] = computerIsO ? "O" : "X";
      setSquares(nextSquares);
      updateResult(calculateWinner(nextSquares));
    }

    const allSquaresFilled = nextSquares.every(
      (nextSquare) => nextSquare !== null
    );
    if (allSquaresFilled && !winner) {
      // setHumanFirstMove(false);
      //setComputerIsNext(true);
      //setComputerIsO(false);
      //
      setIsDraw(!isDraw);
    }
    console.log(xIsNext);
    setxIsNext(!xIsNext);
  }
  useEffect(() => {
    const newSquares = squares.slice();
    if (computerIsNext) {
      if (calculateWinner(newSquares)) {
        updateResult(calculateWinner(newSquares));
        setxIsNext(!xIsNext);
      }
      if (!calculateWinner(newSquares)) {
        const nextSquares = squares.slice();
        let randomIndex;

        punch.play();
        do {
          randomIndex = Math.floor(Math.random() * 9);
        } while (nextSquares[randomIndex]);
        nextSquares[randomIndex] = computerIsO ? "O" : "X";

        updateResult(calculateWinner(nextSquares));
        setSquares(nextSquares);
        setHistory([...history, { squares: nextSquares, player: "O" }]);

        setComputerIsNext(false);

        setxIsNext(true);
      }
    }

    console.log(xIsNext);
  }, [xIsNext]);

  function handleReverse() {
    if (history.length <= 1) {
      console.log("click");
      return;
    }

    const prevHistory = history.slice(0, history.length - 1);
    const prevMove = prevHistory[prevHistory.length - 1];
    setSquares(prevMove.squares);
    setxIsNext(prevMove.player === "O");
    setHistory(prevHistory);
  }

  function playAgain() {
    const prevHistory = play.slice(0, history.length - 1);
    const prevMove = prevHistory[prevHistory.length - 1];
    setValueNum((valueNum += 1));
    console.log(valueNum);
    const imageName = `mk${valueNum}`;
    if (valueNum >= 5) {
      valueNum = Math.floor(Math.random() * 4) + 1;
      setValueNum(valueNum);
    }
    const imagePath = `${imageName}.jpg`;
    setImageSrc(imagePath);

    if (prevMove) {
      setSquares(prevMove.squares);
      setxIsNext("X");
    } else {
      setSquares(Array(9).fill(null));
      setxIsNext(true);
    }
    setPlay(prevHistory);
    if (isDraw) {
      console.log("draw");

      setSquares(Array(9).fill(null));
      setComputerIsNext(false);
      setComputerIsO(true);

      setIsDraw(!isDraw);
    }
  }

  function calculateWinner(squares, board) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let win = false;
    if (xIsNext) {
      if (
        squares[lines[0][0]] === "X" &&
        squares[lines[0][1]] === "X" &&
        squares[lines[0][2]] !== "O" &&
        squares[lines[0][0]] !== "O"
      ) {
        win = true;
      } else if (squares[lines[0][0]] === "O") {
        win = false;
      } else {
        win = false;
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[b] === squares[c]
      ) {
        return squares[a];
      } else if (squares[a] === "X" && squares[b] === "X" && win && xIsNext) {
        setWinning(!winning);
      } else {
        win = false;
      }
    }

    return null;
  }

  /*
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[b] === squares[c]
      ) {
        return squares[a];
      }
    return null;
  }
*/
  let resultX = result[0];
  let resultO = result[1];
  function updateResult(won) {
    if (won === "X") {
      setResult([resultX + 1, resultO]);
    } else if (won === "O") {
      setResult([resultX, resultO + 1]);
    }
  }

  function resetScore() {
    setResult([0, 0]);
  }

  function easyMode() {
    console.log(easy);
    if (!easy) {
      setEasy(!easy);
    }
    console.log(easy);
    if (!nameEasy) {
      setNameEasy(!nameEasy);
      setNameImpossible(!nameImpossible);
    }
  }
  function impossibleMode() {
    console.log(easy);
    if (easy) {
      setEasy(!easy);
    }
    if (!nameImpossible) {
      setNameImpossible(!nameImpossible);
      setNameEasy(!nameEasy);
    }
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next move: " + (xIsNext ? "X" : "O");
  }
  let newStatus;
  if (winning) {
    newStatus = "win on next move";
  } else {
    newStatus = "no win on next move";
  }
  return (
    <>
      <div className="wrapper" style={{ backgroundImage: `url(${imageSrc})` }}>
        <div className="board-row">
          <Square value={squares[0]} onSquareClick={() => handleClick(0)} />

          <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
          <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
        </div>
        <div className="board-row">
          <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
          <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
          <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
        </div>
        <div className="board-row">
          <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
          <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
          <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
        </div>

        <br />
        <div className="status">{status}</div>
        <br />
        <div className="result">
          {"X: "}

          {resultX}

          <br />
          {"O: "}
          {resultO}
        </div>

        <br />
        <div>
          <button
            className={nameEasy ? "colorEasy" : "easy"}
            onClick={easyMode}
          >
            Normal Mode
          </button>

          <button
            className={nameImpossible ? "colorImpossible" : "impossible"}
            onClick={impossibleMode}
          >
            Hard Mode
          </button>

          <button onClick={resetScore} className="resetScore">
            Reset Score
          </button>
          <button onClick={playSound}>Click me</button>

          <button onClick={pause}>Click me</button>
          <AudioPlayer audio={audio} />
        </div>
      </div>
      <div
        className={winner ? "mainDivTwo" : isDraw ? "mainDivThree" : "mainDiv"}
        onClick={playAgain}
      >
      </div>
    </>
  );
}
