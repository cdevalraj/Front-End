import { Link } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Cookies from 'js-cookies';
import axios from './api/axios';

function Nav() {
    const { auth, setAuth } = useAuth()
    function LogOut(refreshToken) {
        axios.delete('/auth/logout',
            { data:{token: refreshToken}},
            {
                headers: { 'Content-Type': 'application/json' }
            }).then((res) => {
                setAuth({})
                Cookies.removeItem('refreshToken')
            }).catch(er => console.log(er))
    }
    return (
        <nav>
            {auth.accessToken && (<Link to="/" className='link'>Home</Link>)}
            <Link to="/about" className='link'>About</Link>
            {!auth.accessToken && (<Link to="/auth/login" className='link'>Login/Signup</Link>)}
            {auth.accessToken && (<button onClick={() => LogOut(auth.refreshToken)}>Logout</button>)}
        </nav>
    )
}
export default Nav;