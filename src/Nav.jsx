import { Link } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import useAxiosPrivate from './hooks/useAxiosPrivate';

function Nav() {
    const { auth, setAuth } = useAuth()
    const axiosPrivate = useAxiosPrivate();
    const LogOut=async ()=>{
        try {
            await axiosPrivate.delete('/auth/logout').catch((er)=>console.log(er.message))
            setAuth({})
            localStorage.removeItem("persist")
        } catch (er) {
            console.log(er.message)
        }
    }
    return (
        <nav>
            <Link to="/" className='link'>Home</Link>
            {auth.accessToken && (<Link to="/notes" className='link'>Notes</Link>)}
            <Link to="/about" className='link'>About</Link>
            {!auth.accessToken && (<Link to="/auth/login" className='link'>Login/Signup</Link>)}
            {auth.accessToken && (<button onClick={() => {LogOut()}}>Logout</button>)}
        </nav>
    )
}
export default Nav;