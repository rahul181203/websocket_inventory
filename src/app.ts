import express,{Request,Response,NextFunction} from 'express';
import {Server} from "socket.io"
const http = require("http")
import {json} from "body-parser"
import dotenv from "dotenv"
import { GetReply } from '../services';

const app = express()
dotenv.config()
app.use(json())
const server = http.createServer(app)
const io = new Server({cors:{origin:"http://localhost:3000"}}) 

io.on("connection",(socket)=>{
    console.log("user connected",socket.id);

    socket.on("new message",async (msg)=>{
        console.log("recieved: ",msg);
        const data = await GetReply(msg.msg)
        
        socket.emit("reply",{from:"AI",msg:data.ans})
    })

})

io.listen(9000)