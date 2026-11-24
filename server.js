const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { randomBytes } = require("crypto");

const app = express();
app.get("/", (_req,res)=>res.send("SIDz ROYALE multiplayer server is running."));
app.get("/health", (_req,res)=>res.json({ok:true,service:"sidz-royale"}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || "*", methods: ["GET","POST"] },
  pingInterval: 25000, pingTimeout: 20000
});
const rooms = new Map();
const MAX_PLAYERS = 4;
function code(){return randomBytes(3).toString("hex").toUpperCase()}
function publicPlayer(id,p){return {id,name:p.name,avatar:p.avatar,x:p.x,z:p.z,rotation:p.rotation}}
function emitState(room){io.to(room.code).emit("state",[...room.players.entries()].map(([id,p])=>publicPlayer(id,p)))}
function leave(socket){const code=socket.data.room;if(!code)return;const room=rooms.get(code);if(room){room.players.delete(socket.id);socket.to(code).emit("playerLeft",socket.id);if(room.players.size===0)rooms.delete(code);else emitState(room)}socket.leave(code);socket.data.room=null}
io.on("connection",socket=>{
  socket.on("createRoom",data=>{
    leave(socket);let roomCode=code();while(rooms.has(roomCode))roomCode=code();
    const room={code:roomCode,mode:["solo","duo","squad"].includes(data.mode)?data.mode:"solo",players:new Map()};
    rooms.set(roomCode,room);room.players.set(socket.id,{name:String(data.name||"Player").slice(0,16),avatar:data.avatar||"blue",x:0,z:10,rotation:0});
    socket.join(roomCode);socket.data.room=roomCode;
    socket.emit("roomCreated",{code:roomCode,mode:room.mode,players:[...room.players.entries()].map(([id,p])=>publicPlayer(id,p))});
  });
  socket.on("joinRoom",data=>{
    const room=rooms.get(String(data.code||"").toUpperCase());
    if(!room){socket.emit("joinError","Room not found. Check the room code.");return}
    if(room.players.size>=MAX_PLAYERS){socket.emit("joinError","Room is full (maximum 4 players).");return}
    leave(socket);
    const p={name:String(data.name||"Player").slice(0,16),avatar:data.avatar||"blue",x:Math.random()*8-4,z:10,rotation:0};
    room.players.set(socket.id,p);socket.join(room.code);socket.data.room=room.code;
    socket.emit("roomJoined",{code:room.code,mode:room.mode,players:[...room.players.entries()].map(([id,v])=>publicPlayer(id,v))});
    socket.to(room.code).emit("playerJoined",publicPlayer(socket.id,p));emitState(room);
  });
  socket.on("move",pos=>{
    const room=rooms.get(socket.data.room);if(!room)return;const p=room.players.get(socket.id);if(!p)return;
    const x=Number(pos.x),z=Number(pos.z),rotation=Number(pos.rotation);
    if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(rotation))return;
    p.x=Math.max(-80,Math.min(80,x));p.z=Math.max(-80,Math.min(80,z));p.rotation=rotation;
  });
  socket.on("requestPlayers",()=>{const room=rooms.get(socket.data.room);if(room)emitState(room)});
  socket.on("leaveRoom",()=>leave(socket));
  socket.on("disconnect",()=>leave(socket));
});
const port=process.env.PORT||3000;
server.listen(port,"0.0.0.0",()=>console.log(`SIDz ROYALE server listening on ${port}`));
