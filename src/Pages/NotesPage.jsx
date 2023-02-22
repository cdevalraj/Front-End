import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

function NotesPage() {
    const { auth } = useAuth()
    const [notes, setNotes] = useState([])
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    /* eslint-disable*/
    useEffect(() => {
        const getNotes = async () => {
            try {
                let res = await axiosPrivate.get('/notes/',
                    {
                        headers: { "Authorization": `Bearer ${auth.accessToken}` }
                    }
                );
                setNotes(res.data)
            }
            catch(er)
            {
                console.error(er.message);
                navigate('/auth/login', { state: { from: location }, replace: true });
            }
        }
        getNotes();
    }, [])
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
            <Link to={`/note/${ele._id}`} key={idx}>
                <div className="note">
                    <h2>{ele.title}</h2>
                    <h5>{ele.content}</h5>
                    <p>{ele.updatedAt}</p>
                </div>
            </Link>
        )
    })
}
export default NotesPage;