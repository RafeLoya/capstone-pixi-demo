# Quiz Game Prototype

A multiplayer quiz game built with Pixi.js and Socket.io.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open multiple browser tabs to `http://localhost:3000` to test multiplayer

## How It Works

### Client (Pixi.js)
- `src/main.js` - Entry point, initializes Pixi app
- `src/game.js` - Game controller, manages scenes and socket connection
- `src/scenes/quiz-scene.js` - Displays questions and answer buttons
- `src/scenes/result-scene.js` - Shows final scores
- `src/components/choice-button.js` - Interactive answer button

### Server (Node.js + Socket.io)
- `server.js` - Game server with authority over scoring
- Manages game state, player connections, and question flow
- Calculates scores based on:
  - Correct answers (10 pts)
  - Everyone correct bonus (+5 pts)
  - First correct answer bonus (+5 pts)

## Game Flow

1. Players connect → Server waits for 2+ players
2. Server sends question → All clients display it
3. Players submit answers → Server tracks timestamps
4. All players answer → Server calculates scores
5. Server broadcasts results → Clients show feedback
6. Repeat for 3 questions
7. Final scores displayed

## Next Steps

- Add question timer
- Show other players' answer indicators in real-time
- Add more visual feedback and animations
- Create proper lobby system
- Add more questions or question API