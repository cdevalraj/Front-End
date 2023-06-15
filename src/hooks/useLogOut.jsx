import useAuth from './useAuth';
import useAxiosPrivate from './useAxiosPrivate';

const useLogOut = () => {
    const axiosPrivate = useAxiosPrivate();
    const { auth, setAuth, setPersist } = useAuth()
    const LogOut = async () => {
        try {
            setPersist(false)
            if (auth.loggedOut===undefined || auth.loggedOut === false) {
                const res = await axiosPrivate.delete('/auth/logout');
                if (res && res.status === 204)
                    setAuth({ loggedOut: true });
            }
        } catch (er) {
            console.log(er.message)
            if(er.message==='Network Error')
                setAuth({ loggedOut: true });
        }
    }
    return LogOut
}
export default useLogOut;