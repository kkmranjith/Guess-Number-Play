import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [userName, setUserName] = useState('');
  const [userScore, setUserScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [out, setOut] = useState(false);
  const [winner, setWinner] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [computerHistory, setComputerHistory] = useState([]);
  const [comments, setComments] = useState('');

  const handleStartGame = () => {
    setGameStarted(true);
  };

  useEffect(() => {
    handleRestart();
  }, []); // Automatically start the game when the component mounts

  const playGame = (number) => {
    if (out || winner || !gameStarted) {
      return;
    }

    const userChoice = number;
    const computerChoice = Math.floor(Math.random() * 6) + 1;

    setUserScore(userScore + userChoice);
    setComputerScore(computerScore + computerChoice);

    // Add user and computer choices to history
    setUserHistory([...userHistory, userChoice]);
    setComputerHistory([...computerHistory, computerChoice]);

    // Check for milestones
    const milestones = [50, 100, 150, 200];
    milestones.forEach((milestone) => {
      if (userScore < milestone && userScore + userChoice >= milestone) {
        setComments(`Cheers! ${userName} reached ${milestone}+!`);
      }
      if (computerScore < milestone && computerScore + computerChoice >= milestone) {
        setComments(`Computer reached ${milestone}+!`);
      }
    });

    if (userChoice === computerChoice) {
      setOut(true);
      // Determine the winner based on the highest score
      if (userScore > computerScore) {
        setWinner(userName);
      } else if (computerScore > userScore) {
        setWinner('Computer');
        setComments(`Better luck next time! Computer won the game with a score of ${computerScore}.`);
      } else {
        setWinner('Draw');
        setComments('It\'s a draw!');
      }
    }

    if (userScore >= 100 || computerScore >= 100) {
      // Determine the winner based on the highest score
      if (userScore > computerScore) {
        setWinner(userName);
      } else if (computerScore > userScore) {
        setWinner('Computer');
        setComments(`Better luck next time! Computer won the game with a score of ${computerScore}.`);
      } else {
        setWinner('Draw');
        setComments('It\'s a draw!');
      }
    }
  };

  const handleRestart = () => {
    setUserScore(0);
    setComputerScore(0);
    setOut(false);
    setWinner('');
    setGameStarted(false);
    setComments('');
    setUserHistory([]);
    setComputerHistory([]);
    setUserName(''); // Clear old user name
  };

  const calculateScoreDifference = () => {
    return Math.abs(userScore - computerScore);
  };

  const getPositiveComment = () => {
    const difference = calculateScoreDifference();

    if (difference >= 50) {
      return 'Wow! You are crushing it!';
    } else if (difference >= 25) {
      return 'Great job! You are in the lead!';
    } else {
      return 'Keep going! You can do it!';
    }
  };

  const downloadCompleteHistory = () => {
    const historyData = userHistory.map((user, index) => ({
      Serial_No: index + 1,
      User_Clicked_Number: user,
      Computer: computerHistory[index],
    }));
  
    // const totalScoreRow = userHistory.length + 2; // Assuming the data starts from row 2
  
  
  // Calculate the total scores
  const totalUserScore = userHistory.reduce((sum, num) => sum + num, 0);
  const totalComputerScore = computerHistory.reduce((sum, num) => sum + num, 0);

  // Add total scores to the Excel file with styling
  historyData.push({
    Serial_No: 'Total',
    User_Clicked_Number: totalUserScore,
    Computer: totalComputerScore,
  });

  const ws = XLSX.utils.json_to_sheet(historyData);

  // Add user name as a table heading with styling
  ws.B1 = { v: [userName], t: 's' };

  // Add styling for header
  ws["!cols"] = [{ width: 15 }, { width: 15 }, { width: 15 }];
  ws["B1"].s = { font: { bold: true, size: 16 }, fill: { fgColor: { rgb: '000000' } }, color: { rgb: 'FFFFFF' } };

  // Add styling for total scores
  const totalScoresRowIndex = userHistory.length + 2; // Assuming the data starts from row 2
  ws[`A${totalScoresRowIndex}`].s = { font: { bold: true, size: 14 }, fill: { fgColor: { rgb: 'FF0000' } } };
  ws[`B${totalScoresRowIndex}`].s = { font: { bold: true, size: 14 }, fill: { fgColor: { rgb: '00FF00' } } };
  ws[`C${totalScoresRowIndex}`].s = { font: { bold: true, size: 14 }, fill: { fgColor: { rgb: '0000FF' } } };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'CompleteHistory');
  XLSX.writeFile(wb, `${userName}_Score_History.xlsx`);
};

// Add a condition to check if the user scored 100+ before downloading complete history
if (userScore >= 100) {
  downloadCompleteHistory();
}

  

  return (
    <div className="App">
      <header className="App-header">
        {!gameStarted && (
          <div>
            <h1>Guess the Number Game</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleStartGame(); }}>
              <label>
                Enter Your Name: &nbsp;&nbsp;&nbsp;
                <input type="text" placeholder="Type your name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
              </label><br></br> <br></br>
              <button className="button" type="submit">
                Start Game
              </button>
            </form>
          </div>
        )}
        {gameStarted && (
          <div>
            <h1>Game in Progress</h1>
            <p>{userName} playing against Computer</p>
            <div>
              <p>Your Score: {userScore}</p>
              <p>Computer's Score: {computerScore}</p>
            </div>
            {out && (
              <div>
                <p>OUT! You and Computer Clicked the Same Number.</p> 
                
              </div>
            )}
            {comments && (
              <div>
                <p>{comments}</p>
              </div>
            )}
            {winner && winner !== 'Draw' && (
              <div>
                <p className={`winner-highlight ${winner === 'User' ? 'computer-win' : 'user-win'}`}>
                  {winner} won the game!
                </p>
                <p>Score Difference: {calculateScoreDifference()}</p>
                <p>{getPositiveComment()}</p>
                <button className="button restart-button" onClick={handleRestart}>
                  Restart
                </button>
              </div>
            )}
            {winner && winner === 'Draw' && (
              <div>
                <p>It's a Draw!</p>
                <button className="button restart-button" onClick={handleRestart}>
                  Restart
                </button>
              </div>
            )}
            {!out && !winner && (
              <div className="button-wrapper">
                {[1, 2, 3, 4, 5, 6].map((number) => (
                  <button
                    key={number}
                    className="button"
                    onClick={() => playGame(number)}
                    disabled={out || winner}
                  >
                    {number}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
      {out && (
        <div className="score-card">
          <h2>Score Card</h2>
          <table id="score-card-table">
            <thead>
              <tr>
                <th>Serial No.</th>
                
                <th>{userName} Score</th>
                <th>Computer Score</th>
              </tr>
            </thead>
            <tbody>
              {userHistory.map((number, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>    
                  <td>{number}</td>
                  <td>{computerHistory[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={downloadCompleteHistory} className="button">
            Download Complete History
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
