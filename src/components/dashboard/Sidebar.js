"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  ClipboardList, 
  Settings, 
  Menu, 
  X,
  Stethoscope,
  Pill,
  Activity,
  Calendar,
  LogOut,
  User,
  TestTube,
  Microscope
} from "lucide-react";

import { getLoggedInUser,logoutUser } from "@/lib/authHelpers";

export default function Sidebar({ open, mobileOpen, onToggle, onCloseMobile }) {
  const [role, setRole] = useState("admin");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getLoggedInUser("admin");
    if (user?.role) setRole(user.role);
  }, []);

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={22} />, 
      path: `/admin/dashboard`,
    },
    { 
      name: "Patients", 
      icon: <Users size={22} />, 
      path: `/admin/patients`,
    },
    { 
      name: "Doctors", 
      icon: <Stethoscope size={22} />, 
      path: `/admin/doctors`,
    },
    { 
      name: "Appointments", 
      icon: <Calendar size={22} />, 
      path: `/admin/appointments`,
    },
    { 
      name: "Chemists", 
      icon: <Pill size={22} />, 
      path: `/admin/chemists`,
    },
    { 
      name: "Labs", 
      icon: <Microscope size={22} />, 
      path: `/admin/labs`,
    },
    { 
      name: "Orders", 
      icon: <ClipboardList size={22} />, 
      path: `/admin/orders`,
    },
    { 
      name: "Settings", 
      icon: <Settings size={22} />, 
      path: `/admin/settings`,
    },
  ];

  const handleLogout = (role) => {
    logoutUser(role);
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
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          h-screen transition-all duration-300 flex flex-col
          shadow-2xl lg:shadow-none
          overflow-hidden
        `}
        style={{ pointerEvents: 'auto' }} 
      >
        
        <div className="flex  items-center justify-between p-4 py-7 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className={`flex items-center space-x-3 transition-all duration-300 ${!open && "hidden w-0"}`}>
            <div className="w-8 h-8 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                Mediconnect
              </h2>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer flex-shrink-0"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Menu - Fixed Height, No Scroll */}
        <nav className="flex-1 overflow-hidden py-2">
          <div className="px-2 space-y-1 h-full">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigation(item.path)}
                className={`
                  group flex items-center w-full p-3 rounded-lg
                  transition-all duration-200 relative cursor-pointer
                  ${open ? "justify-start" : "justify-center"}
                  ${
                    pathname === item.path
                      ? "bg-gray-800 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                  }
                `}
                style={{ pointerEvents: 'auto' }} // Ensure buttons are clickable
              >
                <div className={`${pathname === item.path ? "scale-110" : ""} transition-transform duration-200 flex-shrink-0`}>
                  {item.icon}
                </div>
                
                {open && (
                  <span className="ml-3 font-medium text-sm truncate flex-1 text-left">
                    {item.name}
                  </span>
                )}

                {/* Active indicator for minimized sidebar */}
                {!open && pathname === item.path && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile & Logout Section - Fixed */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-2 flex-shrink-0">
          
          <div className={`
            flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800
            transition-all duration-300 ${!open && "justify-center"}
          `}>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {open && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  Administrator
                </p>
              </div>
            )}
          </div>
          <button
            onClick={()=>{
                                handleLogout('admin')
                              }}
            className={`
              group flex items-center w-full p-3 rounded-lg
              bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900/30
              transition-all duration-200 cursor-pointer
              ${open ? "justify-start" : "justify-center"}
            `}
            style={{ pointerEvents: 'auto' }} 
          >
            <LogOut size={20} className="flex-shrink-0" />
            {open && <span className="ml-3 font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}