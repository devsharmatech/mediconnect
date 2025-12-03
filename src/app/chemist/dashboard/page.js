"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Pill,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Eye,
  Filter,
  Download,
  Plus,
  ShoppingCart,
  FileText,
  Truck,
  Users,
  Beaker,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChemistDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalMedicines: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    
    setStats({
      totalOrders: 142,
      pendingOrders: 18,
      completedOrders: 124,
      totalMedicines: 456,
    });

    setRecentOrders([
      {
        id: 1,
        customer: "John Smith",
        items: 5,
        amount: 1240,
        status: "pending",
        time: "10 min ago",
      },
      {
        id: 2,
        customer: "Sarah Johnson",
        items: 3,
        amount: 680,
        status: "completed",
        time: "25 min ago",
      },
      {
        id: 3,
        customer: "Robert Davis",
        items: 8,
        amount: 2150,
        status: "processing",
        time: "1 hour ago",
      },
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "processing":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-900">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              Chemist Dashboard
            </h1>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Overview of your chemist operations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0 hidden">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center space-x-2 shadow-md">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (4 only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Total Orders */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalOrders}
              </h2>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Orders</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.pendingOrders}
              </h2>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-300 rounded-xl flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.completedOrders}
              </h2>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800/40 text-green-600 dark:text-green-300 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Total Medicines */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Medicines Ordered</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalMedicines}
              </h2>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/40 text-purple-600 dark:text-purple-300 rounded-xl flex items-center justify-center">
              <Pill size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <button
              onClick={() => router.push("/chemist/orders/new")}
              className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Plus className="w-5 h-5 mr-3" />
                <span>New Order</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button className="p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-3" />
                <span>Restock</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button className="p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                <span>Invoice</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button className="p-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center justify-between">
              <div className="flex items-center">
                <Truck className="w-5 h-5 mr-3" />
                <span>Track Delivery</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Recent Orders
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Latest transactions
            </p>
          </div>
          <button
            onClick={() => router.push("/chemist/orders")}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/40">
                <th className="text-left p-4 text-sm font-medium">Customer</th>
                <th className="text-left p-4 text-sm font-medium">Items</th>
                <th className="text-left p-4 text-sm font-medium">Amount</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/20"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.time}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      {order.items} items
                    </span>
                  </td>

                  <td className="p-4 font-semibold">₹{order.amount}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1.5 capitalize">{order.status}</span>
                    </span>
                  </td>

                  <td className="p-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
