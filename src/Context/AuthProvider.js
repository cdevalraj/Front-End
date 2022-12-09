import { createContext, useState } from "react";
import Cookies from 'js-cookies';

const getdata=()=>{
    let accessToken=Cookies.getItem('accessToken')
    let refreshTokenr=Cookies.getItem('refreshToken')
    let username=Cookies.getItem('username')
    let role=Cookies.getItem('role')
    let user={accessToken,refreshTokenr,username,role}
    if(user)
        return user;
    return {}
}
const AuthContext=createContext({})

export const AuthProvider=({children})=>{
    const [auth,setAuth]=useState(getdata());
    return (
        <AuthContext.Provider value={{auth,setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext;