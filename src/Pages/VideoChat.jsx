import React, { useEffect, useRef, useState } from "react";
import './styles/videostyles.css'
import useSocket from "../hooks/useSocket";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import allowImg from '../assets/allowImg.png';
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
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const location = useLocation();
    const vid = localStorage.getItem('video') !== null && localStorage.getItem('video') === 'true';
    const aud = localStorage.getItem('audio') !== null && localStorage.getItem('audio') === 'true';
    const enableVideo = (location.state !== null && location.state.enableVideo) ? location.state.enableVideo : vid;
    const enableAudio = (location.state !== null && location.state.enableAudio) ? location.state.enableAudio : aud;
    const localStream = useRef(null);
    const remoteStreams = useRef({});
    const [remoteStreamKeys, setRemoteStreamKeys] = useState([]);
    const peerConnections = useRef({});
    // const [screenStream, setScreenStream] = useState(null)
    // const [screen, setScreen] = useState(false);
    const [video, setVideo] = useState({ enabled: enableVideo });
    const [audio, setAudio] = useState({ enabled: enableAudio });
    const av = useRef((enableVideo && enableAudio) ? 2 : (enableVideo || enableAudio) ? 1 : 0);
    const { roomId } = useParams();
    const socket = useRef(useSocket());
    const USERID = useRef('');
    const ICE_Candidates = useRef({});
    const nav = useNavigate();

    useEffect(() => {
        async function CheckRoom() {
            try {
                const res = await axiosPrivate.post('/room/verify',
                    JSON.stringify({ roomId }),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${auth.accessToken}`
                        }
                    }
                );
            }
            catch (er) {
                if (er.response.status === 401 || er.response.status === 403) {
                    nav('/video');
                }
                console.log(er.message);
            }
        }
        CheckRoom();
        socket.current.connect();
        socket.current.emit('join-room', roomId);
        socket.current.on('response', (Uid) => {
            USERID.current = Uid;

        });
        socket.current.on('New-User', (userId) => {
            if (peerConnections.current[userId] === undefined) {
                if (remoteStreamKeys.indexOf(userId) === -1) {
                    setRemoteStreamKeys((x) => [...x, userId]);
                }
                createPeerConnection(userId);
                CreatingOffer(userId);
            }
        });
        socket.current.on('Listen-Offer', ({ offer, fromUserId }) => {
            if (peerConnections.current[fromUserId] === undefined) {
                if (remoteStreamKeys.indexOf(fromUserId) === -1) {
                    setRemoteStreamKeys((x) => [...x, fromUserId]);
                }
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
            if (peerConnections.current[disconnectedUserId] !== undefined) {
                handleUserDisconnected(disconnectedUserId);
            }
        });
        return () => {
            localStorage.removeItem('video');
            localStorage.removeItem('audio');
            socket.current.disconnect();
            if (localStream.current !== null && localStream.current.srcObject !== null) {
                localStream.current.srcObject.getTracks().forEach((track) => {
                    track.stop();
                });
                localStream.current.srcObject = null;
            }
        }
    }, []);


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
            if (localStream.current.srcObject !== null) {
                localStream.current.srcObject.getTracks().forEach((track) => {
                    pc.addTrack(track, localStream.current.srcObject);
                });
            }
            // else
            // {}

            // Use the following event if you need to handle state change of connection between peers
            // pc.onconnectionstatechange = (event) => {
            //     // console.log(pc.connectionState);
            //     if (pc.connectionState === 'connected') {
            //         console.log("Peers Connected");
            //     }
            // };
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
                let offerDescription = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
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
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
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
            if (candidates !== undefined) {

                candidates.forEach(async (candidate) => {
                    let c = new RTCIceCandidate(candidate);
                    await pc.addIceCandidate(c);
                });
            }
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
            remoteVideo.setAttribute('class', 'remote-stream');
            remoteVideo.autoplay = true;
            remoteVideo.controls = false;
            remoteVideo.playsInline = true;
        }
        const handleclick = () => {
            remoteVideo.removeEventListener('click', handleclick, true);
            remoteVideo.play();
        }
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.addEventListener('click', handleclick, true);
        if (remoteVideo.paused === true) {
            remoteVideo.poster = allowImg;
        }

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

        let ele = document.getElementById(`remote-stream-${disconnectedUserId}`);
        if (ele) {
            ele.parentNode.removeChild(ele);
        }

        // setRemoteStreamKeys((x) => x.filter((ele) => ele !== disconnectedUserId));

        delete remoteStreams.current[disconnectedUserId];

        // Update peer connections state
        delete peerConnections.current[disconnectedUserId];

        delete ICE_Candidates.current[disconnectedUserId];
    };

    const handleReconnection = () => {
        // handle the logic for reconnecting peers
        // console.log('Reconnection Needed');
        remoteStreamKeys.forEach((userId) => {
            handleUserDisconnected(userId);
        });
        socket.current.emit('Re-Connection', USERID.current);
    };

    const handleLeave = () => {
        if (localStream.current !== null && localStream.current.srcObject !== null) {
            localStream.current.srcObject.getTracks().forEach((track) => {
                track.stop();
            });
            localStream.current.srcObject = null;
        }
        nav('/video');
    };

    useEffect(() => {
        localStorage.setItem('video', video.enabled);
        localStorage.setItem('audio', audio.enabled);
        const startMediaCapture = async (constraints) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                stream.getTracks().forEach(track => {
                    track.onended = () => {
                        // handle this ended event
                    };
                    localStream.current.srcObject.addTrack(track);
                });
            } catch (error) {
                console.log('Error accessing media devices:', error.message);
                if (constraints.video) {
                    video.enabled = false;
                    setTimeout(() => { setVideo({ enabled: false }); }, 100);
                }
                else {
                    audio.enabled = false;
                    setTimeout(() => { setAudio({ enabled: false }); }, 100);
                }
            }
        }

        if (localStream.current.srcObject === null) {
            localStream.current.srcObject = new MediaStream();
        }
        if (video.enabled === true && ((localStream.current.srcObject !== null && localStream.current.srcObject.getVideoTracks().length === 0) || localStream.current.srcObject === null)) {
            startMediaCapture({ video: true });
        }
        else {
            if (localStream.current.srcObject !== null) {
                localStream.current.srcObject.getVideoTracks().forEach(track => {
                    track.enabled = video.enabled;
                    // track.stop();
                    // localStream.current.srcObject.removeTrack(track);
                });
            }
        }

        if (audio.enabled === true && ((localStream.current.srcObject !== null && localStream.current.srcObject.getAudioTracks().length === 0) || localStream.current.srcObject === null)) {
            startMediaCapture({ audio: true });
        }
        else {
            if (localStream.current.srcObject !== null) {
                localStream.current.srcObject.getAudioTracks().forEach(track => {
                    track.enabled = audio.enabled;
                    // track.stop();
                    // localStream.current.srcObject.removeTrack(track);
                });
            }
        }
        let count = (video.enabled && audio.enabled) ? 2 : (video.enabled || audio.enabled) ? 1 : 0;
        if (av.current !== 2 && av.current < count && remoteStreamKeys.length !== 0) {
            handleReconnection();
            av.current = count;
        }
    }, [video, audio]);

    return (
        <div id="stream-wrapper">
            <div id="streams">
                <video id="local-stream" ref={localStream} autoPlay muted />
                <div id="remote-streams">
                    {remoteStreamKeys.map((userId, i) => {
                        return (
                            <video key={i} id={`remote-stream-${userId}`} className="remote-stream" autoPlay />
                        );
                    })}
                </div>
            </div>
            <div id="stream-controls">
                <label className="switch">
                    <input checked={video.enabled} type="checkbox" onChange={() => setVideo({ enabled: !video.enabled })} />
                    <span className="slider round"></span>
                </label>
                <label className="switch">
                    <input checked={audio.enabled} type="checkbox" onChange={() => setAudio({ enabled: !audio.enabled })} />
                    <span className="slider round"></span>
                </label>
                {/* <button id="bt" onClick={() => setScreen(x => !x)}>{!screen ? "share screen" : "stop sharing"}</button> */}
                <button onClick={handleLeave}>leave</button>
            </div>
        </div>
    );
};

export default VideoChatPage;