import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import axios from "../api/axios";

export default function Note() {
    const [title, setTitle] = useState('')
    const [con, setCon] = useState('')
    const { auth } = useAuth()
    const nav = useNavigate();
    const params=useParams()
    async function submitHandler_Save(e) {
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
    async function submitHandler_Update(e) {
        e.preventDefault();
        try {
            await axios.patch(`/notes/update/${params.id}`,
                JSON.stringify({ title, con }),
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
    useEffect(()=>{
        if(params.id)
        {
            setTitle(params.title)
            setCon(params.con)
        }
    },[params])
    return (
        <div>
            {!params.id && (<NoteForm title={title} setTitle={setTitle} con={con} setCon={setCon} submitHandler={submitHandler_Save} />)}
            {params.id && (<NoteForm title={title} setTitle={setTitle} con={con} setCon={setCon} submitHandler={submitHandler_Update} />)}
        </div>
    );
}