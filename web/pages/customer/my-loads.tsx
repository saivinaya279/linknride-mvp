import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default function MyLoads() {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLoads = async () => {
      const uid = localStorage.getItem("linknride_uid");
      if (!uid) {
        router.push("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "loads"),
          where("customerId", "==", uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoads(data);
      } catch (error) {
        console.error("Error fetching loads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide">📦 My Loads</h1>
        <button
          onClick={() => router.push("/customer/dashboard")}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto w-full p-6"
      >
        {loading ? (
          <p className="text-center text-gray-600">Loading your loads...</p>
        ) : loads.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            You haven’t posted any loads yet.
            <br />
            <button
              onClick={() => router.push("/customer/post-load")}
              className="text-blue-600 hover:underline mt-2"
            >
              Post one now →
            </button>
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {loads.map((load) => (
              <motion.div
                key={load.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white shadow-lg rounded-xl p-5 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-blue-700">
                    {load.typeOfGoods || "Untitled Load"}
                  </h3>
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                      load.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : load.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : load.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {load.status}
                  </span>
                </div>

                <p className="text-gray-700 text-sm">
                  <strong>Pickup:</strong> {load.pickup}
                  <br />
                  <strong>Drop:</strong> {load.drop}
                  <br />
                  <strong>Date:</strong> {load.pickupDate} {load.pickupTime}
                  <br />
                  <strong>Capacity:</strong> {load.capacityRequired} tons
                  <br />
                  <strong>Price:</strong> ₹{load.price || "N/A"}
                </p>

                {load.instructions && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    “{load.instructions}”
                  </p>
                )}

                <button
                  onClick={() => alert("Detailed view coming soon")}
                  className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                >
                  View Details →
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t mt-auto">
        © {new Date().getFullYear()} LinknRide. All rights reserved.
      </footer>
    </div>
  );
}
