import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebaseConfig";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.match(/^\d{10}$/)) {
      alert("Please enter a valid 10-digit number");
      return;
    }

    setLoading(true);

    try {
      // Setup Recaptcha if not already initialized
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = "+91" + phone;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      alert("✅ OTP sent successfully!");
      router.push("/otp");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to send OTP. Try again.");
    }

    setLoading(false);
  };

  return (
    <Layout title="LinknRide Login">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-5"
      >
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 shadow-md"
          }`}
        >
          {loading ? "Sending OTP..." : "Continue"}
        </button>

        <div id="recaptcha-container"></div>
      </motion.div>
    </Layout>
  );
}
