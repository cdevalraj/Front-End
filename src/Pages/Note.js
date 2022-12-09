import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import axios from "../api/axios";

export default function Note() {
    const [title, setTitle] = useState('')
    const [con, setCon] = useState('')
    const { auth } = useAuth()
    const nav = useNavigate();
    async function submitHandler(e) {
        e.preventDefault();
        try {
            await axios.post('/notes/save',
                JSON.stringify({ username: auth.username, title, con }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${auth?.accessToken}`
                    }
                }
            );
            setTitle('')
            setCon('')
            nav('/')
        }
        catch (er) {
            console.log(er)
        }
    }
    return (
        <div>
            <NoteForm title={title} setTitle={setTitle} con={con} setCon={setCon} submitHandler={submitHandler} />
        </div>
    );
}