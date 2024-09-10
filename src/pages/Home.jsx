import { useContext, useEffect, useState } from "react"
import { InfoRoomContext } from "../App"
import { useNavigate } from "react-router-dom";
import { getUserId, setUsername } from "../utils/user";
import { io } from "socket.io-client";
const Home = () => {

    const [results,roomId, setRoomId, nickname, setNickname, lobbyInfo,setLobbyInfo, socket] = useContext(InfoRoomContext);
    const navigate = useNavigate()

    useEffect(()=>{
        setLobbyInfo({id:0,maximum:0,rounds:0,participants:[]})
        localStorage.setItem('lobbyInfo',JSON.stringify({id:0,maximum:0,rounds:0,participants:[]}))
        setNickname("");
        localStorage.setItem("username","");
        localStorage.setItem('currentRound',1);
        localStorage.setItem('results',JSON.stringify({}));
        localStorage.setItem('hasBeenSelected',JSON.stringify([]));
        localStorage.setItem('finalResults',JSON.stringify({}));
        localStorage.setItem('roomId','0');
    },[])

    const JoinRoom = () =>{
        if(nickname.length > 0 && roomId.length > 0)
        { 
            setUsername(nickname);
            localStorage.setItem('username',nickname);
            localStorage.setItem('roomId', roomId)
            
            socket.emit("joinLobby",roomId, nickname, (success, host) =>{
                if(success){
                    if(host){
                        localStorage.setItem("host",true);
                    }
                    console.log("joined lobby");

                }
                else{
                    alert("Lobby not found");
                }
            })


            navigate('/voteroom')
        }
        else 
        alert("Invalide information to connect")
    }

    const HostRoom = () => {
        if(nickname.length <= 0)
        {
            alert("Must have a admin username");
            return;
        }
        setUsername(nickname);
        navigate('/host')
    }

    return (
        <div className="gap-10 h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black  flex flex-col justify-center items-center">
            <h1 className="outline-text text-2xl xxsm:text-4xl xsm:text-5xl sm:text-7xl  md:text-8xl  hover:text-white transition-colors duration-300 ">Rating Space</h1>
            <button onClick={HostRoom} className="w-[80%] xsm:w-[280px] text-white border-2 xxsm:px-8 py-1 text-2xl transition-colors duration-300 hover:text-slate-600 hover:bg-white  rounded-md ">Host Room</button>
           <div className="flex flex-col justify-center gap-2 w-[80%] xsm:w-[280px] p-2 xxsm:p-8 border-white border-2 rounded-xl">
           <div>
                <legend className="text-white">Nickname</legend>
                <input onChange={(e)=>{setNickname(e.target.value)}} className="w-[100%] xsm:w-auto border-2 bg-transparent px-3 py-1 rounded-2xl text-white" type="text" placeholder="Your name"/>
            </div>
            <div>
                <legend className="text-white">Room Id</legend>
                <input onChange={(e) =>{setRoomId(e.target.value)}} className="w-[100%] xsm:w-auto border-2 bg-transparent px-3 py-1 rounded-2xl text-white" type="text" placeholder="#01234"/>
            </div>
             <button onClick={JoinRoom} className="text-white border-2 mt-4 xxsm:px-8 py-1  text-2xl transition-colors duration-300 hover:text-slate-600 hover:bg-white  rounded-md ">Join</button>

           </div>
        </div>
    )
}

export default Home