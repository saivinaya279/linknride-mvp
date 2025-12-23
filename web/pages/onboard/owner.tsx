// web/pages/onboard/owner.tsx
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../firebaseConfig";

type Vehicle = {
  vehicleNumber: string;
  rcNumber: string;
  vehicleType: string;
  capacity: string;
};

export default function OwnerOnboard() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { vehicleNumber: "", rcNumber: "", vehicleType: "", capacity: "" },
  ]);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [aadharPreviewUrl, setAadharPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill phone from localStorage
  useEffect(() => {
    const storedPhone = localStorage.getItem("linknride_phone") || "";
    if (storedPhone) setPhone(storedPhone);
  }, []);

  // Vehicles helpers
  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      { vehicleNumber: "", rcNumber: "", vehicleType: "", capacity: "" },
    ]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length === 1) return; // keep at least one
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleVehicleChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const updated = [...vehicles];
    // @ts-ignore
    updated[index][e.target.name] = e.target.value;
    setVehicles(updated);
  };

  // Aadhaar file handling
  const handleAadharFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAadharFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setAadharPreviewUrl(url);
    } else {
      setAadharPreviewUrl(null);
    }
  };

  // Upload Aadhaar to Firebase Storage
  const uploadAadharToStorage = async (uid: string) => {
    if (!aadharFile) return null;
    const filename = `${Date.now()}_${aadharFile.name}`;
    const storageRef = ref(storage, `owners/${uid}/aadhar/${filename}`);
    const snapshot = await uploadBytes(storageRef, aadharFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  // Validation
  const validateForm = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!phone.trim()) return "Phone number not available.";
    if (!address.trim()) return "Address is required.";
    if (!city.trim()) return "City is required.";
    if (!stateVal.trim()) return "State is required.";
    if (!pincode.trim()) return "Pincode is required.";
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (!v.vehicleNumber.trim()) return `Vehicle #${i + 1}: vehicle number is required.`;
      if (!v.vehicleType.trim()) return `Vehicle #${i + 1}: vehicle type is required.`;
      if (!v.capacity.trim()) return `Vehicle #${i + 1}: capacity is required.`;
    }
    return null;
  };

  // ✅ Final fixed version of handleSubmit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const vErr = validateForm();
    if (vErr) {
      setError(vErr);
      return;
    }

    setSaving(true);
    try {
      // Determine uid
      let uid = localStorage.getItem("linknride_uid") ?? "";
      if (!uid && auth && auth.currentUser) uid = auth.currentUser.uid;

      if (!uid) throw new Error("User not authenticated. Please login again.");

      // Upload Aadhaar
      let aadharUrl = null;
      if (aadharFile) aadharUrl = await uploadAadharToStorage(uid);

      // ✅ Owner data
      const ownerDocRef = doc(db, "owners", uid);
      const ownerData: any = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim(),
        city: city.trim(),
        state: stateVal.trim(),
        pincode: pincode.trim(),
        vehicles: vehicles.map((v) => ({
          vehicleNumber: v.vehicleNumber.trim(),
          rcNumber: v.rcNumber.trim() || null,
          vehicleType: v.vehicleType.trim(),
          capacity: Number(v.capacity) || v.capacity,
          addedAt: new Date().toISOString(), // ✅ Replaces serverTimestamp()
        })),
        aadharUrl: aadharUrl || null,
        isVerified: false,
        profileCompleted: true,
        role: "owner",
        createdAt: serverTimestamp(),
      };

      await setDoc(ownerDocRef, ownerData, { merge: true });

      localStorage.setItem("linknride_uid", uid);
      if (phone) localStorage.setItem("linknride_phone", phone);

      router.push("/owner/dashboard");
    } catch (err: any) {
      console.error("Failed to save owner data:", err);
      setError(err?.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-700">Owner Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Add your business & vehicle details to start posting vehicles and accepting loads.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                placeholder="e.g. Ramesh Transports"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mobile Number *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none bg-gray-50"
                placeholder="+91XXXXXXXXXX"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                placeholder="optional"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Pincode *</label>
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                placeholder="e.g. 522001"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                placeholder="Street, area, landmark..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">City *</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                placeholder="e.g. Guntur"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">State *</label>
              <input
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
                placeholder="e.g. Andhra Pradesh"
                required
              />
            </div>
          </div>

          {/* Vehicle Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Vehicle Details</h3>
              <button
                type="button"
                onClick={addVehicle}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md shadow hover:bg-blue-700"
              >
                <FaPlus /> Add Vehicle
              </button>
            </div>

            <div className="space-y-4">
              {vehicles.map((v, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="bg-gray-50 border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Vehicle Number *</label>
                      <input
                        name="vehicleNumber"
                        value={v.vehicleNumber}
                        onChange={(e) => handleVehicleChange(idx, e)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="e.g. AP09AB1234"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">RC Number</label>
                      <input
                        name="rcNumber"
                        value={v.rcNumber}
                        onChange={(e) => handleVehicleChange(idx, e)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="RC number (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Vehicle Type *</label>
                      <select
                        name="vehicleType"
                        value={v.vehicleType}
                        onChange={(e) => handleVehicleChange(idx, e)}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Truck">Truck</option>
                        <option value="Mini Van">Mini Van</option>
                        <option value="DCM">DCM</option>
                        <option value="Tempo">Tempo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Capacity (tons) *</label>
                      <input
                        name="capacity"
                        value={v.capacity}
                        onChange={(e) => handleVehicleChange(idx, e)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="e.g. 3"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => removeVehicle(idx)}
                      className="bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-lg hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Aadhaar Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Aadhaar Upload *</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg cursor-pointer">
                <FaUpload /> <span>Choose File</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleAadharFile}
                  className="hidden"
                />
              </label>
              {aadharPreviewUrl ? (
                <div className="text-sm text-gray-600">Preview ready</div>
              ) : (
                <div className="text-sm text-gray-500">No file chosen</div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              You can upload an image or PDF. This will be used only for verification.
            </p>
          </div>

          {/* Error */}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white font-semibold ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
