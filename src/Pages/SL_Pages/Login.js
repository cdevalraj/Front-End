import './forms.css';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

function Login() {
    const [ue, setUe] = useState('')
    const [pwd, setPwd] = useState('')
    const [error, setError] = useState('')
    const { setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const nav = useNavigate();
    const location=useLocation()
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        setError('')
    }, [ue, pwd])


    const SubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosPrivate.post('/auth/login',
                JSON.stringify({ ue, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            const accessToken = res?.data?.accessToken;
            const role = res?.data?.role;
            const username = res?.data?.username;
            const refreshToken = res?.data?.refreshtoken;
            setAuth({ accessToken, refreshToken, role, username });
            setUe('')
            setPwd('')
            nav(from,{replace:true})
        }
        catch (er) {
            if (!er?.response)
                setError('No server response')
            else if (er.response?.status === 400)
                setError('Missing UserName/Email or Password');
            else if (er.response?.status === 401)
                setError('Invalid Credentials');
            else
                setError('Login Failed')
        }
    }

    return (
        <div>
            <p>{error}</p>
            <form onSubmit={SubmitHandler}>
                <input type="text" placeholder="Your username or email" value={ue} onChange={(e) => setUe(e.target.value)} required />
                <input type="password" placeholder="Your password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                <button className='button'>Log In</button>
            </form>
        </div>
    );
}
export default Login;