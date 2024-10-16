import express,{Request,Response,NextFunction} from 'express';
import {Server} from "socket.io"
import {json} from "body-parser"
import dotenv from "dotenv"
import { GetReply } from '../services';
import cors from "cors"

export const app = express()
dotenv.config()
app.use(json())
app.use(cors({
    origin:"*",
    methods:["GET","POST"]
}))

app.get('/',(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({msg:"running succesfully"});
})


const expressServer = app.listen("9000",()=>{
    console.log("listing on 9000");
})

export const io = new Server(expressServer,{
    path:"/socket.io",
    cors:{
        origin:["http://localhost:3000","https://inventory.rahul1812.tech/","https://smartphoneservice.vercel.app/"],
        methods:["GET","POST"],
        allowedHeaders:["Content-Type","Access-Control-Allow-Origin"]
    },
    serveClient:false,
    pingInterval:10000,
    pingTimeout:5000,
    cookie:false
}) 

io.on("connection",(socket)=>{
    console.log("user connected",socket.id);

    socket.on("new message",async (msg)=>{
        console.log("recieved: ",msg);
        const data = await GetReply(msg.msg)
        
        socket.emit("reply",{from:"AI",msg:data.ans})
    })

})