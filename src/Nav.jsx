import { Link } from 'react-router-dom';
import useAuth from './hooks/useAuth';

function Nav() {
    const { auth } = useAuth()
    return (
        <nav>
            {auth.username && (<Link to="/" className='link'>Home</Link>)}
            <Link to="/about" className='link'>About</Link>
            <Link to="/auth/login" className='link'>Login/Signup</Link>
        </nav>
    )
}
export default Nav;