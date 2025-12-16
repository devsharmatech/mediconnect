"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  PackageSearch,
  Edit,
  Save,
  CircleSlash,
  Beaker,
  Pill,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  ShieldCheck,
  AlertCircle,
  Home,
  Mail,
  ChevronRight,
  Stethoscope,
  BriefcaseMedical,
  FileSignature,
  Clock4,
  Activity,
  Microscope,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/chemists/order/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id }),
      });

      const result = await res.json();

      console.log("Order API response:", result); // Debug log

      if (!result.success) {
        toast.error(result.message || "Failed to load order");
        return;
      }

      setOrder(result.data);
      setNotes(result.data.chemist_notes || "");
      toast.success("Order details loaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while fetching order details");
    }
    setLoading(false);
  };

  const updateItem = async (item) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/chemists/order/update-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          status: item.status,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Medicine item updated successfully");
        await fetchOrder();
      } else {
        toast.error(result.message || "Failed to update item");
      }
    } catch (e) {
      toast.error("Error updating item");
    }
    setUpdating(false);
  };

  const updateOrderStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/chemists/order/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          status,
          chemist_notes: notes,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Order status updated successfully");
        await fetchOrder();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (e) {
      toast.error("Update failed. Please try again.");
    }
    setUpdating(false);
  };

  const statusConfig = {
    pending: {
      color: "bg-gradient-to-r from-amber-500 to-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-800 dark:text-amber-400",
      icon: <Clock className="w-4 h-4" />,
      text: "Pending",
    },
    sent_to_chemist: {
      color: "bg-gradient-to-r from-blue-500 to-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-800 dark:text-blue-400",
      icon: <PackageSearch className="w-4 h-4" />,
      text: "Sent to Chemist",
    },
    approved: {
      color: "bg-gradient-to-r from-green-500 to-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-800 dark:text-green-400",
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: "Approved",
    },
    partially_approved: {
      color: "bg-gradient-to-r from-purple-500 to-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-800 dark:text-purple-400",
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Partially Approved",
    },
    rejected: {
      color: "bg-gradient-to-r from-red-500 to-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-800 dark:text-red-400",
      icon: <XCircle className="w-4 h-4" />,
      text: "Rejected",
    },
    ready_for_pickup: {
      color: "bg-gradient-to-r from-indigo-500 to-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-800 dark:text-indigo-400",
      icon: <ShieldCheck className="w-4 h-4" />,
      text: "Ready for Pickup",
    },
    out_for_delivery: {
      color: "bg-gradient-to-r from-orange-500 to-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-800 dark:text-orange-400",
      icon: <Truck className="w-4 h-4" />,
      text: "Out for Delivery",
    },
    completed: {
      color: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-800 dark:text-emerald-400",
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: "Completed",
    },
    cancelled: {
      color: "bg-gradient-to-r from-gray-500 to-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-800 dark:text-gray-400",
      icon: <XCircle className="w-4 h-4" />,
      text: "Cancelled",
    },
  };

  if (loading)
    return (
      <div className="p-10 text-center min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-950">
        <Toaster />
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-blue-700 dark:text-blue-300 text-lg font-medium">
          Loading order details...
        </p>
        <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
          Please wait while we fetch the order information
        </p>
      </div>
    );

  if (!order)
    return (
      <div className="p-10 text-center min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-950">
        <Toaster />
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Order not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The order you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <button
          onClick={() => router.push("/chemist/orders")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/30"
        >
          Back to Orders
        </button>
      </div>
    );

  const totalAmount = order.medicine_order_items?.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  // Format medicines from prescription
  const formatMedicines = () => {
    if (!order.prescription?.medicines) return [];

    try {
      if (typeof order.prescription.medicines === "string") {
        return JSON.parse(order.prescription.medicines);
      }
      return order.prescription.medicines || [];
    } catch (e) {
      return [];
    }
  };

  const prescriptionMedicines = formatMedicines();

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            backdropFilter: "blur(10px)",
          },
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <button
            onClick={() => router.push("/chemist/orders")}
            className="p-2 rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900 dark:text-white">
                Order #{order.unid}
              </h1>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                View and manage order details
              </p>
            </div>
          </div>
        </div>

        <div
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-full ${
            statusConfig[order.status]?.bgColor || "bg-gray-100"
          }`}
        >
          {statusConfig[order.status]?.icon}
          <span
            className={`font-medium ${
              statusConfig[order.status]?.textColor || "text-gray-700"
            }`}
          >
            {statusConfig[order.status]?.text ||
              order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-200 dark:border-gray-700 mb-8">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-3 font-medium text-sm transition-all duration-200 ${
            activeTab === "details"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4" />
            <span>Order Details</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("medicines")}
          className={`px-4 py-3 font-medium text-sm transition-all duration-200 ${
            activeTab === "medicines"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span>Medicines ({order.medicine_order_items?.length || 0})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("prescription")}
          className={`px-4 py-3 font-medium text-sm transition-all duration-200 ${
            activeTab === "prescription"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Prescription</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("actions")}
          className={`px-4 py-3 font-medium text-sm transition-all duration-200 ${
            activeTab === "actions"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Actions</span>
          </div>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient Info & Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-blue-900 dark:text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  Patient Information
                </h2>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                  Patient
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {order.patient?.patient_details?.full_name || "Unknown Patient"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {order.patient?.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Address
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {order.patient?.patient_details?.address || "Address not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Order Date
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-6 flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
                Order Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Order ID
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {order.unid}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`font-semibold ${
                        statusConfig[order.status]?.textColor || "text-gray-700"
                      }`}
                    >
                      {statusConfig[order.status]?.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Order Type
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {order.order_type || "Regular"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Created
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {new Date(
                        order.updated_at || order.created_at
                      ).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-blue-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800 dark:text-white">
                        Total Items
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {order.medicine_order_items?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-8">
            {/* Order Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
                Financial Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery Charges
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    ₹{order.delivery_charge || 0}
                  </span>
                </div>

                <div className="pt-3 border-t border-blue-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹
                      {(
                        totalAmount + (order.delivery_charge || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription Status */}
            {order.prescription_id && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Prescription
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Prescription ID
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {order.prescription_id.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs">
                      Attached
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("prescription")}
                  className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/30"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Prescription</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "medicines" && (
        <div className="space-y-8">
          {/* Medicines Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white flex items-center">
                <Pill className="w-5 h-5 mr-2 text-purple-500" />
                Order Medicines
              </h2>
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                {order.medicine_order_items?.length || 0} items
              </div>
            </div>

            <div className="space-y-6">
              {order.medicine_order_items?.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-blue-100 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-r from-blue-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg flex items-center justify-center">
                        <Pill className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {item.medicine_name || `Medicine ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.dosage || "Standard dosage"} |{" "}
                          {item.frequency || "As prescribed"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                        statusConfig[item.status]?.bgColor || "bg-gray-100"
                      }`}
                    >
                      {statusConfig[item.status]?.icon}
                      <span
                        className={`text-xs font-medium ${
                          statusConfig[item.status]?.textColor ||
                          "text-gray-700"
                        }`}
                      >
                        {statusConfig[item.status]?.text ||
                          item.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity ?? 1}
                        min="1"
                        onChange={(e) => {
                          const updatedItems = [...order.medicine_order_items];
                          updatedItems[index] = {
                            ...updatedItems[index],
                            quantity: Number(e.target.value),
                          };
                          setOrder({
                            ...order,
                            medicine_order_items: updatedItems,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={item.price ?? 0}
                        min="0"
                        step="0.01"
                        onChange={(e) => {
                          const updatedItems = [...order.medicine_order_items];
                          updatedItems[index] = {
                            ...updatedItems[index],
                            price: Number(e.target.value),
                          };
                          setOrder({
                            ...order,
                            medicine_order_items: updatedItems,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">
                        Status
                      </label>
                      <select
                        value={item.status}
                        onChange={(e) => {
                          const updatedItems = [...order.medicine_order_items];
                          updatedItems[index] = {
                            ...updatedItems[index],
                            status: e.target.value,
                          };
                          setOrder({
                            ...order,
                            medicine_order_items: updatedItems,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-gray-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="available">Available</option>
                        <option value="not_available">Not Available</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => updateItem(item)}
                    disabled={updating}
                    className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updating ? "Updating..." : "Update Item"}</span>
                  </button>
                </div>
              ))}
            </div>

            {order.medicine_order_items?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-blue-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Items
                    </p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {order.medicine_order_items.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "prescription" && (
        <div className="space-y-8">
          {/* Prescription Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                Prescription Details
              </h2>
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                Rx#{order.prescription_id?.slice(0, 8) || "PRESCRIPTION"}
              </div>
            </div>

            {order.prescription ? (
              <div className="space-y-8">
                {/* Doctor Information */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                        {order.prescription.doctor?.full_name ||
                          "Prescribing Doctor"}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400">
                        {order.prescription.doctor?.specialization ||
                          "Medical Professional"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <BriefcaseMedical className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {order.prescription.doctor?.qualification || "MBBS, MD"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {order.prescription.doctor?.clinic_name ||
                          "Medical Clinic"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prescribed Medicines */}
                {prescriptionMedicines.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-emerald-500" />
                      Prescribed Medicines
                    </h3>

                    <div className="space-y-4">
                      {prescriptionMedicines.map((medicine, index) => (
                        <div
                          key={index}
                          className="border border-blue-100 dark:border-gray-700 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {medicine.name || `Medicine ${index + 1}`}
                            </h4>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                              {medicine.type || "Tablet"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Dosage:{" "}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {medicine.dosage || "As prescribed"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Frequency:{" "}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {medicine.frequency || "Daily"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Duration:{" "}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {medicine.duration || "7 days"}
                              </span>
                            </div>
                          </div>

                          {medicine.instructions && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                Instructions:{" "}
                              </span>
                              {medicine.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {order.prescription.special_message && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                      Special Instructions
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {order.prescription.special_message}
                    </p>
                  </div>
                )}

              

                {/* Prescription Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Prescribed On
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {order.prescription.created_at
                        ? new Date(
                            order.prescription.created_at
                          ).toLocaleDateString("en-IN")
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileSignature className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Digital Signature
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {order.prescription.doctor?.signature_url
                        ? "Available"
                        : "Not Available"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Medicines
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {prescriptionMedicines.length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  No Prescription Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This order doesn't have a prescription attached.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-6 flex items-center">
                <Edit className="w-5 h-5 mr-2 text-blue-500" />
                Update Order Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "approved",
                  "partially_approved",
                  "ready_for_pickup",
                  "completed",
                  "rejected",
                  "cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updating}
                    className={`px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 ${
                      statusConfig[status]?.bgColor || "bg-gray-100"
                    } hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center space-x-3">
                      {statusConfig[status]?.icon}
                      <span
                        className={`font-medium ${
                          statusConfig[status]?.textColor || "text-gray-700"
                        }`}
                      >
                        {statusConfig[status]?.text}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-blue-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Current Status:{" "}
                  <span
                    className={`font-semibold ${
                      statusConfig[order.status]?.textColor || "text-gray-700"
                    }`}
                  >
                    {statusConfig[order.status]?.text}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Last updated:{" "}
                  {new Date(
                    order.updated_at || order.created_at
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Chemist Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-amber-500" />
                Chemist Notes
              </h2>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-40 px-3 py-2 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 dark:text-gray-200 resize-none"
                placeholder="Add your notes here (instructions, special handling, customer communication, etc.)..."
              />

              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={() => updateOrderStatus(order.status)} // This will save notes too
                  disabled={updating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? "Saving..." : "Save Notes"}</span>
                </button>

                <button
                  onClick={() => setNotes("")}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Tools */}
          <div className="space-y-8">
            {/* Order Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-6 flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
                Order Tools
              </h2>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-600 rounded-xl flex items-center justify-between hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Print Invoice
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-600 rounded-xl flex items-center justify-between hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Generate Receipt
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-600 rounded-xl flex items-center justify-between hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Arrange Delivery
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-600 rounded-xl flex items-center justify-between hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Contact Patient
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
                Financial Summary
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order ID
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {order.unid}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order Date
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Items
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {order.medicine_order_items?.length || 0}
                  </span>
                </div>

                <div className="pt-3 border-t border-blue-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
