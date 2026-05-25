import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-college-backend-ja0y.onrender.com/api",
});


// ✅ Token auto attach
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
return req;
});

export default API;
