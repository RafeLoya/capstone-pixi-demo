# Quick Demo Guide

This guide shows how to demo the quiz game with 4 players where one device runs the server.

## Setup Overview

- **1 Host Device**: Runs the server AND plays as Player 1
- **3 Other Devices**: Connect to host and play as Players 2-4
- **All devices**: Must be on the same WiFi/network

## Step-by-Step Instructions

### Part 1: Host Setup (5 minutes)

#### 1. Install Dependencies

```bash
cd quiz-prototype
npm install
```

#### 2. Find Your IP Address

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

**On Linux:**
```bash
hostname -I
```

You'll see something like `192.168.1.100` - **write this down!**

#### 3. Configure Firewall

**Mac:**
- System Preferences → Security & Privacy → Firewall
- Click "Firewall Options"
- Add Node.js or allow incoming connections
- Click OK

**Windows:**
- Windows Security → Firewall & network protection
- Allow an app through firewall
- Check both Private and Public for Node.js
- Click OK

**Linux:**
```bash
sudo ufw allow 3000
```

#### 4. Start the Server

```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
```

#### 5. Test Locally

Open your browser and go to:
```
http://localhost:3000
```

You should see the quiz game waiting screen.

### Part 2: Connect Other Players

#### On Each of the Other 3 Devices:

1. Make sure device is on the **same WiFi network** as the host
2. Open a web browser
3. Navigate to: `http://[HOST_IP]:3000`
   - Replace `[HOST_IP]` with the IP from Step 2
   - Example: `http://192.168.1.100:3000`
4. You should see the quiz game waiting screen

### Part 3: Play the Game

1. **Wait for players**: Game starts when 2+ players are connected
2. **Answer questions**: Each player selects their answer
3. **See results**: Scores update after each round
4. **Complete game**: Play through all 3 questions
5. **View final scores**: Leaderboard shows at the end

### Part 4: View Dashboard (Optional)

If you've deployed the serverless infrastructure:

1. Host opens: `https://[your-github-username].github.io/quiz-prototype/`
2. Enter API base URL from AWS deployment
3. See global leaderboard and session data
4. Export results as CSV

## Troubleshooting

### Players Can't Connect

**Problem**: Other devices get "This site can't be reached"

**Solutions**:
- Verify all devices on same WiFi network
- Double-check IP address is correct
- Confirm firewall allows port 3000
- Try pinging host: `ping [HOST_IP]`
- Restart server and try again

### Firewall Blocks Connection

**Problem**: Firewall prevents incoming connections

**Solution**: Temporarily disable firewall for demo:
```bash
# Mac
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Re-enable after demo
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

### Different Networks?

**Problem**: Devices on different networks (coffee shop, cellular, etc.)

**Solution**: Use ngrok (or any other `localhost` tunneling service) to create public URL:

```bash
# Install ngrok
brew install ngrok  # Mac
# or download from https://ngrok.com

# Start server in one terminal
npm start

# Start ngrok in another terminal
ngrok http 3000
```

ngrok will give you a URL like:
```
Forwarding: https://abc-123-def.ngrok.io -> http://localhost:3000
```

**Everyone (including host) uses the ngrok URL!**

### Game Won't Start

**Problem**: Players connected but game doesn't start

**Solution**:
- Need minimum 2 players connected
- Check server terminal for "Player connected" messages
- Refresh browsers if needed

## Quick Reference Card

Print something similar to the following for other players:

```
┌─────────────────────────────────────┐
│     QUIZ GAME - PLAYER CARD         │
├─────────────────────────────────────┤
│                                     │
│  1. Connect to WiFi: [Network Name] │
│                                     │
│  2. Open Browser                    │
│                                     │
│  3. Go to: http://[HOST_IP]:3000    │
│                                     │
│  4. Wait for game to start          │
│                                     │
│  5. Answer questions!               │
│                                     │
└─────────────────────────────────────┘
```

## Offline Demo (No AWS)

You can demo without AWS if needed:

1. Skip AWS deployment
2. Game will work normally for gameplay
3. Database save operations will fail silently (error in server console)
4. Good for pure gameplay demo without data persistence

## Hardware Requirements

- **Host Device**: Laptop/desktop with Node.js installed
- **Other Devices**: Any device with web browser
  - Phones
  - Tablets
  - Laptops
  - Desktop computers

## Network Requirements

- WiFi network that allows device-to-device communication
- Some public/guest networks block this - use personal hotspot if needed

## Post-Demo Cleanup

```bash
# Stop server
Ctrl+C in terminal

# (Optional) Stop ngrok
Ctrl+C in ngrok terminal
```

---

**Ready to demo? Follow Part 1 and you'll be running in 5 minutes!**
