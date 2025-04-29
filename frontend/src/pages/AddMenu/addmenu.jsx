import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext"; // 🔥 Added

function AddMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [specialMenuItems, setSpecialMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSpecialMenuPage, setShowSpecialMenuPage] = useState(false);
  const [todaySpecialMenus, setTodaySpecialMenus] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextSpecialDate, setNextSpecialDate] = useState(null);

  const countdownInterval = useRef(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useContext(AuthContext); // 🔥 Added

  const specialDays = ["02-14", "04-14", "12-25", "12-31"];

  useEffect(() => {
    fetchMenuItems();
    fetchSpecialMenuItems();

    const storedDate = sessionStorage.getItem('nextSpecialDate');
    if (storedDate) {
      const dateObj = new Date(storedDate);
      setNextSpecialDate(dateObj);
    }

    const specialMenuStatus = sessionStorage.getItem('showSpecialMenuPage');
    if (specialMenuStatus === "true") {
      setShowSpecialMenuPage(true);
    }

    return () => clearInterval(countdownInterval.current);
  }, []);

  useEffect(() => {
    if (nextSpecialDate && showSpecialMenuPage && todaySpecialMenus.length === 0) {
      startCountdown(nextSpecialDate);
    }
  }, [nextSpecialDate, showSpecialMenuPage, todaySpecialMenus]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/menu");
      setMenuItems(response.data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchSpecialMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/specialmenu");
      setSpecialMenuItems(response.data || []);
    } catch (error) {
      console.error("Error fetching special menu items:", error);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${month}-${day}`;
  };

  const isTodayWeekend = () => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 || day === 6;
  };

  const handleSpecialMenuClick = () => {
    const todayStr = getTodayString();
    const todaysSpecials = specialMenuItems.filter(item => item.specialDay === todayStr);

    if (todaysSpecials.length > 0 || isTodayWeekend()) {
      setTodaySpecialMenus(todaysSpecials);
      setShowSpecialMenuPage(true);
      sessionStorage.setItem('showSpecialMenuPage', true);
    } else {
      if (nextSpecialDate) {
        setShowSpecialMenuPage(true);
        sessionStorage.setItem('showSpecialMenuPage', true);
        return;
      }

      const now = new Date();
      const futureDates = [];

      const nextSaturday = new Date(now);
      nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
      futureDates.push(nextSaturday);

      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
      futureDates.push(nextSunday);

      specialDays.forEach((dateStr) => {
        const [month, day] = dateStr.split("-");
        const specialDate = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day));
        if (specialDate >= now) {
          futureDates.push(specialDate);
        }
      });

      const nextClosest = futureDates.reduce((a, b) => (a - now < b - now ? a : b));
      setNextSpecialDate(nextClosest);
      sessionStorage.setItem('nextSpecialDate', nextClosest.toISOString());
      setTodaySpecialMenus([]);
      setShowSpecialMenuPage(true);
      sessionStorage.setItem('showSpecialMenuPage', true);
    }
  };

  const startCountdown = (targetDate) => {
    clearInterval(countdownInterval.current);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        clearInterval(countdownInterval.current);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        sessionStorage.removeItem('nextSpecialDate');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    countdownInterval.current = setInterval(updateCountdown, 1000);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url('/menu4.jpeg')` }}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative p-8">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Welcome to Ceylon Flavors!</h1>

        <div className="text-center mb-6">
          <button
            onClick={handleSpecialMenuClick}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Special Menu
          </button>
          {showSpecialMenuPage && (
            <button
              onClick={() => {
                setShowSpecialMenuPage(false);
                sessionStorage.removeItem('showSpecialMenuPage');
              }}
              className="ml-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Back to Full Menu
            </button>
          )}
        </div>

        {!showSpecialMenuPage && (
          <>
            <div className="text-center mb-6">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="text-center mb-6">
              {['Appetizers', 'Main Dishes', 'Desserts', 'Beverages', 'All'].map((category) => (
                <button
                  key={category}
                  className={`m-1 px-4 py-2 text-white rounded-lg ${selectedCategory === category ? 'bg-blue-700' : 'bg-blue-500'} hover:bg-blue-600`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <MenuItem key={item._id} item={item} addToCart={addToCart} />
              ))}
            </div>
          </>
        )}

        {showSpecialMenuPage && todaySpecialMenus.length > 0 && (
          <div className="text-white text-center mt-8">
            <h2 className="text-2xl font-bold mb-6">Today's Special Menu 🍽️</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaySpecialMenus.map((item) => (
                <MenuItem key={item._id} item={item} addToCart={addToCart} />
              ))}
            </div>
          </div>
        )}

        {showSpecialMenuPage && todaySpecialMenus.length === 0 && (
          <div className="min-h-screen flex flex-col justify-center items-center bg-black text-yellow-400 animate-pulse">
            <h2 className="text-6xl font-bold mb-10">Countdown to Next Special Menu 🎉</h2>
            <div className="flex gap-10 text-8xl font-extrabold animate-bounce">
              <div>{countdown.days}d</div>
              <div>{countdown.hours}h</div>
              <div>{countdown.minutes}m</div>
              <div>{countdown.seconds}s</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Updated MenuItem Component
function MenuItem({ item, addToCart }) {
  const { user } = useContext(AuthContext); // 🔥 Added here also

  const handleAddToCart = () => {
    if (!user) {
      alert("🚫 Please login to add items to your cart!");
      return;
    }
    addToCart(item);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center">
      <img
        src={`http://localhost:5000/uploads/${item.image}`}
        alt={item.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
      <p className="text-gray-600 mb-2">{item.description}</p>
      <p className="text-gray-800 font-semibold">Price: Rs.{item.price}.00</p>
      <p className={`mt-2 text-sm font-medium ${item.availability ? "text-green-600" : "text-red-600"}`}>
        {item.availability ? "Available" : "Unavailable"}
      </p>
      <button
        onClick={handleAddToCart}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default AddMenu;
