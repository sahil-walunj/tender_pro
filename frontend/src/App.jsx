import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/login.jsx";
import User from "./pages/User.jsx";
import Signup from "./pages/Signup.jsx";
import RefreshHandler from './refreshHandler';
import ApplyPage from "./pages/Apply.jsx";

function PrivateRoute({ element, isAuthenticated, allowedRole, userRole }) {
    return isAuthenticated && userRole === allowedRole ? element : <Navigate to="/login" />;
}

function App() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Set userRole from localStorage on render
    useEffect(() => {
        const role = localStorage.getItem("role");
    
        if (role) {
            setUserRole(role);
            setIsAuthenticated(true);
        } else {
            // Avoid redirecting if the user is already on the signup page
            if (window.location.pathname !== "/signup") {
                navigate("/login");
            }
        }
    }, []);
    

    return (
        <div>
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
        <Routes>
            <Route path="/signup" element={<Signup/>} />
            <Route path="/" element={<Navigate to="/login" />} />
            
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
            <Route 
                path="/admin" 
                element={<PrivateRoute element={<Admin />} isAuthenticated={isAuthenticated} allowedRole="admin" userRole={userRole} />} 
            />
            <Route 
                path="/user" 
                element={<PrivateRoute element={<User />} isAuthenticated={isAuthenticated} allowedRole="user" userRole={userRole} />} 
            />
            <Route 
                path="/apply" 
                element={<PrivateRoute element={<ApplyPage />} isAuthenticated={isAuthenticated} allowedRole="user" userRole={userRole} />} 
            />
        </Routes>
        </div>
    );
}

export default App;
