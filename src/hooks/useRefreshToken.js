import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth, setPersist } = useAuth();

    const refresh = async () => {
        try {
            const response = await axiosPrivate.post('/auth/token');
            setAuth(prev => { return { ...prev, accessToken: response.data.accessToken } });
            return response.data.accessToken;
        }
        catch (er) {
            if (er.response.status === 401 || er.response.status === 403) {
                setAuth({})
                setPersist(false)
            }
        }
    }
    return refresh;
};

export default useRefreshToken;