import './forms.css';
import { useEffect, useState } from "react";
import axios from '../../api/axios';
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Cookies from 'js-cookies';

function Login() {
    const [ue, setUe] = useState('')
    const [pwd, setPwd] = useState('')
    const [error, setError] = useState('')
    const { setAuth } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        setError('')
    }, [ue, pwd])


    const SubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/login',
                JSON.stringify({ ue, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: true
                }
            );
            const accessToken = res?.data?.accessToken;
            const role = res?.data?.role;
            const username = res?.data?.username;
            const refreshToken = res?.data?.refreshtoken;
            setAuth({ accessToken, refreshToken, role, username });
            Cookies.setItem('accessToken',accessToken);
            Cookies.setItem('refreshToken',refreshToken);
            Cookies.setItem('username',username)
            Cookies.setItem('role',role)
            setUe('')
            setPwd('')
            nav('/')
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