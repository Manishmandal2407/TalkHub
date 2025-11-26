import React from 'react'
import { io } from "socket.io-client"
import { useEffect,useState } from 'react';
import { Container, TextField, Typography, Button,Box, Stack} from '@mui/material';
import { useMemo } from 'react';

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000", {
    withCredentials:true,
  }),[]);

    const [messages, setMessages] = useState([]);
const [message, setMessage]=useState("")
const [Room, setRoom]=useState("")
  const [SocketID, setSocketID] = useState("")
  const [RoomName,setRoomName] = useState("")
  

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", Room,message);
    setMessage("")
  }
  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("Join-Room", RoomName);
    setRoomName("");
  }

  useEffect(() => {
    socket.on("connect", () => { 
      setSocketID(socket.id)
      console.log("connected", socket.id)
    })

    socket.on("receive-message", (message) => {
      console.log(message)
      setMessages((messages)=>[...messages,message])
    });
  
    socket.on("welcome", (s) => {
      console.log(s)
    })
    return () => {
      socket.disconnect();
    }
},[])

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: 160 }} />
      <Typography variant="h1" component="div" gutterBottom>
        Welcome to ChatApp
      </Typography>

      <Typography variant="h6" component="div" gutterBottom>
        {SocketID}
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <h5>Join Room</h5>
        <TextField
          value={RoomName}
          onChange={(e) => setRoomName(e.target.value)}
          id="outlined-basic"
          label="RoomName"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Join
        </Button>
      </form>

      <form onSubmit={handleSubmit}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="outlined-basic"
          label="Message"
          variant="outlined"
        />

        <TextField
          value={Room}
          onChange={(e) => setRoom(e.target.value)}
          id="outlined-basic"
          label="Room"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>

      <Stack>
        {messages.map((m, i) => (
          <Typography key={i} variant="h6" component="div" gutterbottom>
            {m}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
}

export default App
