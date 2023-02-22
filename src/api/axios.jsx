import axios from "axios";

export default axios.create({
    baseURL: "http://localhost:3001"
})

export const axiosPrivate = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true
});