import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useRouter } from "next/router";

export default function PostLoad() {
  const [form, setForm] = useState({
    typeOfGoods: "",
    capacityRequired: "",
    preferredVehicleType: "",
    pickup: "",
    drop: "",
    pickupDate: "",
    pickupTime: "",
    price: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Aadhaar Check Before Posting
  useEffect(() => {
    const checkAadhaar = async () => {
      const uid = localStorage.getItem("linknride_uid");
      if (!uid) {
        alert("Please login again.");
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (!data.profile?.aadhar) {
          alert("⚠️ Please update your Aadhaar in Profile before posting a load.");
          router.push("/customer/edit-profile");
        }
      }
    };
    checkAadhaar();
  }, [router]);

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Standardized Firestore Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uid = localStorage.getItem("linknride_uid");
      const customerName = localStorage.getItem("linknride_name") || "Anonymous";

      if (!uid) {
        alert("Please login again.");
        router.push("/login");
        return;
      }

      // ✅ Unified field names (matches owner search-loads.tsx)
      await addDoc(collection(db, "loads"), {
        customerId: uid,
        customerName,
        typeOfGoods: form.typeOfGoods,
        capacityRequired: form.capacityRequired,
        preferredVehicleType: form.preferredVehicleType,
        pickup: form.pickup,
        drop: form.drop,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        pickupDateTime: `${form.pickupDate} ${form.pickupTime}`,
        price: Number(form.price),
        instructions: form.instructions || "",
        status: "open", // visible for bidding
        createdAt: serverTimestamp(),
      });

      alert("✅ Load posted successfully!");
      router.push("/customer/dashboard");
    } catch (error) {
      console.error("Error posting load:", error);
      alert("❌ Failed to post load. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide">Post My Load</h1>
        <button
          onClick={() => router.push("/customer/dashboard")}
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
        className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 mb-12"
      >
        <h2 className="text-2xl font-semibold text-blue-700 mb-6">Enter Load Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Type of Goods *</label>
            <input
              name="typeOfGoods"
              value={form.typeOfGoods}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. Vegetables, Furniture"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Required Capacity (in Tons) *</label>
            <input
              name="capacityRequired"
              value={form.capacityRequired}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. 10"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Preferred Vehicle Type</label>
            <input
              name="preferredVehicleType"
              value={form.preferredVehicleType}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. Truck, Mini Van"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Pickup Location *</label>
            <input
              name="pickup"
              value={form.pickup}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. Guntur"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Drop Location *</label>
            <input
              name="drop"
              value={form.drop}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. Hyderabad"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Pickup Date *</label>
            <input
              type="date"
              name="pickupDate"
              value={form.pickupDate}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Pickup Time *</label>
            <input
              type="time"
              name="pickupTime"
              value={form.pickupTime}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Proposed Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">Additional Instructions</label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
            placeholder="e.g. Fragile goods, urgent delivery"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-8 w-full py-3 text-white font-semibold rounded-lg shadow ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
        >
          {loading ? "Posting..." : "Submit Load"}
        </button>
      </motion.form>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()} LinknRide. All rights reserved.
      </footer>
    </div>
  );
}
