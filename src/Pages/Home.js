import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import refresh from "../components/Refresher";
import useAuth from "../hooks/useAuth";
import Cookies from 'js-cookies';

function Home() {
    const { auth, setAuth } = useAuth()
    const [notes, setNotes] = useState([])
    
    useEffect(() => {
        const hasAccess = async (accessToken, refreshToken) => {
            refreshToken=Cookies.getItem('refreshToken')
            if (!refreshToken)
                return;
            const isTokenExpired = (token) => Date.now() >= (JSON.parse(atob(token.split('.')[1]))).exp * 1000
            if (isTokenExpired(accessToken)) {
                console.log("Token has expired")
                let res = await refresh(refreshToken);
                setAuth({
                    accessToken:res.accessToken,
                    refreshToken,
                    role: res.role,
                    username: res.username
                })
            }
        };
        (async () => {
            await hasAccess(auth.accessToken, auth.refreshToken)
            let res = await axios.get('/notes/',
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
            <Link to={`/note/${ele._id}/${ele.title}/${ele.content}`} key={idx}>
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