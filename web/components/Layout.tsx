import { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 relative overflow-hidden">
      {/* Header / Logo */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-6 flex items-center gap-3"
      >
        <Image
          src="/logo.jpg" // must match your /public/logo.jpg file exactly
          alt="LinknRide Logo"
          width={60}
          height={60}
          priority // ✅ replaces fetchPriority and removes warning
          className="rounded-full shadow-lg border border-gray-200"
          unoptimized // optional, avoids optimization conflict for local dev
        />

        <h1 className="text-3xl font-extrabold text-blue-700 tracking-wide drop-shadow-sm">
          LINKNRIDE
        </h1>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex flex-col items-center justify-center mt-28 px-4"
      >
        {title && (
          <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">
            {title}
          </h2>
        )}
        {children}
      </motion.div>

      {/* Footer */}
      <footer className="mt-auto mb-4 text-gray-500 text-sm">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">LinknRide</span>. All rights reserved.
      </footer>
    </div>
  );
}
