import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";

// ✅ Helper to validate Indian vehicle numbers (RTA format)
const isValidVehicleNumber = (num: string) => {
  return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(num.toUpperCase());
};

export default function PostVehicle() {
  const router = useRouter();
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "",
    capacity: "",
    pickupLocation: "",
    dropLocation: "",
    availableDate: "",
    availableTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicleValid, setVehicleValid] = useState(true);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "vehicleNumber") {
      setVehicleValid(isValidVehicleNumber(value));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const uid = localStorage.getItem("linknride_uid");
      if (!uid) throw new Error("User not authenticated");

      if (
        !form.vehicleNumber ||
        !form.pickupLocation ||
        !form.dropLocation ||
        !form.availableDate
      ) {
        throw new Error("Please fill all required fields");
      }

      if (!vehicleValid) throw new Error("Invalid vehicle number format");

      await addDoc(collection(db, "vehicles"), {
        ownerId: uid,
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        vehicleType: form.vehicleType,
        capacity: form.capacity,
        pickupLocation: form.pickupLocation,
        dropLocation: form.dropLocation,
        availableDate: form.availableDate,
        availableTime: form.availableTime,
        status: "available",
        postedAt: serverTimestamp(),
      });

      alert("✅ Vehicle posted successfully!");
      router.push("/owner/dashboard");
    } catch (err: any) {
      console.error("Error posting vehicle:", err);
      setError(err.message || "Failed to post vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold text-blue-700 tracking-wide flex items-center gap-2">
          <FaTruck className="text-blue-600" /> Post Vehicle
        </h1>
        <button
          onClick={() => router.push("/owner/dashboard")}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10 mb-12"
      >
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Add Vehicle Availability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Vehicle Number *
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              placeholder="e.g. AP09AB1234"
              required
              className={`w-full border rounded-lg px-4 py-2 focus:ring outline-none ${
                vehicleValid ? "focus:ring-blue-200" : "border-red-400 focus:ring-red-200"
              }`}
            />
            {!vehicleValid && (
              <p className="text-red-600 text-sm mt-1">
                ⚠️ Invalid vehicle number format (e.g., AP09AB1234)
              </p>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Vehicle Type *
            </label>
            <select
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
            >
              <option value="">Select Type</option>
              <option value="Truck">Truck</option>
              <option value="Mini Van">Mini Van</option>
              <option value="DCM">DCM</option>
              <option value="Tempo">Tempo</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Capacity (tons)
            </label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="e.g. 6"
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Pickup Location *
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <input
                type="text"
                name="pickupLocation"
                value={form.pickupLocation}
                onChange={handleChange}
                placeholder="e.g. Guntur"
                required
                className="w-full py-2 outline-none"
              />
            </div>
          </div>

          {/* Drop Location */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Drop Location *
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <input
                type="text"
                name="dropLocation"
                value={form.dropLocation}
                onChange={handleChange}
                placeholder="e.g. Hyderabad"
                required
                className="w-full py-2 outline-none"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Available Date *
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <input
                type="date"
                name="availableDate"
                value={form.availableDate}
                onChange={handleChange}
                required
                className="w-full py-2 outline-none"
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Available Time
            </label>
            <div className="flex items-center border rounded-lg px-3">
              <FaClock className="text-blue-500 mr-2" />
              <input
                type="time"
                name="availableTime"
                value={form.availableTime}
                onChange={handleChange}
                className="w-full py-2 outline-none"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !vehicleValid}
          className={`mt-8 w-full py-3 text-white font-semibold rounded-lg shadow ${
            loading || !vehicleValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
        >
          {loading ? "Posting..." : "Post Vehicle"}
        </button>
      </motion.form>

      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()} LinknRide. All rights reserved.
      </footer>
    </div>
  );
}
