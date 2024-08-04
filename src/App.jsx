import { useState } from 'react'
import { io } from 'socket.io-client'
import { useEffect, createContext } from 'react'

import Home from './pages/Home';
import HostMenu from './pages/HostMenu';
import HostView from './pages/HostView';
import VoteView from './pages/VoterView';

// import { InfoRoomProvider } from './context/InfoRoom';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { getUsername } from './utils/user';

const socket = io.connect("http://localhost:3001");

export const InfoRoomContext = createContext();

function App() {
  const [message, setMessage] = useState("")
  const [messageReceived, setMessageReceived] = useState("");

  const [roomId, setRoomId] = useState(localStorage.getItem('roomId')?localStorage.getItem('roomId'):'0')
  const [nickname, setNickname] = useState("one")
  const [lobbyInfo, setLobbyInfo] = useState(localStorage.getItem('lobbyInfo')?JSON.parse(localStorage.getItem('lobbyInfo')):{id:0,maximum:0,rounds:0,participants:[]});

  const [question, setQuestion] = useState("");
  const [isVoting, setIsVoting] = useState(false)
  const [round, setRound] = useState(0)
  const [participant,setParticipant] = useState("")
  const [results, setResults] = useState(localStorage.getItem('results')?JSON.parse(localStorage.getItem('results')):{})

  // useEffect(()=>{
  //   socket.on("receive_message", (data) => {
  //     setMessageReceived(data.message);
  //   })
  // },[socket])

  

  useEffect(()=>{

    if(localStorage.getItem('lobbyInfo'))
      {setLobbyInfo(JSON.parse(localStorage.getItem('lobbyInfo'))); console.log(lobbyInfo)}
    if(localStorage.getItem('username'))
      setNickname(localStorage.getItem('username'))
    if(localStorage.getItem('currentRound'))
      setRound(Number(localStorage.getItem('currentRound')))
    console.log(lobbyInfo, localStorage.getItem('lobbyInfo'))
    console.log(localStorage.getItem('results'),'res')
  },[])

  useEffect(()=>{
    console.log("Logging")
    console.log("Checking",getUsername())
    socket.emit("checkConnection",getUsername(),localStorage.getItem('roomId')?localStorage.getItem('roomId'):'0');
    socket.on('votingResults',(result)=>{
        console.log("Voting Results",result);
        setResults(result);
        localStorage.setItem('results',JSON.stringify(result));
        console.log(localStorage.getItem('results'))
    });
    socket.on('stopVote',()=>{
      console.log("Round ended for ",socket.id);
      setIsVoting(false);
    })
    
    socket.on('newVoting',(quest, numberRound,participant)=>{
      setQuestion(quest);
      setIsVoting(true);
      setRound(numberRound);
      setParticipant(participant);
      console.log("Vote Emited")
  })


    return ()=>{
      socket.off('votingResults');
      socket.off('stopVote');
      socket.off('newVoting');

    }
    
},[socket])




  const sendMessage = () =>{
      socket.emit("send_message", {message})
  }

  
  return (
    <>
      <input placeholder='Message...' onChange={(event)=>{
        setMessage(event.target.value);
      }}/>
      <button onClick={sendMessage}>Send Message</button>
      <h1>Message:</h1>
      {messageReceived}
      <Router>
      <InfoRoomContext.Provider value={[results,roomId, setRoomId, nickname, setNickname, lobbyInfo,setLobbyInfo, socket, question,round,participant, isVoting,setIsVoting]}>

         <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/host" element={<HostView/>}/>
            <Route path='/hostroom' element={<HostMenu/>}/>
            <Route path='/voteroom' element={<VoteView/>}/>
          </Routes>
          <h1>{roomId}</h1>
          <h1>{nickname}</h1>
      </InfoRoomContext.Provider>

      </Router>
      
      
    </>
  )
}

export default App
