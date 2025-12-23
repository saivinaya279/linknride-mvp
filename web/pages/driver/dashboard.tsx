import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function DriverDashboard() {
  const router = useRouter();
  const [name, setName] = useState("Driver");

  useEffect(() => {
    // Prevent skipping onboarding
    const onboarded = localStorage.getItem("driverOnboarded");
    if (!onboarded) {
      router.push("/onboard/driver");
      return;
    }

    // Get driver name
    const profile = localStorage.getItem("driverProfile");
    if (profile) {
      const parsed = JSON.parse(profile);
      setName(parsed.fullName || "Driver");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
        {/* LEFT: LOGO */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/driver/dashboard")}
        >
          <Image
            src="/web/public/logo.jpg"
            alt="LinknRide Logo"
            width={140}
            height={40}
            priority
          />
        </div>

        {/* RIGHT: PROFILE */}
        <div className="relative group">
          <button className="flex items-center gap-2 text-blue-600 font-medium">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              👤
            </span>
            Hi, {name}
          </button>

          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded hidden group-hover:block z-10">
            <button
              onClick={() => router.push("/driver/profile")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              My Profile
            </button>
            <button
              onClick={() => router.push("/driver/edit-profile")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          Welcome Back, {name} 👋
        </h2>
        <p className="text-gray-600 mb-14">
          Find owners, post your availability, and grow your work opportunities
        </p>

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* SEARCH OWNERS */}
          <div
            onClick={() => router.push("/driver/search-owners")}
            className="bg-white rounded-2xl shadow-md p-10 cursor-pointer hover:shadow-xl transition"
          >
            <div className="text-blue-600 text-5xl mb-6">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              Search Owners
            </h3>
            <p className="text-gray-600">
              View owners who are actively looking for drivers and send requests.
            </p>
          </div>

          {/* POST AVAILABILITY */}
          <div
            onClick={() => router.push("/driver/post-availability")}
            className="bg-white rounded-2xl shadow-md p-10 cursor-pointer hover:shadow-xl transition"
          >
            <div className="text-blue-600 text-5xl mb-6">📢</div>
            <h3 className="text-xl font-semibold mb-2">
              Post Availability
            </h3>
            <p className="text-gray-600">
              Share your availability so owners can contact you for work.
            </p>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="text-center text-gray-500 py-6">
        © 2025 LinknRide. All rights reserved.
      </footer>
    </div>
  );
}
