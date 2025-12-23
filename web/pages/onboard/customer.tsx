// web/pages/onboard/customer.tsx
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function CustomerOnboard() {
  const router = useRouter();
  const uid = typeof window !== "undefined" ? localStorage.getItem("linknride_uid") : null;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    aadhar: "",
    address: "",
    shopName: "",
    gst: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!uid) return alert("No user ID found. Please log in again.");

    try {
      await updateDoc(doc(db, "users", uid), {
        profile: form,
        profileCompleted: true,
        updatedAt: new Date(),
      });
      alert("✅ Profile saved!");
      router.push("/customer/dashboard");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to save profile.");
    }
  };

  return (
    <Layout title="Complete Customer Profile">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
        {Object.keys(form).map((field) => (
          <div key={field} className="mb-4">
            <label className="block mb-1 font-semibold capitalize">{field}</label>
            <input
              value={(form as any)[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save & Continue
        </button>
      </div>
    </Layout>
  );
}
