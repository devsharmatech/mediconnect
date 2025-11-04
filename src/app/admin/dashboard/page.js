"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedInUser } from "@/lib/authHelpers";
import {
  Users,
  Calendar,
  DollarSign,
  Stethoscope,
  Pill,
  Activity,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Clock,
  UserCheck,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const user = getLoggedInUser("admin");
    if (!user) router.push("/admin/login");

    // Set default dates
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, [router]);

  // Stats Data
  const stats = [
    {
      title: "Total Patients",
      value: "1,234",
      change: "+12%",
      icon: <Users className="w-6 h-6" />,
      color: "bg-gray-800",
      trend: "up",
    },
    {
      title: "Appointments",
      value: "156",
      change: "+8%",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-gray-800",
      trend: "up",
    },
    {
      title: "Revenue",
      value: "$45,678",
      change: "+23%",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-gray-800",
      trend: "up",
    },
    {
      title: "Doctors",
      value: "48",
      change: "+5%",
      icon: <Stethoscope className="w-6 h-6" />,
      color: "bg-gray-800",
      trend: "up",
    },
    {
      title: "Medicines",
      value: "324",
      change: "+3%",
      icon: <Pill className="w-6 h-6" />,
      color: "bg-gray-800",
      trend: "up",
    },
    {
      title: "Health Records",
      value: "2,156",
      change: "+15%",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-gray-800",
      trend: "up",
    },
  ];

  // Appointments Data for Bar Chart
  const appointmentData = [
    { day: "Mon", appointments: 25, completed: 20 },
    { day: "Tue", appointments: 32, completed: 28 },
    { day: "Wed", appointments: 28, completed: 25 },
    { day: "Thu", appointments: 41, completed: 35 },
    { day: "Fri", appointments: 36, completed: 30 },
    { day: "Sat", appointments: 18, completed: 15 },
    { day: "Sun", appointments: 12, completed: 10 },
  ];

  // Revenue Data for Line Chart
  const revenueData = [
    { month: "Jan", revenue: 12000, growth: 10 },
    { month: "Feb", revenue: 15000, growth: 25 },
    { month: "Mar", revenue: 18000, growth: 20 },
    { month: "Apr", revenue: 22000, growth: 22 },
    { month: "May", revenue: 25000, growth: 14 },
    { month: "Jun", revenue: 30000, growth: 20 },
  ];

  // Patient Age Distribution for Pie Chart
  const ageDistributionData = [
    { name: "0-18", value: 15, color: "#4B5563" },
    { name: "19-35", value: 35, color: "#6B7280" },
    { name: "36-50", value: 25, color: "#9CA3AF" },
    { name: "51-65", value: 15, color: "#D1D5DB" },
    { name: "65+", value: 10, color: "#E5E7EB" },
  ];

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("revenue")
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
              {entry.name.includes("growth") && "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <main className="flex-1 overflow-auto relative z-0">
      <div className="p-4 md:p-4 lg:p-4 bg-transparent">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h4 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Medical Dashboard
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Comprehensive overview of your healthcare facility
                </p>
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors cursor-pointer">
                <Plus size={20} />
                <span>New Appointment</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <Filter size={20} />
                    <span>Filters</span>
                  </h2>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {dateRange === "custom" && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                    </div>
                  )}
                </div>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors cursor-pointer">
                  <Download size={18} />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">
                        {stat.value}
                      </p>
                      <p
                        className={`text-sm font-medium mt-1 ${
                          stat.change.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change} from last period
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <Calendar size={20} />
                    <span>Weekly Appointments</span>
                  </h3>
                  <span className="text-sm text-green-600 font-medium">
                    +18% growth
                  </span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="day"
                        className="text-sm"
                        tick={{ fill: "#6B7280" }}
                      />
                      <YAxis className="text-sm" tick={{ fill: "#6B7280" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="appointments"
                        name="Total Appointments"
                        fill="#4B5563"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        fill="#9CA3AF"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <DollarSign size={20} />
                    <span>Revenue Trend</span>
                  </h3>
                  <span className="text-sm text-green-600 font-medium">
                    +23% growth
                  </span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="month"
                        className="text-sm"
                        tick={{ fill: "#6B7280" }}
                      />
                      <YAxis
                        className="text-sm"
                        tick={{ fill: "#6B7280" }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value, name) => [
                          name === "revenue"
                            ? `$${value.toLocaleString()}`
                            : `${value}%`,
                          name === "revenue" ? "Revenue" : "Growth",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#4B5563"
                        strokeWidth={3}
                        dot={{ fill: "#4B5563", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#1F2937" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Additional Content to Test Scrolling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Age Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <UserCheck size={20} />
                    <span>Patient Age Distribution</span>
                  </h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ageDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center space-x-2">
                  <Activity size={20} />
                  <span>Quick Stats</span>
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Avg. Appointment Duration",
                      value: "28 mins",
                      icon: <Clock size={16} />,
                    },
                    {
                      label: "Patient Satisfaction",
                      value: "94%",
                      icon: <Eye size={16} />,
                    },
                    {
                      label: "Follow-up Rate",
                      value: "78%",
                      icon: <UserCheck size={16} />,
                    },
                    {
                      label: "Emergency Cases",
                      value: "12",
                      icon: <Activity size={16} />,
                    },
                    {
                      label: "Lab Tests Today",
                      value: "45",
                      icon: <Activity size={16} />,
                    },
                    {
                      label: "Prescriptions",
                      value: "89",
                      icon: <Pill size={16} />,
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {stat.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity - More Items to Test Scrolling */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "New patient registration - John Doe",
                    time: "2 minutes ago",
                    user: "Reception",
                    type: "registration",
                  },
                  {
                    action: "Appointment completed with Dr. Smith",
                    time: "1 hour ago",
                    user: "Dr. Smith",
                    type: "appointment",
                  },
                  {
                    action: "Medicine order placed for Patient #123",
                    time: "3 hours ago",
                    user: "Pharmacy",
                    type: "order",
                  },
                  {
                    action: "Lab test results uploaded for Sarah Wilson",
                    time: "5 hours ago",
                    user: "Lab Technician",
                    type: "lab",
                  },
                  {
                    action: "Payment received for invoice #INV-2024-001",
                    time: "1 day ago",
                    user: "Finance Dept",
                    type: "payment",
                  },
                  {
                    action: "New doctor onboarded - Dr. Johnson",
                    time: "1 day ago",
                    user: "HR Dept",
                    type: "onboarding",
                  },
                  {
                    action: "Medical equipment maintenance completed",
                    time: "2 days ago",
                    user: "Maintenance",
                    type: "maintenance",
                  },
                  {
                    action: "Patient feedback received - 5 stars",
                    time: "2 days ago",
                    user: "Quality Dept",
                    type: "feedback",
                  },
                  {
                    action: "Insurance claim processed",
                    time: "3 days ago",
                    user: "Insurance Dept",
                    type: "insurance",
                  },
                  {
                    action: "Staff training session completed",
                    time: "3 days ago",
                    user: "Training Dept",
                    type: "training",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "registration"
                          ? "bg-green-500"
                          : activity.type === "appointment"
                          ? "bg-blue-500"
                          : activity.type === "order"
                          ? "bg-yellow-500"
                          : activity.type === "lab"
                          ? "bg-purple-500"
                          : activity.type === "payment"
                          ? "bg-gray-500"
                          : activity.type === "onboarding"
                          ? "bg-indigo-500"
                          : activity.type === "maintenance"
                          ? "bg-orange-500"
                          : activity.type === "feedback"
                          ? "bg-pink-500"
                          : activity.type === "insurance"
                          ? "bg-teal-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        by {activity.user}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Sections to Ensure Scrolling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Upcoming Appointments
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          Patient #{1000 + item}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          10:0{item} AM - Dr. Smith
                        </p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Medical Alerts
                </h3>
                <div className="space-y-3">
                  {[
                    { message: "Low stock: Paracetamol", priority: "high" },
                    {
                      message: "Equipment maintenance due",
                      priority: "medium",
                    },
                    { message: "Staff training scheduled", priority: "low" },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.priority === "high"
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                          : alert.priority === "medium"
                          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                          : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {alert.priority === "high"
                          ? "High Priority"
                          : alert.priority === "medium"
                          ? "Medium Priority"
                          : "Low Priority"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
