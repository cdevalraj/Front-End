import React, { useEffect, useRef, useState } from "react";
import './styles/videostyles.css'
import useSocket from "../hooks/useSocket";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import allowImg from '../assets/allowImg.png';

const PC_Config = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
    SdpSemantics: 'unified-plan'
};
const Screen_Share_constraints = {
    video: {
        cursor: 'always' | 'motion' | 'never',
        displaySurface: 'application' | 'browser' | 'monitor' | 'window'
    }
};


const VideoChatPage = () => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const location = useLocation();
    const vid = localStorage.getItem('video') !== null && localStorage.getItem('video') == 'true';
    const aud = localStorage.getItem('audio') !== null && localStorage.getItem('audio') == 'true';
    const enableVideo = (location.state !== null && location.state.enableVideo) ? location.state.enableVideo : vid;
    const enableAudio = (location.state !== null && location.state.enableAudio) ? location.state.enableAudio : aud;
    const localStream = useRef(null);
    const remoteStreams = useRef({});
    const peerConnections = useRef({});
    const ScreenId = useRef('');
    const [blockScreenShare, setBlockScreenShare] = useState(false);
    const screenStream = useRef(null);
    const [screen, setScreen] = useState(false);
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
                let res = await axiosPrivate.post('/room/verify',
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

        /* Signalling */
        socket.current.emit('join-room', roomId);
        socket.current.on('response', (Uid) => {
            USERID.current = Uid;
        });
        socket.current.on('New-User', (userId) => {
            if (peerConnections.current[userId] === undefined) {
                createPeerConnection(userId);
                CreatingOffer(userId);
            }
        });
        socket.current.on('Create-Offers', (toUserIds) => {
            toUserIds.forEach((userId) => {
                if (peerConnections.current[userId] === undefined && userId != USERID.current) {
                    createPeerConnection(userId);
                    CreatingOffer(userId);
                }
            });
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
        socket.current.on('ScreenID', (sid) => {
            ScreenId.current = sid;
            setBlockScreenShare(true);
        });
        socket.current.on('Screen-Share-Ended', () => {
            ScreenId.current = '';
            if (screenStream.current.srcObject !== null) {
                screenStream.current.srcObject.getTracks().forEach((track) => {
                    track.stop();
                });
            }
            delete screenStream.current['srcObject'];
            screenStream.current.srcObject = null;
            setBlockScreenShare(false);
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
            DestoryAll();
        }
    }, []);

    const DestoryAll = () => {
        console.log('Destorying Everthing!!!');
        if (localStream.current !== null && localStream.current.srcObject !== null) {
            localStream.current.srcObject.getTracks().forEach((track) => {
                track.stop();
            });
            delete localStream.current['srcObject'];
        }
        if (screenStream.current !== null && screenStream.current.srcObject !== null) {
            screenStream.current.srcObject.getTracks().forEach((track) => {
                track.stop();
            });
            delete localStream.current['srcObject'];
        }
        Object.keys(peerConnections.current).forEach(key => delete peerConnections.current[key]);
        Object.keys(remoteStreams.current).forEach(key => delete remoteStreams.current[key]);
        Object.keys(ICE_Candidates.current).forEach(key => delete ICE_Candidates.current[key]);
    };
    const CreateVideoElement = (userId) => {
        // Create a new video element for the remote user
        let ele = document.createElement('video');
        ele.setAttribute('id', `remote-stream-${userId}`);
        ele.setAttribute('class', 'remote-stream');
        ele.autoplay = true;
        ele.controls = false;
        ele.playsInline = true;
        return ele;
    };
    /* Handling PeerConnection */
    const createPeerConnection = (userId) => {
        if (peerConnections.current[userId] === undefined) {
            let pc = new RTCPeerConnection(PC_Config);
            // Add local stream to the peer connection
            if (localStream.current.srcObject !== null) {
                localStream.current.srcObject.getTracks().forEach((track) => {
                    pc.addTrack(track, localStream.current.srcObject);
                });
            }
            if (screenStream.current.srcObject !== null) {
                screenStream.current.srcObject.getTracks().forEach((track) => {
                    pc.addTrack(track, screenStream.current.srcObject);
                });
            }
            // Use the following event if you need to handle state change of connection between peers
            pc.onconnectionstatechange = (event) => {
                // console.log(pc.connectionState);
                if (pc.connectionState === 'connected') {
                    // console.log("Peers Connected");
                    let remoteVideo = CreateVideoElement(userId);
                    let remoteVideosContainer = document.getElementById('remote-streams');
                    remoteVideosContainer.appendChild(remoteVideo);
                }
            };
            // Didn't Use this for the current implementation
            // pc.onnegotiationneeded = (event) => {
            //     console.log('Negotiation Needed', event);
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
        if (ScreenId.current != '' && event.streams[0].id == ScreenId.current) {
            screenStream.current.srcObject = event.streams[0];
            return;
        }
        let remoteVideo = document.getElementById(`remote-stream-${userId}`);
        if (!remoteVideo) {
            // Create a new video element for the remote user
            remoteVideo = CreateVideoElement(userId);
        }
        const handleclick = () => {
            remoteVideo.removeEventListener('click', handleclick, true);
            remoteVideo.play();
        }
        if (remoteVideo.srcObject === null) {
            remoteVideo.srcObject = event.streams[0];
        }
        else {
            remoteVideo.srcObject.addTrack(event.track);
        }

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
        delete remoteStreams.current[disconnectedUserId];
        delete peerConnections.current[disconnectedUserId];
        delete ICE_Candidates.current[disconnectedUserId];
    };

    const handleReconnection = () => {
        // handle the logic for reconnecting peers
        console.log('Reconnection Needed');
        for (const key in peerConnections.current) {
            if (peerConnections.current.hasOwnProperty(key)) {
                peerConnections.current[key].close();
                let ele = document.getElementById(`remote-stream-${key}`);
                if (ele) {
                    ele.parentNode.removeChild(ele);
                }
                delete peerConnections.current[key];
            }
        }
        Object.keys(remoteStreams.current).forEach(key => delete remoteStreams.current[key]);
        Object.keys(ICE_Candidates.current).forEach(key => delete ICE_Candidates.current[key]);
        socket.current.emit('Re-Connection', USERID.current);
    };

    const handleLeave = () => {
        DestoryAll();
        nav('/video');
    };

    // Video & Audio
    useEffect(() => {
        const startMediaCapture = async (constraints) => {
            try {
                let stream = await navigator.mediaDevices.getUserMedia(constraints);
                return stream;
            } catch (error) {
                console.log('Error accessing media devices:', error.message);
                return 'ERROR';
            }
        }

        if (video.enabled === true && (localStream.current.srcObject === null || localStream.current?.srcObject?.getVideoTracks()?.length === 0)) {
            (async () => {
                let stream = await startMediaCapture({ video: true });
                if (stream == 'ERROR') {
                    // handle accessing error
                    video.enabled = false;
                    setTimeout(() => { setVideo({ enabled: false }); }, 100);
                    return;
                }
                if (localStream.current.srcObject == null) {
                    localStream.current.srcObject = stream;
                }
                else {
                    stream.getTracks().forEach((track) => {
                        // track.onended = () => {
                        //     // handle this ended event
                        // };
                        localStream.current.srcObject.addTrack(track);
                    });
                }
            })()
        }
        else if (audio.enabled === true && (localStream.current.srcObject === null || localStream.current?.srcObject?.getAudioTracks()?.length === 0)) {
            (async () => {
                let stream = await startMediaCapture({ audio: true });
                if (stream == 'ERROR') {
                    // handle accessing error
                    audio.enabled = false;
                    setTimeout(() => { setAudio({ enabled: false }); }, 100);
                    return;
                }
                if (localStream.current.srcObject == null) {
                    localStream.current.srcObject = stream;
                }
                else {
                    stream.getTracks().forEach((track) => {
                        // track.onended = () => {
                        //     // handle this ended event
                        // };
                        localStream.current.srcObject.addTrack(track);
                    });
                }
            })()
        }
        else {
            if (localStream.current.srcObject !== null || localStream.current?.srcObject?.getVideoTracks()?.length > 0) {
                localStream.current.srcObject.getVideoTracks().forEach(track => {
                    track.enabled = video.enabled;
                    // track.stop();
                    // localStream.current.srcObject.removeTrack(track);
                });
            }
            if (localStream.current.srcObject !== null || localStream.current?.srcObject?.getAudioTracks()?.length > 0) {
                localStream.current.srcObject.getAudioTracks().forEach(track => {
                    track.enabled = audio.enabled;
                    // track.stop();
                    // localStream.current.srcObject.removeTrack(track);
                });
            }
        }
        localStorage.setItem('video', video.enabled);
        localStorage.setItem('audio', audio.enabled);
        let count = (video.enabled && audio.enabled) ? 2 : (video.enabled || audio.enabled) ? 1 : 0;
        if (av.current !== 2 && av.current < count) {
            av.current = count;
            setTimeout(() => { handleReconnection(); }, 1000);
        }
    }, [video, audio]);

    // screen
    useEffect(() => {
        async function getdevice(constraints) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
                stream.getTracks()[0].addEventListener('ended', () => {
                    setScreen(false);
                });
                return stream;
            } catch (error) {
                console.log('Error accessing media devices.', error.message);
                return 'ERROR';
            }
        }
        if (screen && screen === true) {
            (async () => {
                let stream = await getdevice(Screen_Share_constraints);
                if (stream == 'ERROR') {
                    // handle error
                    setTimeout(() => { setScreen(false); }, 100);
                    return;
                }
                screenStream.current.srcObject = stream;
                ScreenId.current = stream.id;
                handleReconnection();
                socket.current.emit('Screen-Id', { fromUserId: USERID.current, sId: stream.id })
            })()
        }
        else {
            if (screenStream.current.srcObject !== null) {
                screenStream.current.srcObject.getTracks().forEach((track) => {
                    track.stop();
                });
                // console.log('Screen Sharing Ended');
                socket.current.emit('Stop-Screen-Share', { fromUserId: USERID.current });
                delete screenStream.current['srcObject'];
                screenStream.current.srcObject = null;
            }
        }
    }, [screen])

    return (
        <div id="stream-wrapper">
            <div id="Screen-Share">
                <video id='screen' ref={screenStream} autoPlay muted />
            </div>
            <div id="streams">
                <video id="local-stream" ref={localStream} autoPlay muted />
                <div id="remote-streams">
                    {/* {Object.keys(remoteStreams.current).map((userId, i) => {
                        return (
                            <video key={i} id={`remote-stream-${userId}`} className="remote-stream" autoPlay />
                        );
                    })} */}
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
                {blockScreenShare === false && (<button id="bt" onClick={() => setScreen(x => !x)}>{!screen ? "share screen" : "stop sharing"}</button>)}
                <button onClick={handleLeave}>leave</button>
            </div>
        </div>
    );
};

export default VideoChatPage;