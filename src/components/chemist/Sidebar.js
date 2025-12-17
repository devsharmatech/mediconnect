"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Home, 
  ClipboardList, 
  Pill, 
  PackageSearch,
  User,
  Settings,
  Menu, 
  X,
  LogOut,
  Beaker,
  FlaskRound,
  FileText,
  Layers,
  Bell,
  FileBarChart,
  ShoppingCart,
  Package,
  Shield
} from "lucide-react";

import { getLoggedInUser, logoutUser } from "@/lib/authHelpers";

export default function ChemistSidebar({ open, mobileOpen, onToggle, onCloseMobile }) {
  const [chemistName, setChemistName] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getLoggedInUser("chemist");
   
    if (user?.details?.pharmacist_name) setChemistName(user?.details?.pharmacist_name);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home size={22} />,
      path: `/chemist/dashboard`,
    },
    {
      name: "Medicine Orders",
      icon: <ClipboardList size={22} />,
      path: `/chemist/orders`,
    },
    // {
    //   name: "Medicines",
    //   icon: <Pill size={22} />,
    //   path: `/chemist/medicines`,
    // },
    // {
    //   name: "Inventory",
    //   icon: <PackageSearch size={22} />,
    //   path: `/chemist/inventory`,
    // },
    // {
    //   name: "Batches",
    //   icon: <Layers size={22} />,
    //   path: `/chemist/inventory/batches`,
    // },
    // {
    //   name: "Logs",
    //   icon: <Layers size={22} />,
    //   path: `/chemist/inventory/logs`,
    // },
    {
      name: "Profile",
      icon: <User size={22} />,
      path: `/chemist/profile`,
    },
    // {
    //   name: "Settings",
    //   icon: <Settings size={22} />,
    //   path: `/chemist/settings`,
    // },
  ];

  const handleLogout = () => {
    logoutUser("chemist");
    router.push("/chemist/login");
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
          style={{ pointerEvents: 'auto' }}
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
        style={{ pointerEvents: 'auto' }} 
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 py-6 border-b border-blue-200 dark:border-gray-700 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className={`flex items-center space-x-3 transition-all duration-300 ${!open && "hidden w-0"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400 truncate">
                Chemist Panel
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-500 truncate">
                Professional Access
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer flex-shrink-0 hover:scale-105"
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
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300"
                  }
                `}
                style={{ pointerEvents: 'auto' }}
              >
                <div className={`${pathname === item.path ? "scale-110 text-white" : "text-blue-600 dark:text-blue-400"} transition-transform duration-200 flex-shrink-0`}>
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
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-400 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                )}
              </button>
            ))}
            
            {/* Additional Quick Actions Section */}
            {open && (
              <div className="pt-6 mt-4 border-t border-blue-200 dark:border-gray-700 hidden">
                <p className="px-3 mb-2 text-xs font-semibold text-blue-600 dark:text-blue-500 uppercase tracking-wider">
                  Quick Actions
                </p>
                <button className="group flex items-center w-full p-3 rounded-xl text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200">
                  <FileBarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="ml-3 font-medium text-sm truncate flex-1 text-left">
                    Sales Report
                  </span>
                  <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    New
                  </div>
                </button>
                <button className="group flex items-center w-full p-3 rounded-xl text-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200">
                  <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="ml-3 font-medium text-sm truncate flex-1 text-left">
                    Purchase Orders
                  </span>
                  <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    5
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-3 border-t border-blue-200 dark:border-gray-700 space-y-2 flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          
          {/* User Profile */}
          <div className={`
            flex items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900
            transition-all duration-300 ${!open && "justify-center"}
          `}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ring-2 ring-white dark:ring-gray-800">
              <FlaskRound className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {chemistName || "Chemist User"}
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                  <p className="text-xs text-blue-600 dark:text-blue-500 truncate">
                    Online • Verified
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
              text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-gray-700
              hover:bg-blue-100 dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-gray-600
              hover:shadow-md transition-all duration-200 cursor-pointer
              ${open ? "justify-start" : "justify-center"}
            `}
            style={{ pointerEvents: 'auto' }} 
          >
            <LogOut size={20} className="flex-shrink-0" />
            {open && (
              <>
                <span className="ml-3 font-medium text-sm">Logout</span>
                <div className="ml-auto text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
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
                    <Package className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400">Today's Orders</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">24</p>
                </div>
                <div className="text-center p-2 bg-blue-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400">Stock Items</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">156</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}