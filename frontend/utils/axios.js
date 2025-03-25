import axios from "axios"
// import { API_BASE_URL } from "./constants";

const apiInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    timeout: 60000,
    headers: {
        "Content-Type": "applications/json",
        Accept: "application/json",
    },
    
});

export default apiInstance