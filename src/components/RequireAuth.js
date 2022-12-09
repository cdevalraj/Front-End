import { useLocation, Navigate, Outlet} from "react-router-dom"
import useAuth from "../hooks/useAuth"


const RequireAuth=({AllowedRole})=>{
    const {auth}=useAuth()
    const location=useLocation();
    return (
        (auth?.role===AllowedRole)
            ?<Outlet/>
            :<Navigate to='/auth/login' state={{from:location}} replace />
    );
}

export default RequireAuth;