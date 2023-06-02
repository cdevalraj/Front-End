import { useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function ZoomPage() {
    const [meet, setMeet] = useState('')
    const axiosPrivate = useAxiosPrivate()
    const { auth } = useAuth()
    const nav = useNavigate();

    async function handleJoin(e) {
        e.preventDefault();
        try {
            await axiosPrivate.get('/room/verify',
                JSON.stringify({ roomId: meet }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${auth.accessToken}`
                    }
                }
            );
            nav(`/video/${meet}`);
            setMeet('')
        }
        catch (er) {
            console.log(er.message)
        }

    }
    async function handleCreate(e) {
        e.preventDefault();
        try {
            const res = await axiosPrivate.post('/room/generate', {},
                {
                    headers: {
                        "Authorization": `Bearer ${auth.accessToken}`
                    }
                }
            )
            nav(`/video/${res.data.roomid}`);
            setMeet('')
        }
        catch (er) {
            console.log(er.message)
        }
    }
    return (
        <div>
            <div className="card">
                <h1>Meeting</h1>
                <input value={meet} onChange={(e) => setMeet(e.target.value)} required></input>
                <button id="bt" onClick={handleJoin}>join</button>
            </div>
            <div className="card">
                <h3>or</h3>
            </div>
            <div className="card">
                <button id="bt" onClick={handleCreate}>create</button>
            </div>
        </div>

    );
}

export default ZoomPage;