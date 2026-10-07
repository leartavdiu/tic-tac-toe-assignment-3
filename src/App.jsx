import { useState } from 'react'
import './App.css'

function Square({ value, onSquareClick, winning }) {
  let className = 'square'

  if (winning) {
    className += ' winner'
  }

  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  )
}

function Board({ xIsNext, squares, onPlay }) {
  const winnerInfo = calculateWinner(squares)
  const winner = winnerInfo.winner
  const winningLine = winnerInfo.line

  let status

  if (winner) {
    status = 'Winner: ' + winner
  } else if (squares.every((square) => square !== null)) {
    status = 'Draw: no one wins.'
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O')
  }

  function handleClick(i) {
    if (squares[i] || winner) {
      return
    }

    // copy the board before changing it
    const nextSquares = squares.slice()
    nextSquares[i] = xIsNext ? 'X' : 'O'
    onPlay(nextSquares, i)
  }

  // make the board with two loops
  const rows = []

  for (let row = 0; row < 3; row++) {
    const squaresInRow = []

    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col

      squaresInRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          winning={winningLine.includes(index)}
        />,
      )
    }

    rows.push(
      <div className="board-row" key={row}>
        {squaresInRow}
      </div>,
    )
  }

  return (
    <div className="board">
      <div className="status">{status}</div>
      {rows}
    </div>
  )
}

export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)])
  const [moveLocations, setMoveLocations] = useState([null])
  const [currentMove, setCurrentMove] = useState(0)
  const [ascending, setAscending] = useState(true)

  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares, squareIndex) {
    const row = Math.floor(squareIndex / 3) + 1
    const col = (squareIndex % 3) + 1

    // copy history before adding the new board
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      nextSquares.slice(),
    ]

    // copy the move locations too
    const nextLocations = [
      ...moveLocations.slice(0, currentMove + 1),
      { row, col },
    ]

    setHistory(nextHistory)
    setMoveLocations(nextLocations)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove)
  }

  function toggleOrder() {
    setAscending(!ascending)
  }

  const moves = history.map((squares, move) => {
    let description

    if (move > 0) {
      const location = moveLocations[move]
      description =
        'Go to move #' + move + ' (' + location.row + ', ' + location.col + ')'
    } else {
      description = 'Go to game start'
    }

    if (move === currentMove) {
      let currentText = 'You are at move #' + move

      if (move > 0) {
        const location = moveLocations[move]
        currentText += ' (' + location.row + ', ' + location.col + ')'
      }

      return (
        <li key={move}>
          <span className="current-move">{currentText}</span>
        </li>
      )
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    )
  })

  // copy the list before reversing it
  const displayedMoves = ascending ? moves : moves.slice().reverse()

  return (
    <div className="game">
      <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />

      <div className="game-info">
        <button className="sort-button" onClick={toggleOrder}>
          Sort {ascending ? 'Descending' : 'Ascending'}
        </button>

        <ol>{displayedMoves}</ol>
      </div>
    </div>
  )
}

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
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: [a, b, c],
      }
    }
  }

  return {
    winner: null,
    line: [],
  }
}
