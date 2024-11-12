import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import './styles.css';

const XOGameComponents = () => {
  const playerSymbols = ["X", "O", "A", "B", "C", "D"];
  
  const [numPlayers, setNumPlayers] = useState(() => {
    const saved = localStorage.getItem("gameState");
    return saved ? JSON.parse(saved).numPlayers : 2;
  });

  const [gridSize, setGridSize] = useState(() => {
    const saved = localStorage.getItem("gameState");
    return saved ? JSON.parse(saved).gridSize : 3;
  });
  
  const [squares, setSquares] = useState(() => {
    const saved = localStorage.getItem("gameState");
    const size = saved ? JSON.parse(saved).gridSize : 3;
    return saved ? JSON.parse(saved).squares : Array(size * size).fill(null);
  });

  const [currentPlayer, setCurrentPlayer] = useState(() => {
    const saved = localStorage.getItem("gameState");
    return saved ? JSON.parse(saved).currentPlayer : 0;
  });

  const [winner, setWinner] = useState(() => {
    const saved = localStorage.getItem("gameState");
    return saved ? JSON.parse(saved).winner : null;
  });

  const [showConfetti, setShowConfetti] = useState(false);
  
  const [winningLine, setWinningLine] = useState(() => {
    const saved = localStorage.getItem("gameState");
    return saved ? JSON.parse(saved).winningLine : [];
  });

  const [playerWins, setPlayerWins] = useState(() => {
    const saved = localStorage.getItem("playerWins");
    return saved ? JSON.parse(saved) : Array(6).fill(0);
  });

  useEffect(() => {
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        squares,
        currentPlayer,
        winner,
        winningLine,
        gridSize,
        numPlayers,
      })
    );
  }, [squares, currentPlayer, winner, winningLine, gridSize, numPlayers]);

  useEffect(() => {
    localStorage.setItem("playerWins", JSON.stringify(playerWins));
  }, [playerWins]);

  const handleNumPlayersChange = (newNumPlayers) => {
    const newSize = newNumPlayers + 1;
    setNumPlayers(newNumPlayers);
    setGridSize(newSize);
    setSquares(Array(newSize * newSize).fill(null));
    setCurrentPlayer(0);
    setWinner(null);
    setWinningLine([]);
    
    // Reset player wins to zero when number of players changes
    const newPlayerWins = Array(6).fill(0);
    setPlayerWins(newPlayerWins);
    localStorage.setItem("playerWins", JSON.stringify(newPlayerWins));
  
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        squares: Array(newSize * newSize).fill(null),
        currentPlayer: 0,
        winner: null,
        winningLine: [],
        gridSize: newSize,
        numPlayers: newNumPlayers,
      })
    );
  };
  

  const getWinningCombinations = (size, squaresToWin) => {
    const combinations = [];
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - squaresToWin; j++) {
        const row = [];
        for (let k = 0; k < squaresToWin; k++) {
          row.push(i * size + j + k);
        }
        combinations.push(row);
      }
    }

    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - squaresToWin; j++) {
        const col = [];
        for (let k = 0; k < squaresToWin; k++) {
          col.push((j + k) * size + i);
        }
        combinations.push(col);
      }
    }

    for (let i = 0; i <= size - squaresToWin; i++) {
      for (let j = 0; j <= size - squaresToWin; j++) {
        const diag1 = [];
        const diag2 = [];
        for (let k = 0; k < squaresToWin; k++) {
          diag1.push((i + k) * size + (j + k));
          diag2.push((i + k) * size + (j + squaresToWin - 1 - k));
        }
        combinations.push(diag1, diag2);
      }
    }
    
    return combinations;
  };

  const handleClick = (index) => {
    if (squares[index] || winner) return;

    const newSquares = squares.slice();
    newSquares[index] = playerSymbols[currentPlayer];
    setSquares(newSquares);
    setCurrentPlayer((prev) => (prev + 1) % numPlayers);

    const squaresToWin = numPlayers >= 5 ? 4 : 3;
    checkWinner(newSquares, squaresToWin);
  };

  const checkWinner = (board, squaresToWin) => {
    const combinations = getWinningCombinations(gridSize, squaresToWin);
    
    for (let combo of combinations) {
      const firstSymbol = board[combo[0]];
      if (!firstSymbol) continue;
      
      if (combo.every(index => board[index] === firstSymbol)) {
        setWinner(firstSymbol);
        setWinningLine(combo);
        setShowConfetti(true);
        const winnerIndex = playerSymbols.indexOf(firstSymbol);
        setPlayerWins(prev => {
          const newWins = [...prev];
          newWins[winnerIndex]++;
          return newWins;
        });
        setTimeout(() => setShowConfetti(false), 6000);
        return;
      }
    }

    if (board.every((cell) => cell)) {
      setWinner("Draw");
    }
  };

  const resetGame = () => {
    const newSquares = Array(gridSize * gridSize).fill(null);
    setSquares(newSquares);
    setCurrentPlayer(0);
    setWinner(null);
    setShowConfetti(false);
    setWinningLine([]);
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        squares: newSquares,
        currentPlayer: 0,
        winner: null,
        winningLine: [],
        gridSize,
        numPlayers,
      })
    );
  };

  const resetAllStats = () => {
    resetGame();
    const newPlayerWins = Array(6).fill(0);
    setPlayerWins(newPlayerWins);
    localStorage.setItem("playerWins", JSON.stringify(newPlayerWins));
  };

  return (
    <div className="game-container">
      {showConfetti && <Confetti />}
      <h1 className="game-title">TIC TAC TOE</h1>

      <div className="players-selector">
  <label>Number of Players: </label>
  <select 
    value={numPlayers} 
    onChange={(e) => handleNumPlayersChange(parseInt(e.target.value))}
  >
    {[2,3,4,5,6].map(num => (
      <option key={num} value={num}>{num}</option>
    ))}
  </select>
  <div className="current-turn">
    {winner ? "Game Over" : `Current Turn: Player ${currentPlayer + 1} (${playerSymbols[currentPlayer]})`}
  </div>
</div>



      <div className="game-layout">
      <div className="players-container">
  {Array(numPlayers).fill(null).map((_, index) => (
    <div 
      className={`card ${winner === playerSymbols[index] ? "winner" : ""}`} 
      key={index}
    >
      <div className={`player-info ${currentPlayer === index && !winner ? "active" : ""}`}>
        <div className="player-label">Player {index + 1} ({playerSymbols[index]})</div>
        <div className="player-symbol">{playerSymbols[index]}</div>
        <div className="win-count">Wins: {playerWins[index]}</div>
      </div>
    </div>
  ))}
</div>


        <div className="game-board-container">
          <div 
            className="game-board"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              maxWidth: `${gridSize * 5}rem`
            }}
          >
            {squares.map((square, index) => (
              <button
                key={index}
                className={`board-cell ${winningLine.includes(index) ? "winning" : ""} ${square ? "filled" : ""}`}
                onClick={() => handleClick(index)}
              >
                {square}
              </button>
            ))}
          </div>

          <div className="game-status">
  <div className="status-message">
    {winner
      ? winner === "Draw"
        ? "Game is a Draw!"
        : `Player ${playerSymbols.indexOf(winner) + 1} Wins!`
      : `Current Turn: Player ${currentPlayer + 1} (${playerSymbols[currentPlayer]})`}
  </div>
  <div className="button-container">
    <button className="play-again-button" onClick={resetGame}>
      Play Again
    </button>
    {winner && (
      <button className="reset-button" onClick={resetAllStats}>
        Reset Game
      </button>
    )}
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default XOGameComponents;