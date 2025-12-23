import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  DocumentData,
  Query,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaSearch, FaMapMarkerAlt, FaBoxOpen, FaTag, FaCalendarAlt, FaClock } from "react-icons/fa";

// ✅ Lottie for no data
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
let noDataAnim: any = null;
try {
  // Optional Lottie (put your no-data.json in /public/animations/)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  noDataAnim = require("../../public/animations/no-data.json");
} catch (e) {
  noDataAnim = null;
}

type LoadItem = {
  id: string;
  customerId?: string;
  customerName?: string;
  typeOfGoods?: string;
  capacityRequired?: string | number;
  preferredVehicleType?: string;
  pickup?: string;
  drop?: string;
  pickupDate?: string;
  pickupTime?: string;
  price?: number | null;
  instructions?: string;
  createdAt?: any;
  status?: string;
  [k: string]: any;
};

export default function OwnerSearchLoads() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [loads, setLoads] = useState<LoadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<LoadItem | null>(null);
  const [offerPrice, setOfferPrice] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // ✅ Realtime listener
  useEffect(() => {
    setLoading(true);
    const loadsRef = collection(db, "loads");
    let q: Query<DocumentData> = query(loadsRef, orderBy("createdAt", "desc"));

    try {
      if (pickup && drop) {
        q = query(
          loadsRef,
          where("pickup", "==", pickup),
          where("drop", "==", drop),
          orderBy("createdAt", "desc")
        );
      } else if (pickup) {
        q = query(loadsRef, where("pickup", "==", pickup), orderBy("createdAt", "desc"));
      } else if (drop) {
        q = query(loadsRef, where("drop", "==", drop), orderBy("createdAt", "desc"));
      }
    } catch (err) {
      console.warn("Query fallback:", err);
      q = query(loadsRef, orderBy("createdAt", "desc"));
    }

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const items: LoadItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setLoads(items);
        setLoading(false);
      },
      (err) => {
        console.error("Realtime listener error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [pickup, drop]);

  const openBidModal = (load: LoadItem) => {
    setSelectedLoad(load);
    setOfferPrice(load.price ? String(load.price) : "");
    setMessage("");
    setShowModal(true);
  };

  const sendBid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const ownerId = localStorage.getItem("linknride_uid");
      if (!ownerId) {
        alert("Please login as owner first.");
        router.push("/login");
        return;
      }
      if (!selectedLoad) return alert("No load selected.");
      if (!offerPrice || Number(offerPrice) <= 0)
        return alert("Enter a valid offer price.");

      const payload = {
        ownerId,
        customerId: selectedLoad.customerId || null,
        loadId: selectedLoad.id,
        offeredPrice: Number(offerPrice),
        message: message || null,
        status: "bid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "requests"), payload);

      alert("✅ Bid sent to customer!");
      setShowModal(false);
      setSelectedLoad(null);
      setOfferPrice("");
      setMessage("");
    } catch (err: any) {
      console.error("Error sending bid:", err);
      alert("❌ Failed to send bid. See console.");
    }
  };

  const formatDate = (date: string | undefined) => (date ? new Date(date).toDateString() : "—");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 pb-12">
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <FaBoxOpen className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-blue-700">Search Loads</h1>
        </div>
        <button
          onClick={() => router.push("/owner/dashboard")}
          className="px-3 py-2 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 mt-8">
        {/* 🔹 Filters */}
        <motion.form
          onSubmit={(e) => e.preventDefault()}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pickup Location</label>
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Guntur"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Drop Location</label>
              <input
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPickup("");
                  setDrop("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setLoading(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <FaSearch className="inline mr-2" /> Search
              </button>
            </div>
          </div>
        </motion.form>

        {/* 🔹 Results */}
        <section className="mt-8">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              Loading loads…
            </div>
          ) : loads.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center gap-4">
              <div className="w-56 h-56">
                {noDataAnim ? <Lottie animationData={noDataAnim} loop /> : "No loads found"}
              </div>
              <p className="text-gray-600">
                No loads matching filters. Try clearing search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loads.map((l) => (
                <motion.div
                  key={l.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between border border-blue-50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-blue-700">
                        {l.typeOfGoods || "Goods"}
                      </h3>
                      <span className="text-sm text-gray-500">#{l.id.slice(0, 6)}</span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                      {l.pickup} → {l.drop}
                    </p>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <div>
                        <FaCalendarAlt className="inline mr-2 text-amber-500" />
                        {l.pickupDate || "—"}
                      </div>
                      <div>
                        <FaClock className="inline mr-2 text-green-600" />
                        {l.pickupTime || "—"}
                      </div>
                      <div>
                        <FaTag className="inline mr-2 text-blue-500" />
                        Vehicle: {l.preferredVehicleType || "Any"}
                      </div>
                      <div>
                        Capacity: {l.capacityRequired || "—"} tons
                      </div>
                    </div>

                    {l.instructions && (
                      <p className="mt-3 text-sm text-gray-700">
                        <strong>Note:</strong> {l.instructions}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Customer Price</div>
                      <div className="text-xl font-semibold text-gray-800">
                        ₹ {l.price ?? "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBidModal(l)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Request / Bid
                      </button>
                      <button
                        onClick={() => router.push(`/customer/load-details?loadId=${l.id}`)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 🔹 Bid Modal */}
      <AnimatePresence>
        {showModal && selectedLoad && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Send Offer / Bid
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Load: <strong>{selectedLoad.typeOfGoods || "Goods"}</strong> —{" "}
                {selectedLoad.pickup} → {selectedLoad.drop}
              </p>

              <form onSubmit={sendBid} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Your Offer (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Any note to customer (availability, partial pickup, etc.)"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Send Bid
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
