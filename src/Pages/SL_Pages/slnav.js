import { Link, Outlet } from 'react-router-dom';
function SLNav() {
    return (
        <div className="container">
            <div className='headerl'>
                <h1>Demo</h1>
                <div className='nlinks'>
                    <Link className='links' to="/auth/signup">Sign up</Link>
                    <Link className='linkl' to="/auth/login">Log in</Link>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
export default SLNav;