import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Globe, Lock } from 'lucide-react';

interface TicTacToeProps {
  user: any;
  onWin: () => void;
  t: any;
  addNotification: (m: string, type?: any) => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ user, onWin, t, addNotification }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [mode, setMode] = useState<'bot' | 'online' | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [mySymbol, setMySymbol] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'playing' | 'gameOver' | 'idle'>('idle');

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.includes(null) ? null : 'draw';
  };

  const minimax = (board: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const result = calculateWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          let score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const handleBotMove = (currentBoard: (string | null)[]) => {
    let bestScore = -Infinity;
    let move = -1;
    const tempBoard = [...currentBoard];

    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === null) {
        tempBoard[i] = 'O';
        let score = minimax(tempBoard, 0, false);
        tempBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    if (move !== -1) {
      const newBoard = [...currentBoard];
      newBoard[move] = 'O';
      setBoard(newBoard);
      setIsXNext(true);
      const win = calculateWinner(newBoard);
      if (win) setWinner(win);
    }
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;

    if (mode === 'bot') {
      if (!isXNext) return;
      const newBoard = [...board];
      newBoard[i] = 'X';
      setBoard(newBoard);
      setIsXNext(false);
      const win = calculateWinner(newBoard);
      if (win) {
        setWinner(win);
      } else {
        setTimeout(() => handleBotMove(newBoard), 500);
      }
    } else if (mode === 'online' && socket && isMyTurn) {
      socket.send(JSON.stringify({ type: 'move', index: i }));
    }
  };

  useEffect(() => {
    if (winner === 'X' || (mode === 'online' && winner === 'you')) {
      onWin();
    }
  }, [winner]);

  const startOnline = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    setSocket(ws);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomId: 'global' }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'waiting') setStatus('waiting');
      if (msg.type === 'start') {
        setMySymbol(msg.symbol);
        setIsMyTurn(msg.turn);
        setStatus('playing');
        setBoard(Array(9).fill(null));
      }
      if (msg.type === 'update') {
        setBoard(msg.board);
        setIsMyTurn(msg.turn);
      }
      if (msg.type === 'gameOver') {
        setWinner(msg.winner);
        setStatus('gameOver');
      }
      if (msg.type === 'opponentLeft') {
        addNotification('Opponent left the game.', 'info');
        reset();
      }
    };
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setMode(null);
    if (socket) socket.close();
    setSocket(null);
    setStatus('idle');
  };

  if (!user || user.status === 'Normal') {
    return (
      <div className="bg-paper/30 rounded-3xl p-12 text-center border border-dashed border-border space-y-4">
        <Lock size={48} className="mx-auto text-ink/10" />
        <h3 className="text-xl font-display italic text-ink">Access Restricted</h3>
        <p className="text-sm text-ink/60">You need <span className="text-gold font-bold">Advanced</span> status or higher to play the minigame and earn discounts.</p>
        <p className="text-[10px] text-ink/40 uppercase tracking-widest">Current Status: {user?.status || 'Guest'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-display italic text-ink">Tic Tac Toe Challenge</h3>
          {mode === 'bot' && <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1"><Sparkles size={10} /> Difficulty: Impossible</span>}
        </div>
        {mode && <button onClick={reset} className="text-xs font-bold uppercase tracking-widest text-gold hover:underline">Change Mode</button>}
      </div>

      {!mode ? (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setMode('bot')} className="btn-luxury py-8 flex flex-col items-center gap-3">
            <Compass size={32} />
            <span>Play vs Bot</span>
          </button>
          <button onClick={startOnline} className="btn-outline py-8 flex flex-col items-center gap-3">
            <Globe size={32} />
            <span>Play Online</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {status === 'waiting' ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-ink/60 italic">Waiting for an opponent...</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-ink/40">
                  {winner ? (winner === 'draw' ? "It's a Draw!" : (winner === 'X' || winner === 'you' ? "You Won! 10% Discount Earned!" : "You Lost! Try Again.")) : (mode === 'online' ? (isMyTurn ? "Your Turn" : "Opponent's Turn") : (isXNext ? "Your Turn" : "Bot's Turn"))}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
                {board.map((cell, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: cell ? 1 : 1.05 }}
                    whileTap={{ scale: cell ? 1 : 0.95 }}
                    onClick={() => handleClick(i)}
                    className={`h-24 rounded-2xl flex items-center justify-center text-4xl font-display transition-all border shadow-sm ${
                      cell === 'X' ? 'bg-ink text-paper border-ink' : 
                      cell === 'O' ? 'bg-gold text-white border-gold' : 
                      'bg-paper text-ink/20 hover:text-ink/40 border-border'
                    }`}
                  >
                    {cell && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                      >
                        {cell}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
              {winner && (
                <button onClick={reset} className="w-full btn-luxury py-4 mt-4">Play Again</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
