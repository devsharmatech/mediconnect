"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/lab/Sidebar";
import Navbar from "@/components/lab/Navbar";
import { Toaster } from "react-hot-toast";
import { getLoggedInUser } from "@/lib/authHelpers";
import { usePathname } from "next/navigation";

export default function LabLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const checkLogin = () => {
    const user = getLoggedInUser("lab");
    setIsLoggedIn(!!user);
  };

  useEffect(() => {
    setMounted(true);
    checkLogin();
  }, [pathname]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
          <div className="text-gray-800 font-bold text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Check for both login routes - lab
  if (pathname === "/lab/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 cursor-default relative">
      {isLoggedIn && (
        <Sidebar
          open={sidebarOpen}
          mobileOpen={mobileSidebarOpen}
          onToggle={handleSidebarToggle}
          onMobileToggle={handleMobileSidebarToggle}
          onCloseMobile={closeMobileSidebar}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isLoggedIn ? (sidebarOpen ? "lg:ml-64" : "lg:ml-16") : ""
        }`}
      >
        {isLoggedIn && (
          <Navbar
            onMenuClick={handleMobileSidebarToggle}
            sidebarOpen={sidebarOpen}
          />
        )}

        <main className="flex-1 p-4 md:p-6 overflow-x-auto">
          {children}
        </main>
      </div>

    </div>
  );
}