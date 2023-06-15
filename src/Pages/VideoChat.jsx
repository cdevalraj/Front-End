import React, { useEffect, useRef, useState } from "react";
import './styles/videostyles.css'
import useSocket from "../hooks/useSocket";
import { useNavigate, useParams } from "react-router-dom";
const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

// async function getdevice(constraints, setStream, setter) {
//   try {
//     const stream = await navigator.mediaDevices.getDisplayMedia(constraints)
//     setStream(stream)
//     stream.getTracks()[0].addEventListener('ended', () => {
//       setter(false)
//     })
//     document.getElementById('screen').srcObject = stream
//   } catch (error) {
//     console.error('Error accessing media devices.', error.message);
//     setScreen(false)
//   }
// }

const VideoChatPage = () => {
    const localStream = useRef(null);
    const remoteStreams = useRef({});
    const peerConnections = useRef({});
    // const [screenStream, setScreenStream] = useState(null)
    // const [screen, setScreen] = useState(false);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const { roomId } = useParams();
    const socket = useRef(useSocket());
    const USERID = useRef('');
    const ICE_Candidates = useRef({});
    const nav = useNavigate();
    useEffect(() => {
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks()[0].addEventListener('ended', () => {
                    // handle this ended event
                });
                localStream.current.srcObject = stream;
            } catch (error) {
                console.log('Error accessing media devices:', error.message);
            }
        };
        startMedia();
        socket.current.connect();
        socket.current.emit('join-room', roomId);
        socket.current.on('response', (Uid) => { USERID.current = Uid; })
        socket.current.on('user-disconnected', (disconnectedUserId) => {
            handleUserDisconnected(disconnectedUserId);
        });
        socket.current.on('New-User', (userId) => {
            if (peerConnections.current[userId] === undefined) {
                createPeerConnection(userId);
                CreatingOffer(userId);
            }
        });
        socket.current.on('Listen-Offer', ({ offer, fromUserId }) => {
            if (peerConnections.current[fromUserId] === undefined) {
                createPeerConnection(fromUserId);
                AnsweringOffer(offer, fromUserId);
                settingICE_Candidates(fromUserId);
            }
        });
        socket.current.on('Listen-Answer', ({ answer, fromUserId }) => {
            settingRemoteDescription(answer, fromUserId);
            settingICE_Candidates(fromUserId);
        });
        socket.current.on('Listen-ICE', ({ candidate, fromUserId }) => {
            AddingIceCandidates(fromUserId, candidate);
        });
        socket.current.on('user-disconnected', (disconnectedUserId) => {
            handleUserDisconnected(disconnectedUserId);
        });
        return () => {
            socket.current.disconnect();
        }
    }, [])


    // screen
    // useEffect(() => {
    //   const constraints = {
    //     video: {
    //       cursor: 'always' | 'motion' | 'never',
    //       displaySurface: 'application' | 'browser' | 'monitor' | 'window'
    //     }
    //   };
    //   if (screen) {
    //     if (!document.getElementById('screen')) {
    //       let ele = document.getElementById('local-stream')
    //       ele.setAttribute('class', 'video');
    //       createVideoElement(document.getElementById('video-streams'), 'screen')
    //     }
    //     getdevice(constraints, setScreenStream, setScreen)
    //   }
    //   else {
    //     const element = document.getElementById('screen')
    //     if (element) {
    //       element.parentNode.removeChild(element);
    //       let ele = document.getElementById('local-stream')
    //       ele.setAttribute('class', '');
    //     }
    //     if (screenStream !== null)
    //       screenStream.getTracks().forEach(function (track) { track.stop(); });
    //     setScreenStream(null);
    //   }
    // }, [screen])

    const createPeerConnection = (userId) => {
        if (peerConnections.current[userId] === undefined) {
            let pc = new RTCPeerConnection(servers);
            // Add local stream to the peer connection
            localStream.current.srcObject.getTracks().forEach((track) => {
                pc.addTrack(track, localStream.current.srcObject);
            });
            pc.ontrack = (event) => handleRemoteTrackAdded(event, userId);
            // Update peer connections state
            peerConnections.current[userId] = pc;
        }
    };

    const CreatingOffer = async (userId) => {
        let pc = peerConnections.current[userId];
        if (pc.localDescription === null) {
            try {
                pc.onicecandidate = (event) => handleICECandidate(event, userId);
                let offerDescription = await pc.createOffer();
                await pc.setLocalDescription(offerDescription);

                let offer = {
                    sdp: offerDescription.sdp,
                    type: offerDescription.type,
                };
                socket.current.emit('offer', { offer, fromUserId: USERID.current, toUserId: userId });
            }
            catch (er) {
                console.log(er.message);
            }
        }
    };

    const AnsweringOffer = async (offer, userId) => {
        let pc = peerConnections.current[userId];
        if (pc.localDescription === null) {
            try {
                pc.onicecandidate = (event) => handleICECandidate(event, userId);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));

                let answerDescription = await pc.createAnswer();
                await pc.setLocalDescription(answerDescription);
                let answer = {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                };
                socket.current.emit('answer', { answer, fromUserId: USERID.current, toUserId: userId });
            }
            catch (er) {
                console.log(er.message);
            }
        }
    };

    const AddingIceCandidates = async (userId, candidate) => {
        if (ICE_Candidates.current[userId] === undefined)
            ICE_Candidates.current[userId] = [candidate];
        else
            ICE_Candidates.current[userId].push(candidate);
    };

    const settingRemoteDescription = async (answer, userId) => {
        let pc = peerConnections.current[userId];
        if (pc.currentRemoteDescription === null) {
            try {
                let answerDescription = new RTCSessionDescription(answer);
                await pc.setRemoteDescription(answerDescription);
            }
            catch (er) {
                console.log(er.message);
            }
        }
    };

    const settingICE_Candidates = async (userId) => {
        let pc = peerConnections.current[userId];
        let candidates = ICE_Candidates.current[userId];
        try {
            candidates.forEach(async (candidate) => {
                let c = new RTCIceCandidate(candidate);
                await pc.addIceCandidate(c);
            });
        }
        catch (er) {
            console.log(er.message);
        }
    };

    const handleICECandidate = (event, userId) => {
        if (event.candidate !== undefined && event.candidate !== null) {
            socket.current.emit('ice-candidate', { candidate: event.candidate, fromUserId: USERID.current, toUserId: userId });
        }
    };

    const handleRemoteTrackAdded = (event, userId) => {
        let remoteVideo = document.getElementById(`remote-stream-${userId}`);
        if (!remoteVideo) {
            // Create a new video element for the remote user
            remoteVideo = document.createElement('video');
            remoteVideo.setAttribute('id', `remote-stream-${userId}`);
            remoteVideo.autoplay = true;
            remoteVideo.playsInline = true;
            remoteVideo.controls = false;
        }
        let remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
        // Update the reference object
        let updatedRemoteVideos = { ...remoteStreams.current };
        updatedRemoteVideos[userId] = remoteVideo;
        remoteStreams.current = updatedRemoteVideos;

        // Append the video element to the DOM
        let remoteVideosContainer = document.getElementById('remote-streams');
        remoteVideosContainer.appendChild(remoteVideo);
    };

    const handleUserDisconnected = (disconnectedUserId) => {
        let pc = peerConnections.current[disconnectedUserId];
        if (pc) {
            pc.close();
        }

        // Remove remote video element
        // let remoteVideo = remoteStreams.current[disconnectedUserId];

        // if (remoteVideo) {
        //     remoteVideo.parentNode.removeChild(remoteVideo);
        // }

        let ele = document.getElementById(`remote-stream-${disconnectedUserId}`);
        if (ele) {
            ele.parentNode.removeChild(ele);
        }

        delete remoteStreams.current[disconnectedUserId];

        // Update peer connections state
        delete peerConnections.current[disconnectedUserId];

        delete ICE_Candidates.current[disconnectedUserId];
    };

    const toggleAudio = () => {
        let enabled = !audio;
        setAudio(enabled);
        localStream.current.srcObject.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };

    const toggleVideo = () => {
        let enabled = !video;
        setVideo(enabled);
        localStream.current.srcObject.getVideoTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };

    const handleLeave = () => {
        localStream.current.srcObject.getTracks().forEach((track) => {
            track.stop();
        })
        nav('/video');
    };

    return (
        <div id="stream-wrapper">
            <div id="streams">
                <video id="local-stream" ref={localStream} autoPlay muted />
                <div id="remote-streams"></div>
            </div>
            <div id="stream-controls">
                <label className="switch">
                    <input checked={video} type="checkbox" onChange={toggleVideo} />
                    <span className="slider round"></span>
                </label>
                <label className="switch">
                    <input checked={audio} type="checkbox" onChange={toggleAudio} />
                    <span className="slider round"></span>
                </label>
                <button id="bt" onClick={() => setScreen(x => !x)}>{!screen ? "share screen" : "stop sharing"}</button>
                <button onClick={handleLeave}>leave</button>
            </div>
        </div>
    );
};

export default VideoChatPage;