"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Beaker,
  FlaskRound,
  FileText,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Microscope,
  Activity,
  BarChart,
  Bell,
  Users,
  Package,
  Shield,
  Calendar,
} from "lucide-react";
import { getLoggedInUser, logoutUser } from "@/lib/authHelpers";

export default function LabSidebar({
  open,
  mobileOpen,
  onToggle,
  onCloseMobile,
}) {
  const [labName, setLabName] = useState("");
  const [labStats, setLabStats] = useState({
    todayOrders: 0,
    activeTests: 0,
  });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchLabData = async () => {
      const user = getLoggedInUser("lab");
      if (user) {
        setLabName(user.lab_name || user.owner_name || "Lab Admin");

        // Fetch today's stats
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const response = await fetch("/api/lab/dashboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lab_id: user.id,
              start_date: today.toISOString(),
            }),
          });

          const result = await response.json();
          if (result.success) {
            setLabStats({
              todayOrders: result.data.stats?.total_orders || 0,
              activeTests: result.data.stats?.active_services || 0,
            });
          }
        } catch (error) {
          console.error("Error fetching lab stats:", error);
        }
      }
    };

    fetchLabData();
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home size={22} />,
      path: `/lab/dashboard`,
    },
    {
      name: "Test Orders",
      icon: <ClipboardList size={22} />,
      path: `/lab/orders`,
    },
    // {
    //   name: "Lab Tests",
    //   icon: <Beaker size={22} />,
    //   path: `/lab/tests`,
    // },
    // {
    //   name: "Reports",
    //   icon: <FileText size={22} />,
    //   path: `/lab/reports`,
    // },
    // {
    //   name: "Patients",
    //   icon: <Users size={22} />,
    //   path: `/lab/patients`,
    // },
    {
      name: "Profile",
      icon: <User size={22} />,
      path: `/lab/profile`,
    },
    // {
    //   name: "Settings",
    //   icon: <Settings size={22} />,
    //   path: `/lab/settings`,
    // },
  ];

  const handleLogout = () => {
    logoutUser("lab");
    router.push("/lab/login");
  };

  const handleNavigation = (path) => {
    router.push(path);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-pointer transition-opacity duration-300"
          onClick={onCloseMobile}
          style={{ pointerEvents: "auto" }}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 
          ${open ? "w-64" : "w-16"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800
          border-r border-blue-200 dark:border-gray-700
          h-screen transition-all duration-300 flex flex-col
          shadow-2xl lg:shadow-lg shadow-blue-200/50 dark:shadow-gray-900
          overflow-hidden
        `}
        style={{ pointerEvents: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 py-6 border-b border-blue-200 dark:border-gray-700 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div
            className={`flex items-center space-x-3 transition-all duration-300 ${
              !open && "hidden w-0"
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Microscope className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg font-bold text-blue-700 dark:text-blue-500 truncate">
                Lab Portal
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-500 truncate">
                Diagnostic Center
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-700 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer flex-shrink-0 hover:scale-105"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="px-2 space-y-1">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigation(item.path)}
                className={`
                  group flex items-center w-full p-3 rounded-xl
                  transition-all duration-200 relative cursor-pointer
                  ${open ? "justify-start" : "justify-center"}
                  mb-1
                  ${
                    pathname === item.path
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-700/30"
                      : "text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300"
                  }
                `}
                style={{ pointerEvents: "auto" }}
              >
                <div
                  className={`${
                    pathname === item.path
                      ? "scale-110 text-white"
                      : "text-blue-600 dark:text-blue-700"
                  } transition-transform duration-200 flex-shrink-0`}
                >
                  {item.icon}
                </div>

                {open && (
                  <span className="ml-3 font-medium text-sm truncate flex-1 text-left">
                    {item.name}
                  </span>
                )}

                {/* Active indicator for minimized sidebar */}
                {!open && pathname === item.path && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>
                )}

                {/* Hover effect for expanded */}
                {open && pathname !== item.path && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-700 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                )}
              </button>
            ))}

            {/* Additional Quick Actions Section */}
            {open && (
              <div className="pt-6 mt-4 border-t border-blue-200 dark:border-gray-700 hidden">
                <p className="px-3 mb-2 text-xs font-semibold text-blue-600 dark:text-blue-700 uppercase tracking-wider">
                  Quick Actions
                </p>
                <button
                  onClick={() => handleNavigation("/lab/orders/new")}
                  className="group flex items-center w-full p-3 rounded-xl text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                >
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-700" />
                  <span className="ml-3 font-medium text-sm truncate flex-1 text-left">
                    New Test Order
                  </span>
                  <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-700 text-xs rounded-full">
                    New
                  </div>
                </button>
                <button
                  onClick={() => handleNavigation("/lab/reports/generate")}
                  className="group flex items-center w-full p-3 rounded-xl text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                >
                  <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-700" />
                  <span className="ml-3 font-medium text-sm truncate flex-1 text-left">
                    Generate Report
                  </span>
                  <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-700 text-xs rounded-full">
                    PDF
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-3 border-t border-blue-200 dark:border-gray-700 space-y-2 flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          {/* User Profile */}
          <div
            className={`
            flex items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900
            transition-all duration-300 ${!open && "justify-center"}
          `}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ring-2 ring-white dark:ring-gray-800">
              <FlaskRound className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {labName}
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                  <p className="text-xs text-blue-600 dark:text-blue-700 truncate">
                    Online • Verified Lab
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              group flex items-center w-full p-3 rounded-xl
              bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900
              text-blue-700 dark:text-blue-700 border border-blue-300 dark:border-gray-700
              hover:bg-blue-100 dark:hover:bg-gray-800 hover:border-blue-700 dark:hover:border-gray-600
              hover:shadow-md transition-all duration-200 cursor-pointer
              ${open ? "justify-start" : "justify-center"}
            `}
            style={{ pointerEvents: "auto" }}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {open && (
              <>
                <span className="ml-3 font-medium text-sm">Logout</span>
                <div className="ml-auto text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-700 rounded-full">
                  Exit
                </div>
              </>
            )}
          </button>

          {/* Stats Footer - Only shown when expanded */}
          {open && (
            <div className="pt-3 mt-2 border-t border-blue-200 dark:border-gray-700 hidden">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-blue-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-700" />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-700">
                    Today's Orders
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {labStats.todayOrders}
                  </p>
                </div>
                <div className="text-center p-2 bg-blue-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-700" />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-700">
                    Active Tests
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {labStats.activeTests}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
