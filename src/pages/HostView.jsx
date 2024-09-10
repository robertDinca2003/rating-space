import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom";
import { InfoRoomContext } from "../App";
import { getUsername } from "../utils/user";
import {io} from 'socket.io-client'
const HostView = () => {

    // const [lobbyInfo, setLobbyInfo] = useState({id:0,maximum:0,rounds:0,participants:[]});
    const [results,roomId, setRoomId,nickname, setNickname, lobbyInfo,setLobbyInfo, socket] = useContext(InfoRoomContext);
    const [particpant, setParticipant] = useState("")
    
    // const socket = io("http://localhost:3001");

    const navigate = useNavigate();

    useEffect(()=>{
        const tempVal ="#"+(Math.floor(Math.random()*10000)).toString();
        setLobbyInfo({...lobbyInfo, id:tempVal})
        localStorage.setItem('roomId',tempVal);
        setRoomId(tempVal);

    },[])

    useEffect(()=>{
        localStorage.setItem('lobbyInfo',JSON.stringify(lobbyInfo));
        console.log('savvved')
    },[lobbyInfo])
    

    const StartRoom = () => {
        if(lobbyInfo.maximum <= 0)
        {
            alert("Must have more than 0 voters")
            return;
        }
        if(lobbyInfo.rounds <=0)
        {
            alert("Must hove at least 1 round")
            return;
        }
        if(lobbyInfo.participants.size <=0)
        {
            alert("There must be at least one participant")
            return;
        }
        
        alert("Room Created")

        socket.emit("createLobby", lobbyInfo, getUsername(), (lobbyId) =>{
            localStorage.setItem("host",true);
            
        })
        // socket.emit("joinLobby",lobbyInfo.id,getUsername(),(success, host) =>{
        //     if(success){
        //         if(host){
        //             localStorage.setItem("host",true);
        //             console.log("host")
        //         }
        //         console.log("joined lobby");

        //     }
        //     else{
        //         alert("Lobby not found");
        //     }
        // })
        console.log("test",lobbyInfo)
        localStorage.setItem('lobbyInfo',JSON.stringify(lobbyInfo));
        localStorage.setItem('username',nickname)
        localStorage.setItem('roomId',lobbyInfo.id);
        
        navigate('/hostroom')

    }

    const AddParticipant = () =>{
        if(particpant.length <=0)
        {
            alert("No name")
            return;
        }
        setLobbyInfo({...lobbyInfo, participants: [...lobbyInfo.participants, particpant]});
        setParticipant("");
    }

    const DeleteParticipant = (participant) =>{

        setLobbyInfo({...lobbyInfo, participants: lobbyInfo.participants.filter(item=>item!==participant)})

    }

    return (
        <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black  flex flex-col justify-evenly items-center">
            <div className="text-white text-xl xxsm:text-2xl xsm:text-3xl sm:text-5xl flex flex-col items-center lg:flex-row justify-between w-[80%]">
                <h1 className=" outline-text text-transparent">Host Settings</h1>
                <h1 className=" outline-text text-transparent">Room Id:  <span className="text-white">{lobbyInfo.id}</span></h1>
            </div>
            
            <div className="text-white border-2 border-white p-1 w-[90%] xsm:w-auto  xsm:p-4 rounded-2xl text-lg flex flex-col gap-4">
                <div>
                    <legend>Maximum Voters: </legend>
                    <input onChange={(e)=>{setLobbyInfo({...lobbyInfo,maximum:e.target.value})}} type="number" placeholder="Insert a number" className="w-[100%] bg-transparent border-2 border-white rounded-lg p-1 text-white"/>
                </div>
                <div>
                    <legend>Rounds: </legend>
                    <input onChange={(e)=>{setLobbyInfo({...lobbyInfo,rounds:e.target.value})}} type="number" placeholder="Insert a number" className="w-[100%] bg-transparent border-2 border-white rounded-lg p-1 text-white"/>
                </div>
                <div className="flex flex-col ">
                    <legend>Participat Name:</legend>
                    <div className="flex flex-row w-[100%]">
                        <input value={particpant} onChange={(e)=>{setParticipant(e.target.value)}} placeholder="Insert a name" className="w-[80%] bg-transparent border-2 border-white rounded-l-lg p-1 text-white"/>
                        <button onClick={AddParticipant} className="w-[20%] bg-transparent border-2 border-white rounded-r-lg p-1 hover:bg-white hover:text-slate-900 transition-colors duration-200 text-white">Add</button>
                    </div>
                </div>
                

                <div>
                    <h1>List of participants</h1>
                    {lobbyInfo.participants.map((participant)=>{return (<div className="flex justify-between px-4 border-2 border-white rounded-xl"><h1>{participant}</h1> <button onClick={()=>{console.log(participant);DeleteParticipant(participant)}}>X</button></div>)})}
                </div>
            </div>
            <button onClick={StartRoom} className="bg-white text-3xl py-1 px-2 rounded-lg  text-slate-800 border-2 hover:bg-transparent hover:text-white transition-colors duration-200" >Start Room</button>
        </div>
    )
}

export default HostView