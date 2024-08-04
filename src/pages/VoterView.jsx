import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom";
import { InfoRoomContext } from "../App";
import {io} from 'socket.io-client'
import { getUsername } from "../utils/user";


const VoteView = () => {

    const [results,roomId, setRoomId,nickname, setNickname, lobbyInfo,setLobbyInfo,socket, question, round, participant, isVoting, setIsVoting] = useContext(InfoRoomContext);
    
    const [myVote, setMyVote] = useState(0)
    
    const SendVote = () =>{
        console.log(roomId);
        socket.emit("submitVote",roomId,myVote,round,participant)
        setIsVoting(false);
    }
    if(isVoting)
    return (
        <div className="text-white min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black  flex flex-col gap-10 py-32 items-center">
            <h1 className="text-7xl outline-text">Voting Space</h1>
            <p className="text-3xl">{question}</p>
            <div className="grid grid-cols-2 content-center  gap-5">
                <button className="border-2 p-8 border-white  text-3xl  rounded-3xl hover:bg-white hover:text-slate-700 transition-colors duration-200" onClick={()=>{setMyVote(1)}}>1</button>
                <button className="border-2 p-8 border-white  text-3xl  rounded-3xl hover:bg-white hover:text-slate-700 transition-colors duration-200" onClick={()=>{setMyVote(2)}}>2</button>
                <button className="border-2 p-8 border-white  text-3xl  rounded-3xl hover:bg-white hover:text-slate-700 transition-colors duration-200" onClick={()=>{setMyVote(3)}}>3</button>
                <button className="border-2 p-8 border-white  text-3xl  rounded-3xl hover:bg-white hover:text-slate-700 transition-colors duration-200" onClick={()=>{setMyVote(4)}}>4</button>
                <button className="border-2 p-8 border-white  text-3xl  rounded-3xl hover:bg-white hover:text-slate-700 transition-colors duration-200" onClick={()=>{setMyVote(5)}}>5</button>
            </div>
            <h2 className="text-3xl">Vote {myVote} is selected</h2>
            <button className="text-xl p-2 border-white rounded-lg border-2 hover:bg-white hover:text-slate-800 transition-colors duration-200"  onClick={SendVote}>Send Vote</button>
        </div>
    )
    else
    return(
        <div className="text-white min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black  flex flex-col gap-10 py-32 items-center">
            <h1 className="text-4xl">Waiting for the host</h1>
            <h2 className="text-2xl">Connected to room: {roomId}</h2>
        </div>
    )
}

export default VoteView