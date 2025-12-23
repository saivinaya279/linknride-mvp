import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userPhoto, setUserPhoto] = useState("/default-avatar.png");
  const [userName, setUserName] = useState("Customer");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = localStorage.getItem("linknride_uid");
        if (!uid) return;

        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          const name = data?.profile?.fullName || "Customer";
          const photo = data?.profile?.photoURL || "/default-avatar.png";

          setUserName(name);
          setUserPhoto(photo);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Top Navigation */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src="/web/public/logo.jpg"
            alt="LinknRide Logo"
            className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
          />
          <h1 className="text-2xl font-bold text-blue-700 tracking-wide">
            LINKNRIDE
          </h1>
        </div>

        <nav className="flex items-center gap-6 text-gray-700">
          <button
            onClick={() => router.push("/customer/dashboard")}
            className="font-medium text-blue-600 flex items-center gap-1"
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => router.push("/customer/my-loads")}
            className="font-medium flex items-center gap-1 hover:text-blue-600"
          >
            📋 My Loads
          </button>
          <button
            onClick={() => router.push("/customer/my-requests")}
            className="font-medium flex items-center gap-1 hover:text-blue-600"
          >
            💬 My Requests
          </button>

          {/* Profile dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition">
              <span className="text-sm text-gray-700 truncate max-w-[120px]">
                Hi, {userName.split(" ")[0]}
              </span>
              <img
                src={userPhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-gray-300 object-cover"
              />
            </button>

            <div className="absolute right-0 hidden group-hover:block bg-white shadow-md rounded-lg mt-2 w-40 z-20">
              <button
                onClick={() => router.push("/customer/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                My Profile
              </button>
              <button
                onClick={() => router.push("/customer/edit-profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("linknride_uid");
                  router.push("/login");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center flex-grow px-6 py-16"
      >
        <h2 className="text-3xl font-bold text-blue-700 mb-10 text-center">
          Customer Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Post My Load */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                📦 Post My Load
              </h3>
              <p className="text-gray-600 mt-2">
                Add details about goods, pickup & drop, and share with owners.
              </p>
            </div>
            <button
              onClick={() => router.push("/customer/post-load")}
              className="mt-6 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Open
            </button>
          </motion.div>

          {/* Search Vehicles */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                🚚 Search Vehicles
              </h3>
              <p className="text-gray-600 mt-2">
                Find available vehicles posted by owners for your transport needs.
              </p>
            </div>
            <button
              onClick={() => router.push("/customer/search-vehicles")}
              className="mt-6 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Open
            </button>
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">LinknRide</span>. All rights reserved.
      </footer>
    </div>
  );
}
