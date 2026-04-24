# 🪨📄✂️ Rock Paper Scissors — Online Multiplayer

Real-time 2-player Rock Paper Scissors with room codes and best-of-3. Built with Node.js + WebSockets.

---

## ▶️ Run locally

```bash
npm install
npm start
```

Open http://localhost:3000 in two browser tabs to test.

---

## 🚀 Deploy FREE in 2 minutes (Railway — recommended)

1. Go to https://railway.app and sign up (free)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Upload or push this folder to a GitHub repo first, then select it
4. Railway auto-detects Node.js and runs `npm start`
5. Click **"Generate Domain"** — you get a free public URL like `https://rps-xyz.up.railway.app`
6. Share that URL with your friend!

### Alternative: Render.com
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Free tier works great for this game

---

## 🎮 How to play

1. Player 1 opens the site → clicks **"New Game"** → gets a 4-letter code (e.g. `XKQP`)
2. Player 2 opens the same URL → enters the code → clicks **Play**
3. Both players pick Rock, Paper, or Scissors
4. First to win **2 rounds** wins the match!
5. Click **Rematch** to play again — both must click it

---

## 📁 File structure

```
rps-online/
├── server.js        ← Node.js WebSocket server
├── package.json     ← dependencies (express + ws)
├── public/
│   └── index.html   ← entire frontend (single file)
└── README.md
```
