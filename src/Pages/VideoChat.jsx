import React, { useEffect, useRef, useState } from "react";
import Permissions from "../components/Permissions";
import './styles/videostyles.css'
import useSocket from "../hooks/useSocket";
const servers={
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}


// Creating an Element
function createVideoElement(parent, str) {
    const videle = document.createElement('video')
    videle.setAttribute('id', str)
    videle.setAttribute('autoPlay', true);
    parent.appendChild(videle)
}

// To get stream
async function enableStream(constraints,ele,setStream,setter) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(stream);
        stream.getTracks()[0].addEventListener('ended', () => {
            setter(false)
        })
        if(ele!==null)
            ele.srcObject = stream
    } catch (error) {
        console.error('Error accessing media devices.', error.message);
    }
}
async function getdevice(constraints,setStream,setter) {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints)
        setStream(stream)
        stream.getTracks()[0].addEventListener('ended', () => {
            setter(false)
        })
        document.getElementById('screen').srcObject = stream
    } catch (error) {
        console.error('Error accessing media devices.', error.message);
        setScreen(false)
    }
}

function VideoChatPage() {
    const [screenStream, setScreenStream] = useState(null)
    const [localVideoStream, setLocalVideoStream] = useState(null);
    const [remoteVideoStream, setRemoteVideoStream] = useState([]);
    const [localaudioStream, setLocalAudioStream] = useState(null);
    const [remoteAudioStreams,setRemoteAudioStreams]=useState([])
    const socket = useSocket()
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [screen, setScreen] = useState(false);
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        socket.connect()
        const pc = new RTCPeerConnection(servers)
        pc.onicecandidate = (e) => {
            if (e.candidate)
                console.log(e.candidate)
        }
        pc.oniceconnectionstatechange = (e) => {
            console.log(e)
        }
        pc.ontrack=(e)=>{
            
        }
        socket.emit('peer', pc)
        return () => {
            socket.disconnect()
        }
    }, [])

    //video
    useEffect(() => {
        if (video) {
            if (!document.getElementById('local-stream')) {
                createVideoElement(document.getElementById('video-streams'), 'local-stream')
            }
            enableStream({ 'video': true },document.getElementById('local-stream'),setLocalVideoStream,setVideo);
        }
        else {
            if (localVideoStream !== null)
                localVideoStream.getTracks().forEach(function (track) { track.stop(); });
        }
    }, [video])

    //audio
    useEffect(() => {
        if (audio) {
            enableStream({ 'audio': true },null,setLocalAudioStream,setAudio);
        }
        else {
            if (localaudioStream !== null)
            localaudioStream.getTracks().forEach(function (track) { track.stop(); });
        }
    }, [audio])

    //screen
    // useEffect(() => {
    //     const constraints={
    //         video: {
    //             cursor: 'always' | 'motion' | 'never',
    //             displaySurface: 'application' | 'browser' | 'monitor' | 'window'
    //         }
    //     };
    //     if (screen) {
    //         if (!document.getElementById('screen')) {
    //             let ele = document.getElementById('local-stream')
    //             ele.setAttribute('class', 'video');
    //             createVideoElement(document.getElementById('video-streams'), 'screen')
    //         }
    //         getdevice(constraints,setScreenStream,setScreen)
    //     }
    //     else {
    //         const element = document.getElementById('screen')
    //         if (element) {
    //             element.parentNode.removeChild(element);
    //             let ele = document.getElementById('local-stream')
    //             ele.setAttribute('class', '');
    //         }
    //         if (screenStream !== null)
    //             screenStream.getTracks().forEach(function (track) { track.stop(); });
    //     }
    // }, [screen])

    useEffect(() => {
        if (toggle) {
            if(!document.getElementById('local-stream'))
                createVideoElement(document.getElementById('video-streams'), 'local-stream')
        }
    }, [toggle])

    return (
        <div>
            {(!toggle) ? (
                <Permissions setVideo={setVideo} setAudio={setAudio} setToggle={setToggle} />
            ) : (
                <>
                    <div id="stream-wrapper">
                        <div id="video-streams">
                            <div id="remote-streams"></div>
                        </div>
                        <div id="stream-controls">
                            <label className="switch">
                                <input checked={video} type="checkbox" onChange={(e) => setVideo(e.target.checked)} />
                                <span className="slider round"></span>
                            </label>
                            <label className="switch">
                                <input checked={audio} type="checkbox" onChange={(e) => setAudio(e.target.checked)} />
                                <span className="slider round"></span>
                            </label>
                            {/* <button id="bt" onClick={() => setScreen(x => !x)}>{!screen ? "share screen" : "stop sharing"}</button> */}
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

export default VideoChatPage