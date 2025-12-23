// web/pages/owner/view-history.tsx
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaUserTie } from "react-icons/fa";

// dynamically import Lottie so SSR won't break
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function ViewHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noDataAnim, setNoDataAnim] = useState<any | null>(null);

  // load Lottie animation JSON from public folder at runtime
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/animations/no-data.json");
        if (!res.ok) throw new Error("Animation file not found");
        const json = await res.json();
        if (mounted) setNoDataAnim(json);
      } catch (err) {
        console.warn("Could not load Lottie animation:", err);
        setNoDataAnim(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const uid = localStorage.getItem("linknride_uid");
        if (!uid) {
          setHistory([]);
          return;
        }

        // Adjust collection name as per your DB schema
        const q = query(
          collection(db, "completedTrips"),
          where("ownerId", "==", uid),
          orderBy("completedAt", "desc")
        );

        const snapshot = await getDocs(q);
        const results: any[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });

        setHistory(results);
      } catch (err) {
        console.error("Error fetching history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 flex flex-col items-center py-10 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-blue-700 mb-8 text-center"
      >
        🚚 Owner Trip History
      </motion.h1>

      {loading ? (
        <div className="text-gray-600 text-lg mt-10">Loading your trip history...</div>
      ) : (history && history.length === 0) ? (
        <div className="flex flex-col items-center mt-10">
          {/* only render Lottie if animation loaded successfully */}
          {noDataAnim ? (
            // Lottie expects a valid animation object
            // autoplay is default in lottie-react, pass loop as prop
            <div className="w-64 h-64">
              {/* @ts-ignore: animationData type may be any */}
              <Lottie animationData={noDataAnim} loop={true} />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-white rounded-lg shadow-sm">
              <span className="text-sm text-gray-400">No animation</span>
            </div>
          )}

          <p className="text-gray-600 mt-4 text-center max-w-xl">
            No completed trips found yet. Start by posting vehicles or accepting loads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl w-full">
          {history.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="bg-white shadow-lg rounded-xl border border-blue-100 p-6 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <FaTruck className="text-blue-600 text-2xl" />
                <h2 className="font-semibold text-gray-800 text-lg">
                  {trip.loadType || "General Goods"}
                </h2>
              </div>

              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>
                    <strong>Pickup:</strong> {trip.pickupLocation || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span>
                    <strong>Drop:</strong> {trip.dropLocation || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-amber-500" />
                  <span>
                    <strong>Date:</strong>{" "}
                    {trip.completedAt
                      ? // Firestore Timestamp -> Date
                        new Date(trip.completedAt.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaUserTie className="text-green-600" />
                  <span>
                    <strong>Driver:</strong> {trip.driverName || "Not Assigned"}
                  </span>
                </div>

                <p>
                  <strong>Vehicle:</strong> {trip.vehicleNumber || "N/A"}
                </p>

                <p>
                  <strong>Price:</strong> ₹{trip.price ?? "N/A"}
                </p>

                <p
                  className={`font-semibold ${
                    trip.status === "completed"
                      ? "text-green-600"
                      : trip.status === "cancelled"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  Status: {trip.status?.toUpperCase() || "UNKNOWN"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
