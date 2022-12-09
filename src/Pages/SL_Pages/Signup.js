import './forms.css';
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [error, setError] = useState('')
    const nav = useNavigate();

    useEffect(() => {
        setError('')
    }, [name, email, pwd])

    const SubmitHandler = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/auth/signup',
                JSON.stringify({ name, email, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            setEmail('')
            setPwd('')
            setName('')
            nav('/auth/login')
        }
        catch (er) {
            console.log(er)
        }
    }

    return (
        <div>
            <p className={error ? "error" : "offscreen"} aria-live="assertive">{error}</p>
            <form onSubmit={SubmitHandler}>
                <input type="text" placeholder="First & Last name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" pattern="[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,}" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$" placeholder="Your password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                <button className='button'>Create An Account</button>
            </form>
        </div>
    );
}
export default Signup;