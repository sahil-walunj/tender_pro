import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const ApplyPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get tenderId from state or user input
    const tenderIdFromState = location.state?.tenderId;
    const [tenderId, setTenderId] = useState(tenderIdFromState || "");
    const [tenderInfo, setTenderInfo] = useState(null);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [pdfdata, setPdfdata] = useState(null); // Updated variable name

    useEffect(() => {
        if (tenderId) {
            fetchTenderInfo(tenderId);
        }
    }, [tenderId]);

    // ✅ Fetch tender details from backend
    const fetchTenderInfo = async (tenderId) => {
        try {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");

            const response = await axios.get(`http://localhost:5000/api/user/info/${tenderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Role: role
                }
            });

            setTenderInfo(response.data);
        } catch (error) {
            console.error("Error fetching tender info:", error);
            alert("Failed to fetch tender details");
        }
    };

    // ✅ Handle form submission
    const handleApplicationSubmit = async (e) => {
        e.preventDefault();

        if (!title || !price || !pdfdata) {
            alert("Please fill all fields and upload a file");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");

            const formData = new FormData();
            formData.append("title", title);
            formData.append("price", price);
            formData.append("pdfdata", pdfdata); // Changed key from "file" to "pdfdata"
            formData.append("id", tenderId);

            await axios.post("http://localhost:5000/api/user/applytender", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Role: role,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Application submitted successfully!");
            navigate("/"); // Redirect after submission
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Failed to submit application");
        }
    };

    return (
        <div className="p-6">
            {tenderId ? (
                <>
                    {/* ✅ Tender Details Section */}
                    {tenderInfo ? (
                        <div className="bg-gray-200 p-4 rounded-lg shadow-md mb-4">
                            <h2 className="text-xl font-semibold">{tenderInfo.title}</h2>
                            <p>{tenderInfo.description}</p>
                            {tenderInfo.pdfdata && (
                                <iframe
                                    src={tenderInfo.pdfdata}
                                    title="Tender PDF"
                                    className="w-full h-screen mt-2 border"
                                />
                            )}
                        </div>
                    ) : (
                        <p>Loading tender details...</p>
                    )}

                    {/* ✅ Application Form */}
                    <form onSubmit={handleApplicationSubmit} className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Apply for Tender</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                        />
                        <input
                            type="file"
                            onChange={(e) => setPdfdata(e.target.files[0])} // Updated state variable
                            className="w-full p-2 border rounded mb-2"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            Submit Application
                        </button>
                    </form>
                </>
            ) : (
                /* ✅ Tender ID Input */
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h2>Enter Tender ID to Continue</h2>
                    <input
                        type="text"
                        placeholder="Enter Tender ID"
                        value={tenderId}
                        onChange={(e) => setTenderId(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                    />
                    <button
                        onClick={() => {
                            if (!tenderId.trim()) {
                                alert("Please enter a Tender ID");
                                return;
                            }
                            navigate("/apply", { state: { tenderId } });
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Proceed
                    </button>
                </div>
            )}
        </div>
    );
};

export default ApplyPage;
