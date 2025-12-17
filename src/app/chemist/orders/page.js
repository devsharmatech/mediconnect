"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ClipboardList, 
  Search, 
  User, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  Download,
  Truck,
  Package,
  AlertCircle,
  TrendingUp,
  MoreVertical,
  Calendar,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Pill,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { getLoggedInUser } from "@/lib/authHelpers";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [chemist, setChemist] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0
  });
  
  const router = useRouter();

  // Load user only once
  useEffect(() => {
    const u = getLoggedInUser("chemist");
    if (u) setChemist(u);
  }, []);

  // Fetch orders with pagination
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch("/api/chemists/order/get-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chemist_id: chemist.id,
          page: page,
          pageSize: pagination.pageSize,
          search: search,
          status: statusFilter !== "all" ? statusFilter : ""
        }),
      });

      const result = await res.json();
      if (result.success) {
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
        calculateStats(result.data.orders);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    if (chemist?.id) {
      fetchOrders(pagination.currentPage);
    }
  }, [chemist, pagination.currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chemist?.id) {
        fetchOrders(1); // Reset to page 1 on search
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const calculateStats = (ordersData) => {
    const total = ordersData.length;
    const pending = ordersData.filter(o => o.status === "pending").length;
    const completed = ordersData.filter(o => o.status === "completed").length;
    const revenue = ordersData
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    setStats({ total, pending, completed, revenue });
  };

  // Status configuration
  const statusConfig = {
    pending: { 
      color: "bg-gradient-to-r from-amber-500 to-amber-400", 
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-800 dark:text-amber-400",
      icon: <Clock className="w-4 h-4" />, 
      text: "Pending" 
    },
    sent_to_chemist: { 
      color: "bg-gradient-to-r from-blue-500 to-blue-400", 
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-800 dark:text-blue-400",
      icon: <Package className="w-4 h-4" />, 
      text: "Sent to Chemist" 
    },
    approved: { 
      color: "bg-gradient-to-r from-green-500 to-green-400", 
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-800 dark:text-green-400",
      icon: <CheckCircle2 className="w-4 h-4" />, 
      text: "Approved" 
    },
    partially_approved: { 
      color: "bg-gradient-to-r from-purple-500 to-purple-400", 
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-800 dark:text-purple-400",
      icon: <AlertCircle className="w-4 h-4" />, 
      text: "Partially Approved" 
    },
    rejected: { 
      color: "bg-gradient-to-r from-red-500 to-red-400", 
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-800 dark:text-red-400",
      icon: <XCircle className="w-4 h-4" />, 
      text: "Rejected" 
    },
    ready_for_pickup: { 
      color: "bg-gradient-to-r from-indigo-500 to-indigo-400", 
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-800 dark:text-indigo-400",
      icon: <ShieldCheck className="w-4 h-4" />, 
      text: "Ready for Pickup" 
    },
    out_for_delivery: { 
      color: "bg-gradient-to-r from-orange-500 to-orange-400", 
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-800 dark:text-orange-400",
      icon: <Truck className="w-4 h-4" />, 
      text: "Out for Delivery" 
    },
    completed: { 
      color: "bg-gradient-to-r from-emerald-500 to-emerald-400", 
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-800 dark:text-emerald-400",
      icon: <CheckCircle2 className="w-4 h-4" />, 
      text: "Completed" 
    },
    cancelled: { 
      color: "bg-gradient-to-r from-gray-500 to-gray-400", 
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-800 dark:text-gray-400",
      icon: <XCircle className="w-4 h-4" />, 
      text: "Cancelled" 
    },
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key === 'created_at') {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortConfig.key === 'total_amount') {
      const amountA = a.total_amount || 0;
      const amountB = b.total_amount || 0;
      return sortConfig.direction === 'asc' ? amountA - amountB : amountB - amountA;
    }
    
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
      fetchOrders(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.totalPages);
  const goToPrevPage = () => goToPage(pagination.currentPage - 1);
  const goToNextPage = () => goToPage(pagination.currentPage + 1);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronDown className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    
    // Always show first page
    pages.push(1);
    
    // Calculate start and end
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);
    
    // Adjust if we're near the start
    if (current <= 3) {
      end = Math.min(5, total - 1);
    }
    
    // Adjust if we're near the end
    if (current >= total - 2) {
      start = Math.max(2, total - 4);
    }
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < total - 1) {
      pages.push('...');
    }
    
    // Always show last page if there is more than one page
    if (total > 1) {
      pages.push(total);
    }
    
    return pages;
  };

  return (
    <div className="p-6 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 dark:text-white">
                Medicine Orders
              </h1>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Manage and process patient medication orders
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button 
            onClick={() => fetchOrders(pagination.currentPage)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-500/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">Total Orders</p>
              <h2 className="text-3xl font-bold text-blue-900 dark:text-white mt-1">
                {pagination.totalItems}
              </h2>
              
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 border border-amber-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">Pending Orders</p>
              <h2 className="text-3xl font-bold text-amber-900 dark:text-white mt-1">
                {stats.pending}
              </h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Requires attention</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-400 text-white rounded-xl flex items-center justify-center shadow-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 border border-emerald-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">Completed Orders</p>
              <h2 className="text-3xl font-bold text-emerald-900 dark:text-white mt-1">
                {stats.completed}
              </h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Delivered successfully</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-400 text-white rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white dark:from-gray-800 dark:to-gray-900 border border-cyan-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-700 dark:text-cyan-400 text-sm font-medium">Total Revenue</p>
              <h2 className="text-3xl font-bold text-cyan-900 dark:text-white mt-1">
                ₹{stats.revenue.toLocaleString()}
              </h2>
              
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-400 text-white rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, order ID, phone number, or medicine..."
              className="w-full pl-12 pr-4 py-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-blue-400 dark:placeholder-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-200"
              >
                <option value="all">All Status</option>
                {Object.keys(statusConfig).map(status => (
                  <option key={status} value={status}>
                    {statusConfig[status].text}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value), currentPage: 1 }));
                  fetchOrders(1);
                }}
                className="appearance-none px-4 py-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-200"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-blue-700 dark:text-blue-300 mt-4 text-lg font-medium">Loading orders...</p>
          <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">Fetching your pharmacy orders</p>
        </div>
      )}

      {/* No Results */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No orders found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {search || statusFilter !== "all" 
              ? "No orders match your current filters. Try adjusting your search criteria."
              : "You don't have any medicine orders yet. Orders will appear here when patients place them."}
          </p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-blue-100 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-blue-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-900 dark:text-white">All Orders</h2>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                  {pagination.totalItems} orders
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sorted by:</span>
                <select 
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg text-sm"
                >
                  <option value="created_at">Order Date</option>
                  <option value="total_amount">Total Amount</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="p-4 text-left">
                    <button 
                      onClick={() => handleSort('unid')}
                      className="flex items-center space-x-1 text-blue-800 dark:text-blue-300 font-semibold text-sm"
                    >
                      <span>Order ID</span>
                      <SortIcon columnKey="unid" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <span className="text-blue-800 dark:text-blue-300 font-semibold text-sm">Patient Details</span>
                  </th>
                  <th className="p-4 text-left">
                    <button 
                      onClick={() => handleSort('medicine_order_items')}
                      className="flex items-center space-x-1 text-blue-800 dark:text-blue-300 font-semibold text-sm"
                    >
                      <span>Medicines</span>
                      <SortIcon columnKey="medicine_order_items" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <span className="text-blue-800 dark:text-blue-300 font-semibold text-sm">Status</span>
                  </th>
                  <th className="p-4 text-left">
                    <button 
                      onClick={() => handleSort('total_amount')}
                      className="flex items-center space-x-1 text-blue-800 dark:text-blue-300 font-semibold text-sm"
                    >
                      <span>Amount</span>
                      <SortIcon columnKey="total_amount" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button 
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-1 text-blue-800 dark:text-blue-300 font-semibold text-sm"
                    >
                      <span>Order Date</span>
                      <SortIcon columnKey="created_at" />
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <span className="text-blue-800 dark:text-blue-300 font-semibold text-sm">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 dark:divide-gray-700">
                {sortedOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">{order.unid}</p>
                          
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {order.patient?.patient_details?.full_name || "Unknown Patient"}
                          </span>
                        </div>
                        {order.patient?.patient_details?.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {order.patient.patient_details.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {order.medicine_order_items?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${statusConfig[order.status]?.bgColor || 'bg-gray-100'}`}>
                        {statusConfig[order.status]?.icon}
                        <span className={`text-sm font-medium ${statusConfig[order.status]?.textColor || 'text-gray-700'}`}>
                          {statusConfig[order.status]?.text || order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {order.total_amount ? (
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{order.total_amount.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {order.payment_method || 'Payment Pending'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Amount not set</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-800 dark:text-white">
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(order.created_at)}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/chemist/orders/${order.id}`)}
                          className="p-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/30 group-hover:shadow-xl"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-blue-100 dark:border-gray-700 bg-blue-50/50 dark:bg-gray-800/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                <span className="font-semibold text-gray-800 dark:text-white">{pagination.totalItems}</span> orders
              </div>
              
              <div className="flex items-center space-x-2">
                {/* First Page */}
                <button
                  onClick={goToFirstPage}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={goToPrevPage}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {generatePageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                          pageNum === pagination.currentPage
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'hover:bg-blue-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Page */}
                <button
                  onClick={goToNextPage}
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={goToLastPage}
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-semibold text-gray-800 dark:text-white">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold text-gray-800 dark:text-white">{pagination.totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}