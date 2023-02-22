import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function Note() {
    const [title, setTitle] = useState('')
    const [con, setCon] = useState('')
    const { auth } = useAuth()
    const nav = useNavigate();
    const params = useParams()
    const axiosPrivate = useAxiosPrivate()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/notes";

    async function submitHandler_Save(e) {
        e.preventDefault();
        try {
            await axiosPrivate.post('/notes/save',
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
            nav(from, { replace: true })
        }
        catch (er) {
            console.log(er)
        }
    }

    async function submitHandler_Update(e) {
        e.preventDefault();
        try {
            await axiosPrivate.patch(`/notes/update/${params.id}`,
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
            nav(from, { replace: true })
        }
        catch (er) {
            console.log(er.message)
        }
    }

    async function submitHandler_delete(e) {
        e.preventDefault();
        try {
            await axiosPrivate.delete(`/notes/delete/${params.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${auth?.accessToken}`
                    }
                }
            );
            setTitle('')
            setCon('')
            nav(from, { replace: true })
        }
        catch (er) {
            console.log(er.message)
        }
    }

    async function getter() {
        try {
            let res = await axiosPrivate.get(`/notes/${params.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${auth?.accessToken}`
                    }
                }
            );
            setTitle(res.data.title)
            setCon(res.data.content)
        }
        catch (er) {
            console.log(er.message)
        }
    }

    /* eslint-disable*/
    useEffect(() => {

        if (params.id)
            getter()
    }, [])
    return (
        <div>
            {!params.id && (<NoteForm title={title} setTitle={setTitle} con={con} setCon={setCon} submitHandler={submitHandler_Save} />)}
            {params.id && (<NoteForm title={title} setTitle={setTitle} con={con} setCon={setCon} submitHandler={submitHandler_Update} deleteHandler={submitHandler_delete} />)}
        </div>
    );
}