import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RefreshHandler({ setIsAuthenticated, setUserRole }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role"); // Get role from localStorage

        if (token && role) {
            setIsAuthenticated(true);
            setUserRole(role); // Set the user role from localStorage
            
            // Redirect based on role if on login or home
            if (location.pathname === "/" || location.pathname === "/login") {
                navigate(role === "admin" ? "/admin" : "/user", { replace: true });
            }
        } else {
            setIsAuthenticated(false);
            setUserRole(null); // Clear role if not authenticated
            
            // Redirect to login if user is not authenticated
            if (location.pathname !== "/login") {
                navigate("/login", { replace: true });
            }
        }
    }, [location, navigate, setIsAuthenticated, setUserRole]);

    return null; // This component only handles side effects
}

export default RefreshHandler;
