import { createContext, useState } from "react";

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    // const getdata = () => {
    //     let refreshToken = Cookies.get('refreshToken')
    //     if (refreshToken) {
    //         const isTokenExpired = token => Date.now() >= (JSON.parse(atob(token.split('.')[1]))).exp * 1000;
    //         if(isTokenExpired(refreshToken))
    //         {
    //             refresh(refreshToken)
    //             .then((res) => {
    //                 setAuth({
    //                     accessToken: res.accessToken,
    //                     refreshToken,
    //                     role: res.role,
    //                     username: res.username
    //                 })
    //             })
    //             .catch((er) => console.log("Inside catch", er))
    //         }
            
    //     }
    // }
    // useEffect(() => {
    //     getdata()
    // }, [])
    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext;