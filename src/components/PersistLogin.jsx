import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';
import useLogOut from "../hooks/useLogOut";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const LogOut = useLogOut()
    const { auth, persist } = useAuth();
    // const isTokenExpired = token => Date.now() >= (JSON.parse(atob(token.split('.')[1]))).exp * 1000
    /* eslint-disable*/
    useEffect(() => {
        let isMounted = true;
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err.message);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }
        const LogOutUser = async () => {
            try {
                setIsLoading(false)
                if(!persist && !auth.accessToken)
                    await LogOut()
            }
            catch (er) {
                console.log(er.message)
            }
        }
        !auth?.accessToken && persist ? verifyRefreshToken() : LogOutUser();
        return () => { isMounted = false; }
    }, [])

    return (
        <>
            {!persist
                ? <Outlet />
                : isLoading
                    ? <p>Loading...</p>
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin