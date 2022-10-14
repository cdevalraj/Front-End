import {Link} from 'react-router-dom';
function SLNav()
{
    return (
        <div>
            <h1>Demo</h1>
            <Link to="/signup">Sign up</Link>
            <Link to="/login">Log in</Link>
        </div>
    );
}
export default SLNav;