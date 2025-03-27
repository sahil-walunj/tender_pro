import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { Eye, EyeOff } from "lucide-react";
import "../App.css";
import sallyImage from "../assets/Saly-14.svg";

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // Default role
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/${role}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            handleSuccess("Signup successful! Please log in.");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#C5C1C0] min-h-screen flex flex-col">
            <div className="col-span-8 p-10 self-center sm:self-start font-semibold text-[1.5rem]">TenderPro</div>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-8 justify-center bg-[#C5C1C0] flex-1">
                <div className="hidden lg:block col-span-1"></div>
                <div className="flex lg:hidden flex-col col-span-2">
                    <div>
                        <div className="p-0 font-regular text-[2.5rem]">Create an account</div>
                        <div className="p-0 font-semibold text-[1.8em]">TenderPro</div>
                        <div className="p-2"></div>
                    </div>
                </div>
                <div className="hidden lg:flex flex-col col-span-2">
                    <div className="mt-[20vh]">
                        <div className="p-0 font-regular text-[3.2rem]">Create an account</div>
                        <div className="p-0 font-semibold text-[2.5em]">TenderPro</div>
                        <div className="p-2"></div>
                        <div className="p-0 font-regular text-[0.8rem]">Already have an account?</div>
                        <div className="p-0 font-regular text-[0.8rem]">
                            <a className="underline text-blue-950" href="http://localhost:5173/login">Login</a>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex col-span-2 items-end">
                    <img src={sallyImage} alt="Sally" className="w-full h-[55vh]" />
                </div>
                <div className="col-span-3 flex items-center justify-center">
                    <div className="justify-self-center mb-[35.33vh] w-[400px]">
                        <h1 className="hidden lg:block text-3xl font-medium text-left mb-6">Sign up</h1>

                        {error && <p className="text-[#D32F2F] text-sm mb-4">{error}</p>}

                        <form onSubmit={handleSignup} className="space-y-6 w-full">
                            <div className="flex items-center gap-4">
                                <label className="font-medium">Signup as:</label>
                                {["user", "admin"].map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={option}
                                            checked={role === option}
                                            onChange={() => setRole(option)}
                                            className="appearance-none w-4 h-4 border-2 border-gray-600 rounded-full checked:bg-[#1A2930] checked:border-[#1A2930]"
                                        />
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label className="block font-medium">Username</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 border border-gray-400 rounded-md bg-[#ADB5BD] text-black focus:outline-none focus:ring-2 focus:ring-[#868C90]"
                                    placeholder="Enter Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-medium">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-5 py-3 border border-gray-400 rounded-md bg-[#ADB5BD] text-black focus:outline-none focus:ring-2 focus:ring-[#868C90]"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="block font-medium">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-5 py-3 border border-gray-400 rounded-md bg-[#ADB5BD] text-black focus:outline-none focus:ring-2 focus:ring-[#868C90]"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-10 text-black"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 text-[#C9AE5B] font-bold bg-[#1A2930] rounded-md hover:bg-[#495057] transition disabled:bg-gray-500"
                                disabled={loading}
                            >
                                {loading ? "Signing up..." : "Sign up"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
