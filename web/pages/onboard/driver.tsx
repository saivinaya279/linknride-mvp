import { useState } from "react";
import { useRouter } from "next/router";

export default function DriverOnboard() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    licenseNumber: "",
    experience: "",
    vehicleType: "",
    language: "",
    interestedArea: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    localStorage.setItem("driverProfile", JSON.stringify(form));
    localStorage.setItem("driverOnboarded", "true");
    router.push("/driver/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-3xl p-8 rounded-xl shadow"
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-1">
          Driver Details
        </h2>
        <p className="text-gray-500 mb-6">
          Add your personal and driving details to start receiving work.
        </p>

        {/* BASIC DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" name="fullName" onChange={handleChange} />
          </div>

          <div>
            <label className="label">Mobile Number *</label>
            <input className="input" name="mobile" onChange={handleChange} />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" name="email" onChange={handleChange} />
          </div>

          <div>
            <label className="label">Pincode *</label>
            <input className="input" name="pincode" onChange={handleChange} />
          </div>
        </div>

        <div className="mt-6">
          <label className="label">Address *</label>
          <input className="input" name="address" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="label">City *</label>
            <input className="input" name="city" onChange={handleChange} />
          </div>

          <div>
            <label className="label">State *</label>
            <input className="input" name="state" onChange={handleChange} />
          </div>
        </div>

        {/* DRIVER DETAILS */}
        <h3 className="text-lg font-semibold mt-10 mb-4">
          Driving Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">License Number *</label>
            <input
              className="input"
              name="licenseNumber"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Experience *</label>
            <select
              className="input"
              name="experience"
              onChange={handleChange}
            >
              <option value="">Select experience</option>
              <option value="0-1">0–1 years</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div>
            <label className="label">Vehicle Type *</label>
            <select
              className="input"
              name="vehicleType"
              onChange={handleChange}
            >
              <option value="">Select vehicle</option>
              <option value="Mini Truck">Mini Truck</option>
              <option value="Truck">Truck</option>
              <option value="DCM">DCM</option>
              <option value="Container">Container</option>
            </select>
          </div>

          <div>
            <label className="label">Languages Known *</label>
            <select
              className="input"
              name="language"
              onChange={handleChange}
            >
              <option value="">Select language</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Multiple">Multiple</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="label">Interested Areas</label>
          <input
            className="input"
            name="interestedArea"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Continue
        </button>
      </form>

      {/* Shared styles (same as Owner UI) */}
      <style jsx>{`
        .label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}
