import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io } from "socket.io-client";

const url = import.meta.env.VITE_BACKEND_URL;
const socket = io(url);


function Room() {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [playing, setPlaying] = useState(false);
    console.log("date: ", Date.now())
    console.log("perfomr: ", performance.now())

    const sendMessage = () => {
        socket.emit("chat_message", { room: roomId, content: message });
        setMessage("");
    }

    useEffect(() => {
        // This runs once when the component mounts
        async function joinRoom() {
            socket.emit("join_room", roomId);
            console.log("Joined room successfully:", roomId);
        }

        joinRoom();
    }, []);

    useEffect(() => {
        const handleMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };

        socket.on("chat_message", handleMessage);

        return () => {
            socket.off("chat_message", handleMessage);
        };
    }, []);

    // useEffect(() => {
    //     if (!playing) return;

    //     const interval = setInterval(() => {
    //         if (audioRef.current) {
    //             socket.emit("syncMusic", {
    //                 room: roomId,
    //                 time: Date.now(),
    //                 seek: audioRef.current.currentTime,
    //             });
    //         }
    //     }, 3000);

    //     return () => clearInterval(interval);
    // }, [playing]); // <--- important!

    useEffect(() => {
        const handleSyncMusic = (msg) => {
            console.log("alu", msg);
        };

        socket.on("syncMusic", handleSyncMusic);

        return () => {
            socket.off("syncMusic", handleSyncMusic);
        };
    }, []);

    useEffect(() => {
        const musicAction = (msg) => {
            // console.log("adsfasd",msg);
            if (msg.content.action === "play") {
                const delay = msg.content.startTime - Date.now();
                if (delay > 0) {
                    audioRef.current.currentTime = msg.content.seek;
                    console.log(msg.content.seek)
                    setTimeout(() => {
                        audioRef.current.play();
                        setPlaying(true);
                    }, delay);
                } else {
                    console.log("shitt!");
                    audioRef.current.currentTime = msg.content.seek;
                    audioRef.current.play();
                }
            }else if (msg.content.action === "pause") {
                audioRef.current.pause();
                setPlaying(false);
            }
            // else if (msg.content.action === "play-cont") {
            //     console.log("playing", playing)
            //     const delay = msg.content.startTime - Date.now();
            //     console.log("delay", delay)
            //     if(!playing)return;
            //     if (delay > 0) {
            //         console.log("synced...")
            //         setTimeout(() => {
            //             audioRef.current.currentTime = msg.content.seek;
            //             audioRef.current.play();
            //             // setPlaying(true);
            //         }, delay);
            //     } else {
            //         console.log("shitt!");
            //         audioRef.current.currentTime = msg.content.seek;
            //         audioRef.current.play();
            //     }
            // }
        };
        socket.on("music", musicAction);
        return () => {
            socket.off("music", musicAction);
        };
    }, [playing]);


    const audioRef = useRef(null);

    const playAudio = () => {
        const content = {
            action: "play",
            startTime: Date.now() + 2000,
            seek: audioRef.current.currentTime
        }
        socket.emit("music", { room: roomId, content })
        // audioRef.current.play();
    };

    const pauseAudio = () => {
        const content = {
            action: "pause"
        }
        socket.emit("music", { room: roomId, content })

        // audioRef.current.pause();
    };

    const jumpTo = (seconds) => {
        audioRef.current.currentTime = seconds;
        // audioRef.current.play(); // optional: auto play after jump
    };


    return (
        <div>
            Room: {roomId}
            <ul>
                {messages.map((m, i) => (
                    <li key={i}>
                        <strong>{m.from}:</strong> {m.content}
                    </li>
                ))}
            </ul>
            <input
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <audio controls ref={audioRef} src={url + "/audio/fred.mp3"} />
            {/* <source  type="audio/mpeg"></source> */}
            {/* </audio> */}
            <div style={{ marginTop: "10px" }}>
                <button onClick={playAudio}>▶️ Play</button>
                <button onClick={pauseAudio}>⏸️ Pause</button>
                <button onClick={() => jumpTo(123)}>⏩ Jump to 2:03</button>
            </div>
        </div>
    )
}

export default Room
