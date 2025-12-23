import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { FaTruck, FaMapMarkerAlt, FaWeightHanging } from "react-icons/fa";
import dynamic from "next/dynamic";

// ✅ Dynamically import Lottie (for Next.js safety)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// ✅ Correct import path for animation JSON
// Make sure the file exists at: /web/public/animations/no-data.json
import noDataAnimation from "../../public/animations/no-data.json";

export default function SearchVehicles() {
  const router = useRouter();
  const [search, setSearch] = useState({ pickup: "", drop: "" });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [form, setForm] = useState({
    loadType: "",
    pickup: "",
    drop: "",
    date: "",
    time: "",
    price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const q = query(
        collection(db, "vehicles"),
        where("pickupLocation", "==", search.pickup),
        where("dropLocation", "==", search.drop)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVehicles(results);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      alert("❌ Failed to fetch vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uid = localStorage.getItem("linknride_uid");
      await addDoc(collection(db, "requests"), {
        customerId: uid,
        ownerId: selectedVehicle.ownerId,
        vehicleId: selectedVehicle.id,
        ...form,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("✅ Request sent successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error sending request:", error);
      alert("❌ Failed to send request.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide flex items-center gap-2">
          <FaTruck className="text-blue-600" /> Search Vehicles
        </h1>
        <button
          onClick={() => router.push("/customer/dashboard")}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Search Form */}
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 mb-12"
      >
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Find the Best Vehicle for Your Load
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pickup Location</label>
            <input
              name="pickup"
              value={search.pickup}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. Guntur"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Drop Location</label>
            <input
              name="drop"
              value={search.drop}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. Hyderabad"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-8 w-full py-3 text-white font-semibold rounded-lg shadow ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
        >
          {loading ? "Searching..." : "Search Vehicles"}
        </button>
      </motion.form>

      {/* Vehicle Results or No Data */}
      <AnimatePresence>
        {Array.isArray(vehicles) && vehicles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 mb-12"
          >
            {vehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl shadow-md border border-blue-100 flex flex-col items-start justify-between"
              >
                <div className="w-full">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <FaTruck /> {vehicle.vehicleType || "Unknown Type"}
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" /> {vehicle.pickupLocation} →{" "}
                    {vehicle.dropLocation}
                  </p>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <FaWeightHanging className="text-blue-500" /> Capacity: {vehicle.capacity} tons
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setShowModal(true);
                  }}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                >
                  Request Vehicle
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-72 h-72">
                <Lottie animationData={noDataAnimation} loop autoplay />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mt-4">
                No vehicles found for your route 😔
              </h3>
              <p className="text-gray-500 mt-2 mb-4 text-center">
                Try changing pickup or drop locations to see more options.
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVehicles([])}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                🔄 Try Again
              </motion.button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">
                Request Vehicle
              </h3>
              <form onSubmit={handleRequest} className="space-y-4">
                <input
                  type="text"
                  name="loadType"
                  placeholder="Load Type"
                  value={form.loadType}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
                <input
                  type="text"
                  name="pickup"
                  placeholder="Pickup Location"
                  value={form.pickup}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
                <input
                  type="text"
                  name="drop"
                  placeholder="Drop Location"
                  value={form.drop}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Your Price Offer (₹)"
                  value={form.price}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-4 py-2 rounded-lg"
                />
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()} LinknRide. All rights reserved.
      </footer>
    </div>
  );
}
