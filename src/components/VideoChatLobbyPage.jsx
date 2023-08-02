import { useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

export default function VCLobbyPage() {
    const location = useLocation();
    const roomId = (location.state && location.state.roomId) ? location.state.roomId : '-1';
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const nav = useNavigate();
    const HandleJoin = (e) => {
        e.preventDefault();
        nav(`/video/${roomId}`, {
            state: {
                enableVideo: video,
                enableAudio: audio,
            }
        });
    };

    return (
        (roomId !== '-1')
            ?
            (<div>
                <div className="card">
                    <div>
                        <label className="switch">
                            <input checked={video} type="checkbox" onChange={(e) => setVideo(e.target.checked)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div>
                        <label className="switch">
                            <input checked={audio} type="checkbox" onChange={(e) => setAudio(e.target.checked)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <button id="bt" onClick={() => nav('/video')}>Cancel</button>
                    <button id="bt" onClick={HandleJoin}>Join</button>
                </div>
            </div>)
            : <Navigate to='/video' state={{ from: location }} replace />
    );
}