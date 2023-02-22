import { useLocation, Navigate, Outlet} from "react-router-dom";
import jwtDecode from "jwt-decode";
import useAuth from "../hooks/useAuth";


const RequireAdminAuth=({AllowedRole})=>{
    const {auth}=useAuth()
    const location=useLocation();
    const decoded=auth?.accessToken?jwtDecode(auth.accessToken):undefined
    const role=decoded?.role || ''

    return (
        (role===AllowedRole)
            ?<Outlet/>
            :<Navigate to='/auth/login' state={{from:location}} replace />
    );
}

export default RequireAdminAuth;