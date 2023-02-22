import useAuth from './useAuth';
import useAxiosPrivate from './useAxiosPrivate';

const useLogOut = () => {
    const axiosPrivate = useAxiosPrivate();
    const { setAuth, setPersist } = useAuth()
    const LogOut = async () => {
        try {
            setPersist(false)
            setAuth({});
            await axiosPrivate.delete('/auth/logout')
        } catch (er) {
            console.log(er.message)
        }
    }
    return LogOut
}
export default useLogOut;