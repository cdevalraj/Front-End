import { Link } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import useLogOut from './hooks/useLogOut';

function Nav() {
    const { auth } = useAuth()
    const LogOut = useLogOut()
    return (
        <nav>
            <Link to="/" className='link'>Home</Link>
            {auth.accessToken && (<Link to="/notes" className='link'>Notes</Link>)}
            <Link to="/about" className='link'>About</Link>
            {!auth.accessToken && (<Link to="/auth/login" className='link'>Login/Signup</Link>)}
            {auth.accessToken && (<button onClick={() => LogOut()}>Logout</button>)}
        </nav>
    )
}
export default Nav;