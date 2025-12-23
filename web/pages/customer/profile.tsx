import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function CustomerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = localStorage.getItem("linknride_uid");
        if (!uid) return;

        const docRef = doc(db, "users", uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setProfile(snap.data()?.profile || {});
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-lg font-semibold">
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="text-xl">⚠️ No profile data found.</p>
        <button
          onClick={() => router.push("/customer/edit-profile")}
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Create / Update Profile
        </button>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide">
          My Profile
        </h1>
        <button
          onClick={() => router.push("/customer/dashboard")}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10 mb-12 text-center"
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src={profile.photoURL || "/default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-2 border-blue-300 shadow-md object-cover"
          />
          <h2 className="text-2xl font-semibold text-blue-700 mt-4">
            {profile.fullName || "Unnamed User"}
          </h2>
          <p className="text-gray-600 text-sm">
            {profile.email || "No email provided"}
          </p>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-6">
          {[
            { label: "Aadhar Number", value: profile.aadhar },
            { label: "Address", value: profile.address },
            { label: "Shop Name", value: profile.shopName },
            { label: "GST Number", value: profile.gst },
          ].map((item, i) => (
            <div key={i} className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">{item.label}</p>
              <p className="text-gray-800 font-medium mt-1">
                {item.value || "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button
            onClick={() => router.push("/customer/edit-profile")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={() => router.push("/customer/dashboard")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            ← Back
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()} <span className="font-semibold">LinknRide</span>. All rights reserved.
      </footer>
    </div>
  );
}
