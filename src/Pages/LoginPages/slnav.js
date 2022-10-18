import {Link} from 'react-router-dom';
function SLNav()
{
    return (
        <div className='headerl'>
            <h1>Demo</h1>
            <div className='nlinks'>
                <Link className='links' to="/signup">Sign up</Link>
                <Link className='linkl' to="/login">Log in</Link>
            </div>
        </div>
    );
}
export default SLNav;