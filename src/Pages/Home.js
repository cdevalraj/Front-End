import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import refresh from "../components/Refresher";
import useAuth from "../hooks/useAuth";

function Home() {
    const { auth, setAuth } = useAuth()
    const [notes, setNotes] = useState([])
    
    useEffect(() => {
        const hasAccess = async (accessToken, refreshToken) => {
            if (!refreshToken)
                return;
            const isTokenExpired = (token) => Date.now() >= (JSON.parse(atob(token.split('.')[1]))).exp * 1000
            if (isTokenExpired(accessToken)) {
                accessToken = await refresh(refreshToken);
                setAuth({
                    accessToken,
                    refreshToken,
                    role: auth.role,
                    username: auth.username
                })
            }
        };
        (async () => {
            await hasAccess(auth.accessToken, auth.refreshToken)
            const res = await axios.get('/notes/',
                {
                    headers: { "Authorization": `Bearer ${auth.accessToken}` }
                }
            );
            setNotes(res.data)
        })()
    }, [auth, setAuth])
    return (
        <div>
            {notes.length === 0 && (
                <div>
                    <h2>No Notes Are Available/Recorded</h2>
                </div>
            )}
            {notes && (
                <div className="grid">
                    <Notes notes={notes} />
                </div>
            )}
            <Link to="/note">Create New Note</Link>
        </div>

    );
}
function Notes({ notes }) {
    return notes.map((ele, idx) => {
        return (
            <Link to={`/notes/${ele.id}`} key={idx}>
                <div className="note">
                    <h2>{ele.title}</h2>
                    <h5>{ele.content}</h5>
                    <p>{ele.updatedAt}</p>
                </div>
            </Link>
        )
    })
}
export default Home;