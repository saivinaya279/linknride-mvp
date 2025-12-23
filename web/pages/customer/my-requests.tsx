import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRupeeSign } from "react-icons/fa";

export default function OwnerMyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const uid = localStorage.getItem("linknride_uid");
        if (!uid) return;

        // Get all requests by this owner
        const q = query(
          collection(db, "requests"),
          where("ownerId", "==", uid),
          orderBy("createdAt", "desc")
        );

        const reqSnap = await getDocs(q);
        const temp: any[] = [];

        // For each request, fetch its load details from "loads"
        for (const docSnap of reqSnap.docs) {
          const reqData = docSnap.data();
          let loadData = null;

          if (reqData.loadId) {
            const loadRef = doc(db, "loads", reqData.loadId);
            const loadSnap = await getDoc(loadRef);
            if (loadSnap.exists()) {
              loadData = loadSnap.data();
            }
          }

          temp.push({
            id: docSnap.id,
            ...reqData,
            load: loadData || null,
          });
        }

        setRequests(temp);
      } catch (err) {
        console.error("Error loading requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        📦 My Requests / Bids
      </h1>

      {loading ? (
        <div className="text-center text-gray-600 mt-10 text-lg">
          Loading your requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-600 mt-10 text-lg">
          No requests sent yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((r) => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg p-5 border border-blue-100"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-700">
                  {r.load?.typeOfGoods || "Unknown Vehicle"}
                </h3>
                <span
                  className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                    r.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : r.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {r.status?.toUpperCase() || "PENDING"}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>
                  <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                  {r.load?.pickup || "—"} → {r.load?.drop || "—"}
                </div>
                <div>
                  <FaCalendarAlt className="inline mr-2 text-amber-500" />
                  {r.load?.pickupDate || "—"}
                </div>
                <div>
                  <FaClock className="inline mr-2 text-green-600" />
                  {r.load?.pickupTime || "—"}
                </div>
                <div>
                  <FaRupeeSign className="inline mr-2 text-blue-600" />
                  Customer: ₹{r.load?.price || "—"}
                </div>
                <div>
                  <FaRupeeSign className="inline mr-2 text-green-600" />
                  Your Bid: ₹{r.offeredPrice || "—"}
                </div>
              </div>

              {r.message && (
                <p className="mt-3 text-sm text-gray-600 italic">
                  💬 "{r.message}"
                </p>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Sent: {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "—"}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
