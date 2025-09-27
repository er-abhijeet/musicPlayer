// App.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom';

const socket = io(import.meta.env.VITE_BACKEND_URL);

function App() {
  const [userId, setUserId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joiningDialog, setJoiningDialog] = useState(false);
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const handlePrivateMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("private_message", handlePrivateMessage);

    return () => {
      socket.off("private_message", handlePrivateMessage);
    };
  }, []);


  // const registerUser = () => {
  //   socket.emit("register", userId);
  // };

  // const sendMessage = () => {
  //   socket.emit("private_message", { content: message, to: recipientId });
  //   setMessages((prev) => [...prev, { content: message, from: "Me" }]);
  //   setMessage("");
  // };
  const handleJoin=()=>{
    if(roomId.trim()){
      navigate('/room/'+roomId);
    }
  }

  return (
    <>
      <div className=" w-screen">
        <div className="w-100%  flex justify-center items-center flex-col">
          <h1 className="my-4">Rooms</h1>
          {/* <button className="mx-4 my-4">Create room</button> */}
          <button className="mx-4 my-4" onClick={() => setJoiningDialog(true)}>Join room</button>
        </div>
        {/* <h2>Private Chat</h2>
        <input
          placeholder="Your user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={registerUser}>Register</button>

        <input
          placeholder="Recipient ID"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
        />
        <input
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>

        <ul>
          {messages.map((m, i) => (
            <li key={i}>
              <strong>{m.from}:</strong> {m.content}
            </li>
          ))}
        </ul> */}
      </div>
      {joiningDialog && <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded">
          <h2 className="mb-4 text-black">Join Room</h2>
          <input
            placeholder="Room ID"
            className="border p-2 mb-4 w-full border-black text-black"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="bg-blue-500 text-white p-2 rounded mr-2" onClick={handleJoin}>Join</button>
          <button className="bg-gray-500 text-white p-2 rounded" onClick={() => setJoiningDialog(false)}>Cancel</button>
        </div>
      </div>}
    </>

  );
}

export default App;
