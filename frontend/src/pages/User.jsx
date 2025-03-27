import { useState, useEffect, useRef } from "react";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function User() {
  const [showing, setShowing] = useState("main");

  return (
    <div className="app-container">
      <NavBar setShowing={setShowing} />
      {showing === "search" ? <SearchResults /> : <Main />}
    </div>
  );
}

function NavBar({ setShowing }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const response = await fetch("http://localhost:5000/api/user/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Role: role,
        },
        body: JSON.stringify({ name: searchQuery }),
      });

      const data = await response.json();
      console.log("Search Results:", data);
      setShowing("search");
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  return (
    <nav className="bg-[#D9D9D9] text-black py-4 px-6 fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
      <h1 className="text-[1.5rem] font-semibold">TenderPro</h1>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        <button onClick={() => setShowing("main")} className="text-[1rem] font-medium hover:underline">
          Home
        </button>
        <button onClick={() => navigate("/apply")} className="text-[1rem] font-medium hover:underline">ApplyTender</button>
        <button onClick={handleLogout} className="text-[1rem] font-medium hover:underline">
          Logout
        </button>

        {/* Search Box */}
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search for tenders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 pr-4 py-2 w-60 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-xl" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#D9D9D9] shadow-md flex flex-col items-center py-4 gap-4 md:hidden">
          <button onClick={() => setShowing("main")} className="hover:underline">
            Home
          </button>
          <button className="hover:underline">ApplyTender</button>
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>

          {/* Search Box (Mobile) */}
          <div className="relative w-4/5">
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              placeholder="Search for tenders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      )}
    </nav>
  );
}


function TenderCarousel({ tenders, title,apk }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth; // Scroll by container width
      scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative pt-6 ">
      <h1 className="text-[1.5rem] font-medium p-6">{title}</h1>

      <div className="relative overflow-hidden">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#c5c1c075] text-black p-2 rounded-full shadow-md"
          onClick={() => scroll("left")}
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-4"
        >
          {tenders.length === 0 ? (
            <p className="p-4">No tenders available.</p>
          ) : (
            tenders.map((tender) =>
              apk === "N1" ? (
                <TenderCard key={tender.id} tender={tender} />
              ) : (
                <ApplicationCard key={tender.id} tender={tender} />
              )
            )
          )}
        </div>

        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#c5c1c075] text-black p-2 rounded-full shadow-md"
          onClick={() => scroll("right")}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

function Main() {
  const [newTenders, setNewTenders] = useState([]);
  const [appliedTenders, setAppliedTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewTenders();
    fetchAppliedTenders();
  }, []);

  const fetchNewTenders = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const response = await fetch("http://localhost:5000/api/user/top10", {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: role,
        },
      });

      const data = await response.json();
      setNewTenders(data);
    } catch (err) {
      setError("Failed to load new tenders.");
    }
  };

  const fetchAppliedTenders = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const response = await fetch("http://localhost:5000/api/user/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: role,
        },
      });

      const data = await response.json();
      if (!data.tendersapplied || data.tendersapplied.length === 0) {
        setAppliedTenders([]);
        setLoading(false);
        return;
      }

      const appliedDetails = await Promise.all(
        data.tendersapplied.map(async (tenderId) => {
          const res = await fetch(`http://localhost:5000/api/user/info/${tenderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Role: role,
            },
          });
          return res.json();
        })
      );

      setAppliedTenders(appliedDetails);
      setLoading(false);
    } catch (err) {
      setError("Failed to load applied tenders.");
    }
  };

  return (
    <div className="pt-20 px-4">
      {error && <p className="text-red-500">{error}</p>}

      <TenderCarousel tenders={newTenders} title="New Tenders" apk="N1"/>
      {loading ? <p>Loading applied tenders...</p> : <TenderCarousel tenders={appliedTenders} title="Applied Tenders" apk="N2"/>}
    </div>
  );
}

function TenderCard({ tender }) {
  const tenderId=tender._id;
  const navigate = useNavigate();
  return (
    <div className="border bg-[#D9D9D9] border-gray-300 p-4 rounded-md shadow-md w-lg flex-shrink-0 h-64 grid grid-rows-[auto_1fr_auto] gap-2">
      {/* Title with fixed size */}
      <h2 className="text-xl font-semibold">{tender.title}</h2>

      {/* Description with flexible height */}
      <div className="text-gray-700 whitespace-normal break-words overflow-hidden">
        {tender.description || <span className="opacity-0">No description</span>}
      </div>

      {/* PDF Link */}
      {tender.pdfdata && (
        <a
          href={tender.pdfdata}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline mt-2 block hover:text-[#C9AE5B]"
        >
          View Tender PDF
        </a>
      )}

      {/* Apply Button - Always at Bottom */}
      <button
        onClick={() => {
          navigate("/apply", { state: { tenderId } }); // Navigate correctly
        }}
        className="w-full py-2 text-[#C9AE5B] font-bold bg-[#1A2930] rounded-md hover:bg-[#495057] transition disabled:bg-gray-500 mt-auto"
      >
        Apply
      </button>
    </div>
  );
}

function ApplicationCard({ tender }) {
  return (
    <div className="border bg-[#D9D9D9] border-gray-300 p-4 rounded-md shadow-md w-lg flex-shrink-0 h-64 grid grid-rows-[auto_1fr_auto] gap-2">
      {/* Title with fixed size */}
      <h2 className="text-xl font-semibold">{tender.title}</h2>

      {/* Description with flexible height */}
      <div className="text-gray-700 whitespace-normal break-words overflow-hidden">
        {tender.description || <span className="opacity-0">No description</span>}
      </div>

      {/* PDF Link */}
      {tender.pdfdata && (
        <a
          href={tender.pdfdata}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline mt-2 block hover:text-[#C9AE5B]"
        >
          View Tender PDF
        </a>
      )}

      {/* Apply Button - Always at Bottom */}
      <button
        className="w-full py-2 text-[#BFBC95] font-bold bg-[#2B5365] rounded-md hover:bg-[#304651] transition disabled:bg-gray-500 mt-auto"
      >
        View Application
      </button>
    </div>
  );
}



function SearchResults() {
  return (
    <div className="pt-20">
      <h1 className="text-[1.5rem] font-medium p-6">Search Results</h1>
      <div></div>
    </div>
  );
}

export default User;
