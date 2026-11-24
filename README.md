# SIDz ROYALE — Online Multiplayer Starter

This is a starter prototype with a 3D lobby, room codes, player list, shared player movement, graphics settings and look sensitivity.

## Important hosting detail

GitHub Pages can host the frontend files, but it cannot run a Node.js / Socket.IO server. Use:
- GitHub repository + GitHub Pages for `index.html`, `style.css`, `game.js`, `config.js`
- Render (or another Node.js host) for `server.js` and `package.json`

## 1. Upload frontend to GitHub

Upload `index.html`, `style.css`, `game.js`, and `config.js` to the root of your `sidz-royale` repository. Enable GitHub Pages from Settings → Pages → Deploy from a branch → main → /(root).

## 2. Deploy the multiplayer server

Create a new Web Service on Render and connect the same GitHub repository.
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Add environment variable `FRONTEND_ORIGIN` with your GitHub Pages URL, e.g. `https://YOUR-GITHUB-USERNAME.github.io`

Render will provide a server URL such as `https://your-service.onrender.com`.

## 3. Connect the frontend

Open `config.js` in GitHub and replace:
`https://YOUR-SERVER.onrender.com`
with your actual Render URL. Commit the change and wait for GitHub Pages to redeploy.

## 4. Test with two devices

Open the GitHub Pages URL on two devices. On device 1, create a room and share its six-character code. On device 2, enter the same code and choose Join Room. Both players should see each other's moving avatar.

## Current prototype limits

- Supports room creation and joining, up to 4 players per room.
- Solo/Duo/Squad are room labels at this stage; team assignment and matchmaking queues are not implemented yet.
- Movement is synchronized; this is not yet a complete match system.
- The graphics quality setting changes renderer resolution; sensitivity changes camera-look speed.
- Jump button is a placeholder. Custom draggable HUD, profile banners, persistent accounts, voice chat, anti-cheat and production security are not included yet.
- This prototype has no weapon or headshot mechanics.
- For a public release, add authentication, server-authoritative movement validation, rate limits, moderation/reporting and privacy protections.
