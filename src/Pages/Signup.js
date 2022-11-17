import SLNav from "./slnav";
import './forms.css';
import { useEffect, useState } from "react";
import axios from "../api/axios";

function Signup() {
    const [uname, setUname] = useState('')
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        setError('')
    }, [uname, email, pwd])

    const SubmitHandler = async (e) => {
        e.preventDefault();
        try{
            await axios.post('/signup',
                JSON.stringify({uname,email,pwd}),
                {
                    headers:{'Content-Type': 'application/json'}
                }
            );
            setEmail('')
            setPwd('')
            setUname('')
            setSuccess(true);
        }
        catch(er)
        {
            console.log(er)
        }
    }

    return (
        <>
            {success ? (
                <section>
                    <h1>You have logged in successfully!</h1><br />
                    <p>
                        Hello
                    </p>
                </section>
            ) : (
                <div className="container">
                    <SLNav />
                    <div>
                        <p className={error ? "error" : "offscreen"} aria-live="assertive">{error}</p>
                        <form onSubmit={SubmitHandler}>
                            <input type="text" placeholder="username" value={uname} onChange={(e) => setUname(e.target.value)} required />
                            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Your password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                            <button>Create An Account</button>
                        </form>
                    </div>
                </div>)}
        </>
    );
}
export default Signup;