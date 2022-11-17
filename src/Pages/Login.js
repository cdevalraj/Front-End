import SLNav from "./slnav";
import './forms.css';
import {  useEffect, useState } from "react";
// import AuthContext from "../Context/AuthProvider";
import axios from '../api/axios';

function Login() {
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    // const {setAuth}=useContext(AuthContext)

    useEffect(() => {
        setError('')
    }, [email, pwd])


    const SubmitHandler = async (e) => {
        e.preventDefault();
        try{
            await axios.post('/login',
                JSON.stringify({email,pwd}),
                {
                    headers:{'Content-Type': 'application/json'}
                }
            );
            // const accessToken=res?.data?.accessToken;
            // const role=res?.data?.role;
            // const user=res?.data?.user;
            // const email=res?.data?.user;
            // setAuth({user,pwd,role,accessToken});
            setEmail('')
            setPwd('')
            setSuccess(true);
        }
        catch(er){
            if(!er?.response)
                setError('No server response')
            else if(er.response?.status===400)
                setError('Missing UserName/Email or Password');
            else if(er.response?.status===401)
                setError('Invalid Credentials');
            else
                setError('Login Failed')
        }
        
    }

    return (
        <>
            {success ? (
                <section>
                    <h1>You have logged in successfully!</h1><br />
                    <p className={error ? "error" : "offscreen"} aria-live="assertive">{error}</p>
                </section>
            ) : (
                <div className="container">
                    <SLNav />
                    <div>
                        <p>{error}</p>
                        <form onSubmit={SubmitHandler}>
                            <input type="text" placeholder="Your username or email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Your password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                            <button >Log In</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
export default Login;