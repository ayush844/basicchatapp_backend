import { da } from "react-day-picker/locale";
import { WebSocketServer, WebSocket } from "ws";


const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket;
    room: string;
}

let userCount = 0;
let allSocket: User[] = []; // its better to use Map here in real world apps

wss.on("connection", (socket)=>{
    // allSocket.push(socket);

    console.log("New client connected");
    userCount++;
    console.log(`Total users: ${userCount}`);
    // here socket is the individual connection that just got connected
    socket.on("message", (message)=>{
        // message will be something like: "{"type": "join"/"chat", "payload": {...}}"
        const data = JSON.parse(message.toString());

        if(data.type === "join"){
            const room = data.payload.roomId;
            allSocket.push({socket, room});
            console.log(`User joined room: ${room}`);
        }


        if(data.type === "chat"){
            const room = allSocket.find((s)=> s.socket === socket)?.room;
            const chatMessage = data.payload.message;
            // broadcast this message to all users in the same room
            allSocket.forEach((socketUser)=>{
                if(socketUser.room === room && socketUser.socket !== socket){
                    socketUser.socket.send(data.payload.message);
                }
            })
        }
    });

    socket.on("close", ()=>{
        // console.log("Client disconnected");
        // userCount--;
        // console.log(`Total users: ${userCount}`);
        // allSocket = allSocket.filter((s)=> s !== socket);
    });
})