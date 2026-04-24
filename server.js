const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// rooms: { code: { players: [ws, ws], choices: {}, scores: [0,0], round: 1 } }
const rooms = {};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms[code] ? generateCode() : code;
}

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

function broadcast(room, data) {
  room.players.forEach(p => send(p, data));
}

function getWinner(a, b) {
  if (a === b) return 'draw';
  if ((a === 'rock' && b === 'scissors') ||
      (a === 'scissors' && b === 'paper') ||
      (a === 'paper' && b === 'rock')) return 'p1';
  return 'p2';
}

wss.on('connection', ws => {
  ws.roomCode = null;
  ws.playerIndex = null;

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'create') {
      const code = generateCode();
      rooms[code] = { players: [ws], choices: {}, scores: [0, 0], round: 1 };
      ws.roomCode = code;
      ws.playerIndex = 0;
      send(ws, { type: 'created', code });
    }

    else if (msg.type === 'join') {
      const code = (msg.code || '').toUpperCase().trim();
      const room = rooms[code];
      if (!room) return send(ws, { type: 'error', message: 'Room not found. Check your code!' });
      if (room.players.length >= 2) return send(ws, { type: 'error', message: 'Room is full!' });

      room.players.push(ws);
      ws.roomCode = code;
      ws.playerIndex = 1;

      send(ws, { type: 'joined', code, scores: room.scores, round: room.round });
      broadcast(room, { type: 'start', round: room.round, scores: room.scores });
    }

    else if (msg.type === 'choice') {
      const room = rooms[ws.roomCode];
      if (!room || ws.playerIndex === null) return;

      room.choices[ws.playerIndex] = msg.choice;
      const opponent = room.players[ws.playerIndex === 0 ? 1 : 0];
      send(opponent, { type: 'opponent_chose' }); // just tells UI "opponent is ready"

      if (Object.keys(room.choices).length === 2) {
        const c0 = room.choices[0];
        const c1 = room.choices[1];
        const result = getWinner(c0, c1);

        if (result === 'p1') room.scores[0]++;
        else if (result === 'p2') room.scores[1]++;

        const gameOver = room.scores[0] >= 2 || room.scores[1] >= 2;

        broadcast(room, {
          type: 'round_result',
          choices: { 0: c0, 1: c1 },
          result,
          scores: room.scores,
          round: room.round,
          gameOver,
          winner: gameOver ? (room.scores[0] >= 2 ? 0 : 1) : null
        });

        room.choices = {};
        if (!gameOver) {
          room.round++;
          setTimeout(() => broadcast(room, { type: 'next_round', round: room.round, scores: room.scores }), 2500);
        }
      }
    }

    else if (msg.type === 'rematch') {
      const room = rooms[ws.roomCode];
      if (!room) return;
      room.rematchVotes = (room.rematchVotes || 0) + 1;
      if (room.rematchVotes >= 2) {
        room.scores = [0, 0];
        room.round = 1;
        room.choices = {};
        room.rematchVotes = 0;
        broadcast(room, { type: 'rematch_start', round: 1, scores: [0, 0] });
      } else {
        send(ws, { type: 'rematch_waiting' });
      }
    }
  });

  ws.on('close', () => {
    const room = rooms[ws.roomCode];
    if (!room) return;
    room.players = room.players.filter(p => p !== ws);
    if (room.players.length === 0) {
      delete rooms[ws.roomCode];
    } else {
      broadcast(room, { type: 'opponent_left' });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`RPS server running on port ${PORT}`));
