import axios from "axios";
const URL = process.env.NODE_ENV === 'production' ? process.env.WSURL : (import.meta.env.VITE_URL) ? import.meta.env.VITE_URL : '';

export default axios.create({
    baseURL: URL
})

export const axiosPrivate = axios.create({
    baseURL: URL,
    withCredentials: true
});