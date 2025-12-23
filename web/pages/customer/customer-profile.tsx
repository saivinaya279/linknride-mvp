import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function CustomerProfile() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    aadhar: "",
    address: "",
    shopName: "",
    gst: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const { fullName, email, aadhar, address, shopName, gst } = formData;

    if (!fullName || !address) {
      alert("Please fill in all required fields (Full Name, Address).");
      return;
    }

    setLoading(true);
    try {
      const uid = localStorage.getItem("linknride_uid");
      if (!uid) {
        alert("User not found. Please login again.");
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        role: "customer",
        profileCompleted: true,
        profile: {
          fullName,
          email,
          aadhar,
          address,
          shopName,
          gst,
        },
        updatedAt: serverTimestamp(),
      });

      alert("✅ Profile saved successfully!");
      router.push("/customer/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("❌ Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Complete Customer Profile">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Aadhar
            </label>
            <input
              type="text"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Shop Name
            </label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              GST Number
            </label>
            <input
              type="text"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full mt-6 py-2 rounded-md text-white font-semibold transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}
