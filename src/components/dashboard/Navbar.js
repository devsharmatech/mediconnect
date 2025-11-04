"use client";

import { useEffect, useState, useRef } from "react";
import { getLoggedInUser } from "@/lib/authHelpers";
import { Bell, Search, Sun, Moon, User, Settings, LogOut, Menu } from "lucide-react";

export default function Navbar({ onMenuClick, sidebarOpen }) {
  const [role, setRole] = useState("admin");
  const [theme, setTheme] = useState("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    { id: 1, message: "New appointment booked", time: "5 min ago", read: false },
    { id: 2, message: "Patient checkup completed", time: "1 hour ago", read: false },
    { id: 3, message: "New medicine order placed", time: "2 hours ago", read: true },
    { id: 4, message: "System backup completed", time: "1 day ago", read: true },
  ];

  useEffect(() => {
    const user = getLoggedInUser("admin");
    if (user?.role) setRole(user.role);

    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);

    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Button & Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only show on mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
              Dashboard
            </h1>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
              Welcome back, Admin! Here's your medical dashboard summary.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search Bar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, doctors..."
              className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 cursor-text"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
            <Search size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{unreadCount} unread</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-2">
                  <button className="w-full text-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {/* Hide user info on mobile, show on desktop */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Admin User
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Admin"}
                </p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-2">
                  <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <User size={18} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Settings size={18} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer">
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, doctors..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 cursor-text text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
    </header>
  );
}