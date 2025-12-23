import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function DriverVerificationStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("driverStatus");
    setStatus(s);
  }, []);

  if (!status) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center w-96">
        {status === "pending" && (
          <>
            <h2 className="text-xl font-bold">Verification Pending</h2>
            <p className="mt-2 text-gray-600">
              Your details are under admin verification.
            </p>
          </>
        )}

        {status === "approved" && (
          <>
            <h2 className="text-xl font-bold text-green-600">Approved</h2>
            <button
              onClick={() => router.push("/driver/dashboard")}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "rejected" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Rejected</h2>
            <p className="mt-2">Please contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}
