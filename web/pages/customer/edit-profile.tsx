import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    aadhar: "",
    address: "",
    shopName: "",
    gst: "",
    photoURL: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = localStorage.getItem("linknride_uid");
      if (!uid) return;

      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfileData({
          fullName: data?.profile?.fullName || "",
          email: data?.profile?.email || "",
          aadhar: data?.profile?.aadhar || "",
          address: data?.profile?.address || "",
          shopName: data?.profile?.shopName || "",
          gst: data?.profile?.gst || "",
          photoURL: data?.profile?.photoURL || "",
        });
        setPreview(data?.profile?.photoURL || null);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uid = localStorage.getItem("linknride_uid");
      if (!uid) return;

      const userRef = doc(db, "users", uid);
      let uploadedPhotoURL = profileData.photoURL;

      if (file) {
        const storageRef = ref(storage, `profile_photos/${uid}`);
        await uploadBytes(storageRef, file);
        uploadedPhotoURL = await getDownloadURL(storageRef);
      }

      await updateDoc(userRef, {
        "profile.fullName": profileData.fullName,
        "profile.email": profileData.email,
        "profile.aadhar": profileData.aadhar,
        "profile.address": profileData.address,
        "profile.shopName": profileData.shopName,
        "profile.gst": profileData.gst,
        "profile.photoURL": uploadedPhotoURL,
        updatedAt: serverTimestamp(),
      });

      alert("✅ Profile updated successfully!");
      router.push("/customer/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide">Edit Profile</h1>
        <button
          onClick={() => router.push("/customer/dashboard")}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Form */}
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 mb-12"
      >
        <h2 className="text-2xl font-semibold text-blue-700 mb-6">
          Update Your Profile
        </h2>

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={preview || "/default-avatar.png"}
              alt="Profile Preview"
              className="w-28 h-28 rounded-full border-2 border-blue-300 shadow-md object-cover"
            />
            <label
              htmlFor="file-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700"
            >
              📷
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Click icon to change photo</p>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["fullName", "email", "aadhar", "address", "shopName", "gst"].map(
            (field) => (
              <div key={field}>
                <label className="block text-gray-700 font-medium mb-2 capitalize">
                  {field === "gst"
                    ? "GST Number"
                    : field === "aadhar"
                    ? "Aadhar Number"
                    : field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={(profileData as any)[field]}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                />
              </div>
            )
          )}
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </motion.form>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()} LinknRide. All rights reserved.
      </footer>
    </div>
  );
}
