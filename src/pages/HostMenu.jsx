import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom";
import { InfoRoomContext } from "../App";
import {io} from 'socket.io-client'
import { getUsername } from "../utils/user";


const HostMenu = () => {

    // const socket = io.connect("http://localhost:3001");

    const [results,roomId, setRoomId,nickname, setNickname, lobbyInfo,setLobbyInfo,socket] = useContext(InfoRoomContext);
    
    const [selectedParticipant, setSelectedParticipant] = useState("No one");

    const [hasBeenSelected, setHasBeenSelected] = useState(localStorage.getItem('hasBeenSelected')?JSON.parse(localStorage.getItem('hasBeenSelected')):[]);

    const [isVoting, setIsVoting] = useState(false);

    const [currentRound, setCurrentRound] = useState(localStorage.getItem('currentRound')? Number(localStorage.getItem('currentRound')):1);

    const [scoring, setScoring] = useState(localStorage.getItem('finalResults')?JSON.parse(localStorage.getItem('finalResults')):{});

    const [voters, setVoters] = useState([])

    useEffect(()=>{

        const handleBeforeUnload = () =>{
            if(isVoting)
                socket.emit('endVoting',lobbyInfo.id,nickname);
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    })

    useEffect(()=>{
        if(currentRound.toString() > lobbyInfo.rounds)
            {
                console.log("End")
                socket.emit('endVoting',lobbyInfo.id,nickname);
                
                

            }
            console.log(currentRound," saved")
            localStorage.setItem('currentRound',currentRound);
    },[currentRound])

    useEffect(()=>{
        let voter = []
        let totalVotes = {}
        for(const part of lobbyInfo.participants)
            totalVotes[part] = 0;
        for(const arr of Object.values(results))
        {
            arr.forEach(vote => {
                if(!voter.find((el)=>{return el == vote.username}))
                    voter.push(vote.username);
                
                totalVotes[vote.for] += vote.grade
            });
        }
        console.log(results,voter,lobbyInfo);
        setVoters(voter);
        localStorage.setItem("finalResults",JSON.stringify(totalVotes));
        console.log(localStorage.getItem('finalResults'), 'temp res');
        setScoring(totalVotes);
    },[results, lobbyInfo])


    const convertToCSV = (data) => {
        const csvRows = [];
        const headers = ['Name','Score'];
        csvRows.push(headers.join(','));
    
        for (const [key,value] of Object.entries(data)) {
            const values = [key,value]
            csvRows.push(values.join(','));
        }
    
        return csvRows.join('\n');
    };

    const handleDownload = (data) => {
        const csvData = convertToCSV(data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'results.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const MakeSelection = (participant) => {
        setSelectedParticipant(participant);
    }

    const StartVote = () =>{
        if(selectedParticipant === "No one")
        {
            alert("No participant selected");
            return;
        }
        setIsVoting(true);
        setHasBeenSelected([...hasBeenSelected, selectedParticipant])
        localStorage.setItem("hasBeenSelected",JSON.stringify([...hasBeenSelected, selectedParticipant]));
        console.log(JSON.parse(localStorage.getItem('hasBeenSelected')), "select");
        socket.emit("createVoting", lobbyInfo.id,getUsername(), `Round ${currentRound}: ${selectedParticipant}`, currentRound,selectedParticipant);
        console.log("started")
    }
 
    const StopVote = () =>{
        // console.log(lobbyInfo)

        

        setSelectedParticipant("No one");
        // console.log(currentRound.toString() , lobbyInfo.rounds, currentRound.toString() > lobbyInfo.rounds)
        

        if(hasBeenSelected.length === lobbyInfo.participants.length)
            {
                setCurrentRound(currentRound+1);
                localStorage.setItem('hasBeenSelected',JSON.stringify([]));
                setHasBeenSelected([]);
            }
        setIsVoting(false)
            
        socket.emit("stopVoting",lobbyInfo.id, nickname);
        // socket.emit("votingResults","test")

        
    }


   
    
    return (
        <div className="text-white min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black  flex flex-col gap-10 py-32 items-center">
            <div className="flex flex-col justify-center items-center gap-2">
                { lobbyInfo.rounds >= currentRound ? <h1 className="text-7xl outline-text">Round {currentRound}</h1> : <h1 className="text-7xl outline-text">Final Results</h1>}
                <h3 className="text-2xl">Room: {lobbyInfo.id}</h3>
            </div>
            {lobbyInfo.rounds >= currentRound &&
            <div className="w-[100%] flex flex-col justify-center items-center gap-4 ">
            <h2 className="text-3xl">List of Participants</h2>
            <div className="border-4 border-white rounded-xl drop-shadow-lg p-4 flex flex-col gap-2 min-w-[50%] ">
                {lobbyInfo.participants.map((participant,key)=>{
                    // console.log((hasBeenSelected.find((elem)=>{return elem == participant}) == -1))
                    return (
                        <div className={`flex flex-row items-center content-center justify-between border-2 rounded-lg border-white ${hasBeenSelected.find((elem)=>{return elem === participant}) && " bg-white text-slate-800"} transtion-colors duration-[400ms] gap-1 py-2 px-4`} id={key}>
                            <p className=" p-[6px]">{participant}</p>
                            {(!hasBeenSelected.find((elem)=>{return elem === participant}) && !isVoting) &&  <button className="border-2 border-white rounded-lg p-1 hover:bg-white hover:text-slate-800 transition-colors duration-200" onClick={()=>{MakeSelection(participant)}}>{ selectedParticipant !== participant ? "Chose" : "Selected"}</button>}
                        </div>
                    )
                })}
            </div>
            </div>}
            {lobbyInfo.rounds >= currentRound &&
            <h2 className="text-2xl ">{selectedParticipant} is selected</h2>}
            {lobbyInfo.rounds >= currentRound && <div className="flex flex-col gap-5 ">
               {!isVoting && <button className="bg-white border-2  rounded-xl text-slate-800 hover:bg-transparent hover:text-white transition-colors duration-200 p-2 text-xl" onClick={()=>{StartVote()}}>Start Vote</button>}
               {isVoting && <button className="bg-white border-2  rounded-xl text-slate-800 hover:bg-transparent hover:text-white transition-colors duration-200 p-2 text-xl" onClick={()=>{StopVote()}}>Stop Vote</button>}
            </div>}
            {
                lobbyInfo.rounds < currentRound && 
                <div className="flex flex-col justify-evenly items-center w-[90%] h-auto gap-10 ">
                {
                   Object.entries(results).map(([key,round])=>{
                        console.log(key,round)
                        return(
                            <div className="flex flex-col items-center gap-3">
                            <h1 className="text-2xl">Results Round: {key}</h1>
                            <table className="border-2 border-white">
                                <thead className="border-2">
                                    <tr>
                                    <th className="p-2">Name</th>
                                    {voters.map((el)=>{
                                        return (<th className="p-2 border-2 border-white">{el}</th>)
                                    })}
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    lobbyInfo.participants.map((part)=>{
                                        return(
                                            <tr className="border-2 border-white">
                                                <td className="p-2 border-2 border-white">{part}</td>
                                                {
                                                    voters.map((vot)=>{
                                                        let grade = 0
                                                        for(const note of round)
                                                        {
                                                            console.log(note)
                                                            if(note.for == part && note.username == vot)
                                                                grade = note.grade;
                                                        }
                                                        return (
                                                            <td className="p-2 border-2 border-white ">{grade}</td>
                                                        )
                                                    })
                                                }
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </table>
                            </div>
                        )
                    })
                }
                <h2 className="text-2xl">Final Results</h2>
                <table className="border-2 border-white">
                    <thead className="border-2 border-white">
                        <tr className="border-2 border-white">
                            <th className="p-2 order-2 border-white">Name</th>
                            <th className="p-2 border-2 border-white">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(scoring).map(([key,score])=>{
                            return(
                                <tr className="border-2 border-white">
                                    <td className="p-2 border-2 border-white">{key}</td>
                                    <td className="p-2 border-2 border-white">{score}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <button className="border-2 border-white hover:bg-white hover:text-slate-800 text-white p-2 rounded-lg duration-200 transition-colors" onClick={()=>{handleDownload(scoring)}}>
                    Download Final Results
                </button>
            </div>
            }
            
        </div>
    )
}

export default HostMenu