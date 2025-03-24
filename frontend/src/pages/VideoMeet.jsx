import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Badge,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";
import "../App.css";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) setVideoAvailable(true);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) setAudioAvailable(true);

      if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        window.localStream = userMediaStream;
        if (localVideoref.current) localVideoref.current.srcObject = userMediaStream;
      }
    } catch (error) {
      console.error("Error getting media permissions:", error);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) getUserMedia();
  }, [video, audio]);

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          let tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoref.current.srcObject = window.localStream;

        for (let id in connections) {
          connections[id].addStream(window.localStream);

          connections[id]
            .createOffer()
            .then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
                })
                .catch((e) => console.log(e));
            })
            .catch((e) => console.log(e));
        }
      };
    });
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  const getDislayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDislayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
  }, [screen]);

  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);

        try {
          let tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoref.current.srcObject = window.localStream;

        getUserMedia();
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            const videoExists = videoRef.current.find((video) => video.socketId === socketListId);

            if (videoExists) {
              setVideos((videos) =>
                videos.map((video) => (video.socketId === socketListId ? { ...video, stream: event.stream } : video))
              );
            } else {
              setVideos((videos) => [
                ...videos,
                {
                  socketId: socketListId,
                  stream: event.stream,
                  autoplay: true,
                  playsinline: true,
                },
              ]);
            }
          };

          if (window.localStream) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2]
              .createOffer()
              .then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
                  })
                  .catch((e) => console.log(e));
              })
              .catch((e) => console.log(e));
          }
        }
      });
    });
  };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => setVideo(!video);
  const handleAudio = () => setAudio(!audio);
  const handleScreen = () => setScreen(!screen);
  const handleEndCall = () => {
    try {
      const tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  const openChat = () => {
    setModal(true);
    setNewMessages(0);
  };

  const closeChat = () => setModal(false);

  const handleMessage = (e) => setMessage(e.target.value);

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) setNewMessages((prev) => prev + 1);
  };

  const sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
          <TextField
            label="Enter Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect} sx={{ mt: 2 }}>
            Connect
          </Button>
        </Box>
      ) : (
        <Box>
          {/* Local Video Stream */}
          <video
            ref={localVideoref}
            autoPlay
            playsInline
            muted
            style={{
              width: "300px",
              height: "200px",
              borderRadius: "10px",
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 10,
            }}
          />

          {/* Remote Video Streams */}
          <Box display="flex" flexWrap="wrap" justifyContent="center">
            {videos.map((videoObj) => (
              <Box key={videoObj.socketId} m={2}>
                <video
                  ref={(ref) => {
                    if (ref && videoObj.stream) ref.srcObject = videoObj.stream;
                  }}
                  autoPlay
                  playsInline
                  style={{ width: "300px", height: "200px", borderRadius: "10px" }}
                />
              </Box>
            ))}
          </Box>

          {/* Controls */}
          <Box display="flex" gap={2} justifyContent="center" mt={2}>
            <IconButton onClick={handleVideo} color={video ? "primary" : "default"}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleAudio} color={audio ? "primary" : "default"}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            <IconButton onClick={handleScreen} color={screen ? "primary" : "default"}>
              {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} color="error">
              <CallEndIcon />
            </IconButton>
            <Badge badgeContent={newMessages} color="secondary">
              <IconButton onClick={openChat}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </Box>

          {/* Chat Modal */}
          {showModal && (
            <Box position="fixed" bottom={0} right={0} width="300px" bgcolor="white" p={2} boxShadow={3}>
              <IconButton onClick={closeChat} sx={{ position: "absolute", top: 5, right: 5 }}>
                <CallEndIcon />
              </IconButton>
              <Box maxHeight="400px" overflow="auto">
                {messages.length > 0 ? (
                  messages.map((item, index) => (
                    <Box key={index} mb={1}>
                      <Typography variant="subtitle2">{item.sender}</Typography>
                      <Typography variant="body1">{item.data}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>No Messages Yet</Typography>
                )}
              </Box>
              <TextField
                fullWidth
                label="Enter Message"
                variant="outlined"
                value={message}
                onChange={handleMessage}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}