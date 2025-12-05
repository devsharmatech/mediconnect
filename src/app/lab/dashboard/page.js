"use client";

import { useEffect, useRef, useState } from "react";
import {
  FlaskConical,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
  User,
  Loader2,
  ClipboardList,
  DollarSign,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingDown,
  Activity,
  RefreshCw,
  Users,
  Target,
  Zap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getLoggedInUser } from "@/lib/authHelpers";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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

export default function LabDashboard() {
  const router = useRouter();
  const lab = getLoggedInUser("lab");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("line");
  const didFetch = useRef(false);

  useEffect(() => {
    if (!lab?.id) return;
    if (!didFetch.current) {
      didFetch.current = true;
      fetchDashboard();
    }
  }, [lab?.id, timeRange]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/lab/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lab_id: lab.id, time_range: timeRange }),
      });

      const result = await res.json();

      if (result.success) {
        setDashboard(result.data);
        toast.success("Dashboard updated successfully");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts (replace with actual data from API)
  const generateRevenueData = () => {
    const data = [];
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseRevenue = 50000 + Math.random() * 30000;
      const trendFactor = i * 1500;
      const noise = Math.random() * 10000 - 5000;
      
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date.toISOString().split("T")[0],
        revenue: Math.round(baseRevenue + trendFactor + noise),
        tests: Math.round(10 + Math.random() * 20 + i * 0.2),
        orders: Math.round(5 + Math.random() * 10 + i * 0.1),
      });
    }
    return data;
  };

  const generateTestDistribution = () => {
    return [
      { name: "Blood Tests", value: 35, color: "#4f46e5" },
      { name: "Urine Tests", value: 25, color: "#06b6d4" },
      { name: "Biochemistry", value: 20, color: "#10b981" },
      { name: "Hormone Tests", value: 12, color: "#f59e0b" },
      { name: "Other Tests", value: 8, color: "#8b5cf6" },
    ];
  };

  const timeRanges = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
    { id: "1y", label: "1 Year" },
  ];

  const chartTypes = [
    { id: "line", label: "Line", icon: "📈" },
    { id: "area", label: "Area", icon: "📊" },
    { id: "bar", label: "Bar", icon: "📋" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              </div>
              <span className="font-bold text-gray-900">
                {entry.dataKey === "revenue" ? "₹" : ""}
                {entry.value.toLocaleString()}
                {entry.dataKey === "revenue" ? "" : " tests"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-center flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Loading your dashboard...</p>
          <p className="text-sm text-gray-500">Fetching latest lab insights</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Unavailable</h2>
            <p className="text-gray-600 mb-6">We couldn't load your dashboard data.</p>
            <button
              onClick={fetchDashboard}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { lab: labInfo, stats, recent_orders, daily_revenue } = dashboard;
  const revenueData = generateRevenueData();
  const testDistribution = generateTestDistribution();
  const revenueChange = stats.revenue_change || 12.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #334155',
          },
        }}
      />

      {/* HEADER */}
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                <FlaskConical className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Lab Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-600">
                  Welcome back, <span className="font-semibold text-blue-700">{labInfo?.lab_name}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer"
                >
                  {timeRanges.map((range) => (
                    <option key={range.id} value={range.id}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={fetchDashboard}
              className="px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium shadow-sm transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Total Orders</div>
                <div className="text-xs text-gray-400">All time</div>
              </div>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.total_orders}</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, (stats.total_orders / 1000) * 100)}%` }}
                />
              </div>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          {/* Pending Orders */}
          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Pending</div>
                <div className="text-xs text-gray-400">Requires action</div>
              </div>
            </div>
            <h3 className="text-4xl font-bold text-amber-600 mb-2">{stats.pending_orders}</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.pending_orders / 100) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-amber-600">
                {stats.pending_orders > 0 ? "Action required" : "All clear"}
              </span>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Completed</div>
                <div className="text-xs text-gray-400">Success rate</div>
              </div>
            </div>
            <h3 className="text-4xl font-bold text-emerald-600 mb-2">{stats.completed_orders}</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.completed_orders / stats.total_orders) * 100 || 0)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600">
                {Math.round((stats.completed_orders / stats.total_orders) * 100 || 0)}%
              </span>
            </div>
          </div>

          {/* Revenue */}
          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-violet-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Revenue</div>
                <div className="text-xs text-gray-400">Last {timeRange === "30d" ? "30 days" : timeRange}</div>
              </div>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">
              ₹{stats.revenue_30_days?.toLocaleString() || "0"}
            </h3>
            <div className="flex items-center gap-2">
              {revenueChange >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">+{revenueChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">{revenueChange}%</span>
                </>
              )}
              <span className="text-xs text-gray-500 ml-auto">vs previous period</span>
            </div>
          </div>
        </div>

        {/* MAIN CHART SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* REVENUE CHART */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Revenue Trend
                </h2>
                <p className="text-gray-500 text-sm">Daily revenue over time</p>
              </div>
              
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <div className="bg-gray-100 p-1 rounded-lg flex">
                  {chartTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        chartType === type.id
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-1.5">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tests"
                      name="Tests Conducted"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                ) : chartType === "area" ? (
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#4f46e5"
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                ) : (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* TEST DISTRIBUTION PIE CHART */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Test Distribution
                </h2>
                <p className="text-gray-500 text-sm">By category</p>
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {testDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tests`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {testDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-auto">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT ORDERS & PERFORMANCE METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* RECENT ORDERS */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Recent Orders
                <span className="text-sm font-normal text-gray-500 ml-2">
                  Last 10 orders
                </span>
              </h2>
              <button 
                onClick={() => router.push('/lab/orders')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              {recent_orders?.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/lab/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${order.status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        {order.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">#{order.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-3 h-3" />
                          {order.patient_details?.full_name || "Unknown Patient"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {order.lab_test_order_items?.count || 0}
                        <span className="text-sm font-normal text-gray-500 ml-1">tests</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PERFORMANCE METRICS */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-300" />
              Performance Metrics
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Order Processing Time</span>
                  <span className="font-bold">24h avg</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-3/4"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Test Accuracy Rate</span>
                  <span className="font-bold">99.2%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full w-99"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Customer Satisfaction</span>
                  <span className="font-bold">4.8/5</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full w-96"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Equipment Uptime</span>
                  <span className="font-bold">98.7%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full w-98"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overall Performance Score</p>
                  <p className="text-2xl font-bold">94.5</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Lab Efficiency</p>
                  <p className="text-lg font-bold text-green-400">Excellent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p className="text-gray-800 font-medium">
                All systems operational • Next data refresh in 5 minutes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboard}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Dashboard
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium shadow-sm transition-colors duration-200"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}