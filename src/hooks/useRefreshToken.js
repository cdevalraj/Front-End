import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axiosPrivate.post('/auth/token');
        setAuth(prev => { return { ...prev, accessToken: response.data.accessToken } });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;