import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { FaTruck, FaSearch, FaUserTie, FaUserCircle, FaClipboardList, FaHistory } from "react-icons/fa";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function OwnerDashboard() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const uid = localStorage.getItem("linknride_uid");
        if (!uid) {
          router.push("/login");
          return;
        }
        const docRef = doc(db, "owners", uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) setOwner(snapshot.data());
        else router.push("/onboard/owner");
      } catch (err) {
        console.error("Error loading owner:", err);
      }
    };
    fetchOwner();
  }, [router]);

  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center px-10 py-4 shadow-sm bg-white sticky top-0 z-20">
        {/* Logo */}
        <div onClick={() => router.push("/owner/dashboard")} className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo-icon.png"
            alt="LinknRide Logo"
            width={32}
            height={32}
            className="rounded-full border border-gray-300"
          />
          <h1 className="text-2xl font-bold text-blue-700 tracking-wide">LINKNRIDE</h1>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3 focus:outline-none">
            {owner?.avatarUrl ? (
              <Image
                src={owner.avatarUrl}
                alt="Owner Avatar"
                width={36}
                height={36}
                className="rounded-full border border-gray-300 shadow-sm object-cover"
              />
            ) : (
              <FaUserCircle className="text-3xl text-blue-600" />
            )}
            <span className="font-medium text-gray-700 text-sm">
              Hi, {owner?.fullName?.split(" ")[0] || "Owner"} ▾
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleNavigate("/owner/profile")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                👤 View Profile
              </button>
              <button
                onClick={() => handleNavigate("/onboard/owner")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push("/login");
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== Top Quick Buttons ===== */}
      <div className="flex justify-end gap-4 pr-10 mt-6">
        <button
          onClick={() => handleNavigate("/owner/my-vehicles")}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
        >
          <FaClipboardList /> My Vehicles
        </button>
        <button
          onClick={() => handleNavigate("/owner/view-history")}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
        >
          <FaHistory /> View History
        </button>
      </div>

      {/* ===== Dashboard Content ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mt-10 px-6"
      >
        <h2 className="text-2xl font-semibold text-blue-700 mb-10 text-center">
          Welcome Back, {owner?.fullName?.split(" ")[0] || "Owner"} 👋
          <span className="block text-gray-600 text-lg mt-1">
            Manage your fleet, find loads, and hire drivers
          </span>
        </h2>

        {/* ===== Middle Cards (Main 3 Modules) ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Post Vehicle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate("/owner/post-vehicle")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all flex flex-col items-center"
          >
            <FaTruck className="text-5xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Post My Vehicle
            </h3>
            <p className="text-gray-500 text-center">
              Add and publish vehicle availability for customers to find.
            </p>
          </motion.div>

          {/* Search Loads */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate("/owner/search-loads")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all flex flex-col items-center"
          >
            <FaSearch className="text-5xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Search Loads
            </h3>
            <p className="text-gray-500 text-center">
              Browse available customer loads and send transport offers.
            </p>
          </motion.div>

          {/* Hire Drivers */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate("/owner/hire-drivers")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all flex flex-col items-center"
          >
            <FaUserTie className="text-5xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Hire Drivers
            </h3>
            <p className="text-gray-500 text-center">
              Find skilled drivers for your fleet or post job requirements.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Footer ===== */}
      <footer className="mt-auto text-center text-gray-500 text-sm py-4 border-t">
        © {new Date().getFullYear()} <span className="font-semibold">LinknRide</span>. All rights reserved.
      </footer>
    </div>
  );
}
