// web/pages/owner/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaTruck, FaMapMarkerAlt, FaArrowLeft, FaUser } from "react-icons/fa";

export default function OwnerProfile() {
  const router = useRouter();
  const [ownerData, setOwnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const uid = localStorage.getItem("linknride_uid");
        if (!uid) {
          router.push("/login");
          return;
        }
        const docRef = doc(db, "owners", uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) setOwnerData(snap.data());
      } catch (err) {
        console.error("Error loading owner profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-blue-50">
        <p className="text-gray-600 text-lg mb-4">No owner data found 😔</p>
        <button
          onClick={() => router.push("/onboard/owner")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Complete Onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold text-blue-700 tracking-wide flex items-center gap-2">
          <FaUser className="text-blue-600" /> Owner Profile
        </h1>
        <button
          onClick={() => router.push("/owner/dashboard")}
          className="text-blue-600 hover:underline flex items-center gap-2 font-medium"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </header>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-blue-100"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          {ownerData.fullName || "Owner Name"}
        </h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-gray-700">
          <p><span className="font-semibold text-gray-800">📞 Mobile:</span> {ownerData.phone}</p>
          <p><span className="font-semibold text-gray-800">📧 Email:</span> {ownerData.email || "N/A"}</p>
          <p><span className="font-semibold text-gray-800">🏙️ City:</span> {ownerData.city}</p>
          <p><span className="font-semibold text-gray-800">🗺️ State:</span> {ownerData.state}</p>
          <p><span className="font-semibold text-gray-800">📮 Pincode:</span> {ownerData.pincode}</p>
          <p><span className="font-semibold text-gray-800">📍 Address:</span> {ownerData.address}</p>
        </div>

        {/* Aadhaar */}
        {ownerData.aadharUrl && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Aadhaar Document</h3>
            <a
              href={ownerData.aadharUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              View Uploaded Aadhaar
            </a>
          </div>
        )}

        {/* Vehicles Section */}
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <FaTruck /> Registered Vehicles ({ownerData.vehicles?.length || 0})
          </h3>

          {ownerData.vehicles && ownerData.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerData.vehicles.map((vehicle: any, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-50 border border-blue-100 p-5 rounded-xl shadow-sm"
                >
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">
                    🚚 {vehicle.vehicleNumber || "Unknown Vehicle"}
                  </h4>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Type:</span>{" "}
                    {vehicle.vehicleType}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Capacity:</span>{" "}
                    {vehicle.capacity} tons
                  </p>
                  {vehicle.rcNumber && (
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">RC Number:</span>{" "}
                      {vehicle.rcNumber}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    Added: {new Date(vehicle.addedAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-4">
              No vehicles registered yet 🚗
            </p>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-10">
        © {new Date().getFullYear()} <span className="font-semibold">LinknRide</span>. All rights reserved.
      </footer>
    </div>
  );
}
