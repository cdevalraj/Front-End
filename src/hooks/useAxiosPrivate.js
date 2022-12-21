import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

// const parseJwt = (token) => {
//     try {
//         return JSON.parse(atob(token.split(".")[1]));
//     } catch (e) {
//         return null;
//     }
// };

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();
    useEffect(() => {
        // const requestIntercept = axiosPrivate.interceptors.request.use(
        //     (config) => {
        //         if (config.headers['Authorization']) {
        //             let t = config.headers['Authorization'].split(' ')[1]
        //             const dt = parseJwt(t);
        //             if (dt && dt.exp*1000<=Date.now()) {
        //                 console.log("Refreshing")
        //                 const newAccessToken = refresh()
        //                 config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        //             }
        //         }
        //         return config;
        //     }, (error) => console.log(error.message)
        // );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    try {
                        const newAccessToken = await refresh();
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest);
                    }
                    catch (er) {
                        console.log(er.message)
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            // axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;