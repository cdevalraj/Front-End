import { createContext, useEffect, useState } from "react";
import Cookies from 'js-cookies';
import refresh from "../components/Refresher";

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const getdata = () => {
        let refreshToken = Cookies.getItem('refreshToken')
        if (refreshToken) {
            refresh(refreshToken)
                .then((res) => {
                    setAuth({
                        accessToken: res.accessToken,
                        refreshToken,
                        role: res.role,
                        username: res.username
                    })
                })
                .catch((er) => console.log("Inside catch", er))
        }
    }
    useEffect(() => {
        getdata()
    }, [])
    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext;