import axios from "axios"
import { BASE_API_URL } from "./constants";

const apiInstance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    
});

export default apiInstance