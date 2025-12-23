// web/pages/role-select.tsx
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { User, Truck, UserCircle2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function RoleSelect() {
  const router = useRouter();
  const uid = typeof window !== "undefined" ? localStorage.getItem("linknride_uid") : null;

  const roles = [
    {
      id: "customer",
      title: "Customer",
      icon: <User className="text-yellow-400 text-5xl mb-4" />,
    },
    {
      id: "owner",
      title: "Owner",
      icon: <Truck className="text-yellow-400 text-5xl mb-4" />,
    },
    {
      id: "driver",
      title: "Driver",
      icon: <UserCircle2 className="text-yellow-400 text-5xl mb-4" />,
    },
  ];

  const chooseRole = async (roleId: string) => {
    if (!uid) {
      alert("User not found. Please login again.");
      router.push("/login");
      return;
    }

    try {
      await updateDoc(doc(db, "users", uid), { role: roleId });
      router.push(`/onboard/${roleId}`);
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to set role. Try again.");
    }
  };

  return (
    <Layout title="Select Your Role">
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-center">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-blue-900 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center transition-all duration-300"
          >
            {role.icon}
            <h2 className="text-xl font-semibold mb-2 mt-2">{role.title}</h2>
            <button
              onClick={() => chooseRole(role.id)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-2 rounded-full shadow-md transition-all duration-300"
            >
              Continue
            </button>
          </motion.div>
        ))}
      </div>
    </Layout>
  );
}
