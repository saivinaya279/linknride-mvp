import { useState } from "react";
import { useRouter } from "next/router";

export default function DriverRegister() {
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
    languages: "",
    interestedAreas: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    localStorage.setItem("driverProfile", JSON.stringify(form));
    localStorage.setItem("driverLoggedIn", "true");

    router.push("/driver/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Driver Registration
        </h2>

        <input className="input" name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input className="input" name="mobile" placeholder="Mobile Number" onChange={handleChange} required />
        <input className="input" name="email" placeholder="Email (optional)" onChange={handleChange} />

        <textarea className="input" name="address" placeholder="Address" onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-2">
          <input className="input" name="city" placeholder="City" onChange={handleChange} required />
          <input className="input" name="state" placeholder="State" onChange={handleChange} required />
        </div>

        <input className="input" name="pincode" placeholder="Pincode" onChange={handleChange} required />
        <input className="input" name="licenseNumber" placeholder="License Number" onChange={handleChange} required />
        <input className="input" name="experience" placeholder="Experience (Years)" onChange={handleChange} required />
        <input className="input" name="vehicleType" placeholder="Vehicle Type" onChange={handleChange} required />
        <input className="input" name="languages" placeholder="Languages Known" onChange={handleChange} />
        <input className="input" name="interestedAreas" placeholder="Interested Areas" onChange={handleChange} />

        <button className="w-full bg-blue-600 text-white py-2 rounded mt-4">
          Submit & Continue
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}
