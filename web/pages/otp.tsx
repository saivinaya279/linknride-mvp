// web/pages/otp.tsx
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await (window as any).confirmationResult.confirm(otp);
      const user = result.user;
      const phone = user.phoneNumber;

      // Save user in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          phone: phone,
          role: null, // will be set after role selection
          profileCompleted: false,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Store UID locally
      localStorage.setItem("linknride_uid", user.uid);
      localStorage.setItem("linknride_phone", phone);

      alert("✅ OTP Verified Successfully!");
      router.push("/role-select");
    } catch (error) {
      console.error(error);
      alert("❌ Invalid OTP. Try again.");
    }
    setVerifying(false);
  };

  return (
    <Layout title="Verify OTP 🔐">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-5"
      >
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest"
        />

        <button
          onClick={handleVerify}
          disabled={verifying}
          className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 ${
            verifying
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 shadow-md"
          }`}
        >
          {verifying ? "Verifying..." : "Verify OTP"}
        </button>
      </motion.div>
    </Layout>
  );
}
