"use client";

import { useEffect, useState, useRef } from "react";
import { getLoggedInUser, logoutUser } from "@/lib/authHelpers";
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Menu,
  Beaker,
  AlertCircle,
  FileText,
  TestTube,
  FlaskConical,
  Activity
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function LabNavbar({ onMenuClick, sidebarOpen }) {
  const [labName, setLabName] = useState("");
  const [theme, setTheme] = useState("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser("lab");
    router.push("/lab/login");
  };

  // Lab-specific notifications
  const notifications = [
    {
      id: 1,
      message: "New test order received",
      time: "10 min ago",
      read: false,
      type: "order"
    },
    {
      id: 2,
      message: "Sample collection scheduled for today",
      time: "2 hours ago",
      read: false,
      type: "collection"
    },
    {
      id: 3,
      message: "Test report ready for Patient #1234",
      time: "5 hours ago",
      read: true,
      type: "report"
    },
    {
      id: 4,
      message: "Monthly performance report generated",
      time: "1 day ago",
      read: true,
      type: "performance"
    },
    {
      id: 5,
      message: "Equipment maintenance due tomorrow",
      time: "2 days ago",
      read: true,
      type: "equipment"
    },
    {
      id: 6,
      message: "New test service added successfully",
      time: "3 days ago",
      read: true,
      type: "service"
    },
  ];

  useEffect(() => {
    const user = getLoggedInUser("lab");
    if (user) {
      setLabName(user.lab_name || user.owner_name || "Lab Admin");
    }

    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");

    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get page title based on pathname
  const getPageTitle = () => {
    const path = pathname;
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/orders")) return "Test Orders";
    if (path.includes("/tests") || path.includes("/services")) return "Test Services";
    if (path.includes("/reports")) return "Lab Reports";
    if (path.includes("/patients")) return "Patients Management";
    if (path.includes("/profile")) return "Profile Settings";
    if (path.includes("/settings")) return "System Settings";
    return "Laboratory Portal";
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return <Beaker className="w-4 h-4 text-blue-600" />;
      case 'collection': return <Activity className="w-4 h-4 text-amber-600" />;
      case 'report': return <FileText className="w-4 h-4 text-green-600" />;
      case 'performance': return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'equipment': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'service': return <TestTube className="w-4 h-4 text-indigo-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-blue-200 dark:border-gray-700 px-4 lg:px-6 py-4 shadow-sm shadow-blue-100/50 dark:shadow-gray-900 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Button & Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only show on mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold text-blue-800 dark:text-blue-300">
              {getPageTitle()}
            </h1>
            <p className="text-xs lg:text-sm text-blue-600 dark:text-blue-400 mt-1 hidden sm:block">
              {pathname.includes("/dashboard") 
                ? "Welcome back! Here's your laboratory dashboard summary."
                : `Managing ${getPageTitle().toLowerCase()} in your laboratory`}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search Bar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests, orders, patients..."
              className="w-64 pl-10 pr-4 py-2.5 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-text text-gray-800 dark:text-gray-200 placeholder-blue-400 dark:placeholder-blue-500"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="lg:hidden p-2.5 rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
            <Search size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-4 border-b border-blue-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Laboratory Notifications
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {unreadCount} unread notifications
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        Laboratory
                      </span>
                    </div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-blue-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                        !notification.read
                          ? "bg-blue-50/70 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                            {notification.message}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-blue-200 dark:border-gray-700">
                  <Link 
                    href="/lab/notifications" 
                    className="w-full flex items-center justify-center py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-900 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-blue-200 dark:border-gray-700"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              {/* Hide user info on mobile, show on desktop */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {labName}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                  Verified Laboratory
                </p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-3 border-b border-blue-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {labName}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Laboratory Account
                  </p>
                </div>
                <div className="p-2">
                  <Link 
                    href="/lab/profile" 
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <User size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Lab Profile
                    </span>
                  </Link>
                  <Link 
                    href="/lab/settings" 
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Settings size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Lab Settings
                    </span>
                  </Link>
                  <div className="border-t border-blue-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Sign Out</span>
                    </div>
                    <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full group-hover:bg-red-200 dark:group-hover:bg-red-900/50">
                      Exit
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Shows when needed */}
      <div className="lg:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests, orders, patients..."
            className="w-full pl-12 pr-4 py-3 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-text text-gray-800 dark:text-gray-200 placeholder-blue-400 dark:placeholder-blue-500"
          />
        </div>
      </div>
    </header>
  );
}