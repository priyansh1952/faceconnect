import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Define server before using it
const server = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/users`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null); // Ensure userData is initially null
  const navigate = useNavigate();

  const handleRegister = async (name, email, password) => {
    try {
      let request = await client.post("/register", { name, email, password });
      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      let request = await client.post("/login", { email, password });
      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        navigate("/home");
      }
    } catch (err) {
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      let request = await client.get("/get_all_activity", {
        headers: { Authorization: `Bearer ${token}` }, // Include token in headers
      });
      return request.data;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token"); // Clear expired token
        navigate("/auth"); // Redirect to login
      }
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      let request = await client.post(
        "/add_to_activity",
        { meeting_code: meetingCode },
        {
          headers: { Authorization: `Bearer ${token}` }, // Include token in headers
        }
      );
      console.log("Activity added successfully:", request.data);
      return request;
    } catch (e) {
      console.error("Error adding activity:", e.response?.data || e.message);
      if (e.response?.status === 401) {
        localStorage.removeItem("token"); // Clear expired token
        navigate("/auth"); // Redirect to login
      }
      throw e;
    }
  };

  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};