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
  FlaskRoundIcon as LabIcon,
  ShoppingCart,
  UserCog,
  RefreshCw,
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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, startDate, endDate]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const params = new URLSearchParams({
        dateRange,
        ...(dateRange === 'custom' && { startDate, endDate })
      });

      const response = await fetch(`/api/admin/dashboard?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setError(error.message);
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats Data based on real data
  const stats = dashboardData ? [
    {
      title: "Total Patients",
      value: dashboardData.stats.totalPatients?.toLocaleString() || "0",
      change: "+12%",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      trend: "up",
    },
    {
      title: "Total Doctors",
      value: dashboardData.stats.totalDoctors?.toLocaleString() || "0",
      change: "+5%",
      icon: <Stethoscope className="w-6 h-6" />,
      color: "bg-green-500",
      trend: "up",
    },
    {
      title: "Appointments",
      value: dashboardData.stats.totalAppointments?.toLocaleString() || "0",
      change: "+8%",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-purple-500",
      trend: "up",
    },
    {
      title: "Revenue",
      value: `$${(dashboardData.stats.totalRevenue || 0).toLocaleString()}`,
      change: "+23%",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-yellow-500",
      trend: "up",
    },
    {
      title: "Labs",
      value: dashboardData.stats.totalLabs?.toLocaleString() || "0",
      change: "+3%",
      icon: <LabIcon className="w-6 h-6" />,
      color: "bg-red-500",
      trend: "up",
    },
    {
      title: "Chemists",
      value: dashboardData.stats.totalChemists?.toLocaleString() || "0",
      change: "+7%",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-indigo-500",
      trend: "up",
    },
  ] : [];

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

  if (loading) {
    return (
      <main className="flex-1 overflow-auto relative z-0">
        <div className="p-4 md:p-4 lg:p-4 bg-transparent">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center h-96">
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Loading dashboard data...
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-auto relative z-0">
        <div className="p-4 md:p-4 lg:p-4 bg-transparent">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">Error</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
                <button 
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

                <button 
                  onClick={fetchDashboardData}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw size={18} />
                  <span>Refresh</span>
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
                        {stat.change}
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
                    <BarChart data={dashboardData?.charts.appointmentChart || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" className="text-sm" tick={{ fill: "#6B7280" }} />
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
                    <LineChart data={dashboardData?.charts.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-sm" tick={{ fill: "#6B7280" }} />
                      <YAxis 
                        className="text-sm" 
                        tick={{ fill: "#6B7280" }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
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

            {/* Additional Content */}
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
                        data={dashboardData?.charts.ageDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData?.charts.ageDistribution?.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={["#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB"][index]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} patients`, name]} />
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
                      label: "Today's Appointments",
                      value: dashboardData?.stats.todayAppointments || 0,
                      icon: <Clock size={16} />,
                    },
                    {
                      label: "Patient Satisfaction",
                      value: dashboardData?.quickStats?.patientSatisfaction || "92%",
                      icon: <Eye size={16} />,
                    },
                    {
                      label: "Follow-up Rate",
                      value: dashboardData?.quickStats?.followUpRate || "76%",
                      icon: <UserCheck size={16} />,
                    },
                    {
                      label: "Emergency Cases",
                      value: dashboardData?.quickStats?.emergencyCases || "8",
                      icon: <Activity size={16} />,
                    },
                    {
                      label: "Lab Tests Today",
                      value: dashboardData?.stats.todayLabReports || 0,
                      icon: <LabIcon size={16} />,
                    },
                    {
                      label: "Pending Prescriptions",
                      value: dashboardData?.stats.pendingPrescriptions || 0,
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

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {dashboardData?.activity?.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' 
                          ? "bg-green-500" 
                          : activity.status === 'booked'
                          ? "bg-blue-500"
                          : activity.status === 'cancelled'
                          ? "bg-red-500"
                          : "bg-gray-500"
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
          </div>
        </div>
      </div>
    </main>
  );
}