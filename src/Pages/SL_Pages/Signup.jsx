import '../styles/forms.css';
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [conpwd, setConpwd] = useState('')
    const [error, setError] = useState('')
    const [validatorE, setValidatorE] = useState('')
    const [validatorP, setValidatorP] = useState('')
    const [validatorCP, setValidatorCP] = useState('')
    const nav = useNavigate();

    const SubmitHandler = async (e) => {
        e.preventDefault();
        try {
            let v1=name.match(/^[A-Za-z ]{4,70}$/),v2=email.match(/[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,}/),v3=pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$/)
            if (v1 && v2 && v3 && pwd === conpwd) {
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
            else
            {
                if(pwd!==conpwd)
                    setError('both passwords must be same')
                else
                setError('Invaild Entries')
            }
        }
        catch (er) {
            setError(er.message)
            console.log(er.message)
        }
    }

    useEffect(() => {
        if (email !== '' && !email.match(/[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,}/))
            setValidatorE('Invalid Email')
        else
            setValidatorE('')
    }, [email])

    useEffect(() => {
        if (pwd !== '' && !pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$/))
            setValidatorP('Match the pattern')
        else
            setValidatorP('')
    }, [pwd])

    useEffect(() => {
        if (conpwd !== '' && !conpwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$/))
            setValidatorCP('Match the pattern')
        else
            setValidatorCP('')
    }, [conpwd])

    useEffect(() => {
        setError('')
    }, [name, email, pwd, conpwd])

    return (
        <div>
            <p>{error}</p>
            <form onSubmit={SubmitHandler}>
                <input type="text" pattern="^[A-Za-z ]{4,70}$" maxLength="70" placeholder="First & Last name" value={name} onChange={(e) => setName(e.target.value)} required />
                <label>{validatorE}</label>
                <input type="email" pattern="[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,}" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>{validatorP}</label>
                <input type="password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$" maxLength="24" placeholder="Your password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                <label>{validatorCP}</label>
                <input type="password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$" maxLength="24" placeholder="Confirm password" value={conpwd} onChange={(e) => setConpwd(e.target.value)} required />
                <button className='button'>Create An Account</button>
            </form>
        </div>
    );
}
export default Signup;