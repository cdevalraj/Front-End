import axios from "axios";
const URL = (import.meta.env.PROD) ? (import.meta.env.VITE_BE_URL) ? import.meta.env.VITE_BE_URL : '' : (import.meta.env.VITE_URL) ? import.meta.env.VITE_URL : '';

export default axios.create({
    baseURL: URL
})

export const axiosPrivate = axios.create({
    baseURL: URL,
    withCredentials: true
});