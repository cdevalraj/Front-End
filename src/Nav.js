import {Link} from 'react-router-dom';
function Nav()
{
    return(
        <nav>
            <Link to="/" className='link'>Home</Link>
            <Link to="/about" className='link'>About</Link>
            <Link to="/login" className='link'>Login/Signup</Link>
        </nav>
    )
}
export default Nav;