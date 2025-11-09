import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import fs from "fs";

dotenv.config();

let users = {};
let roomMap = {}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",   // Allow any origin
        methods: ["GET", "POST"]
    }
});
app.use(cors());
app.use(express.json());


// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Store user when they login
//   socket.on("register", (userId) => {
//     onlineUsers[userId] = socket.id;
//     console.log("Online users:", onlineUsers);
//   });

//   // Private message
//   socket.on("private_message", ({ content, to }) => {
//     const targetSocketId = onlineUsers[to];
//     if (targetSocketId) {
//       io.to(targetSocketId).emit("private_message", { content, from: socket.id });
//     //   io.emit("private_message", { content:"bhakludoaisfuoidasofj", from: socket.id });
//     }
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     for (let userId in onlineUsers) {
//       if (onlineUsers[userId] === socket.id) {
//         delete onlineUsers[userId];
//         break;
//       }
//     }
//     console.log("User disconnected. Online users:", onlineUsers);
//   });
// });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a room
    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`${socket.id} joined room ${room}`);
        if (!users[room]) users[room] = [];
        if(users[room].indexOf(socket.id)==-1)users[room].push(socket.id);
        roomMap[socket.id] = room;

        // Notify everyone in the room (including sender)
        io.to(room).emit("chat_message", {
            from: "System",
            content: `${socket.id} has joined the room`,
        });
        console.log("userlist:", users[room]);
    });

    // Handle chat messages for a room
    socket.on("chat_message", ({ room, content }) => {
        console.log(content);
        console.log('afdas');
        io.to(room).emit("chat_message", { from: socket.id, content });
    });

    socket.on("music", ({ room, content }) => {
        io.to(room).emit("music", { from: socket.id, content });
    });

    // socket.on("syncMusic", ({ room, time, seek }) => {
    //     io.to(room).emit("syncMusic", { from: socket.id, time,seek });
    //     const content={
    //         action:"play-cont",
    //         startTime:time+3000,
    //         seek: seek + 3.0
    //     }
    //     console.log("fads");
    //     io.to(room).emit("music", { from: socket.id, content });
    // });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        let index = users[roomMap[socket.id]]?.indexOf(socket.id);
        while(index>-1){
            users[roomMap[socket.id]].splice(index, 1);
            index = users[roomMap[socket.id]]?.indexOf(socket.id);
        }
    });
});

app.get("/audio/:file", (req, res) => {
    const filePath = `./audio/${req.params.file}`;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "audio/mpeg",
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "audio/mpeg",
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

app.get('/', (req, res) => {
    res.send("Server is Running here...")
});



const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`App running in port ${PORT}`);
});
