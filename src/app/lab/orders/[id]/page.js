"use client";

import { useEffect, useState } from "react";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ArrowLeft,
  FlaskConical,
  DollarSign,
  FileDown,
  Printer,
  ClipboardList,
  Activity,
  AlertCircle,
  Save,
  Mail,
  HeartPulse,
  Pill,
  MessageSquare,
  Home,
  BriefcaseMedical,
  AlertTriangle,
  Thermometer,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

export default function LabOrderDetails() {
  const router = useRouter();
  const { id } = useParams();
  const orderId = id;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labNotes, setLabNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const statusOptions = [
    "pending",
    "approved",
    "sample_collected",
    "processing",
    "completed",
    "rejected",
    "sent_to_lab", // Added from your API
  ];

  const itemStatusOptions = [
    "pending",
    "approved",
    "not_available",
    "rejected",
    "completed",
  ];

  const statusColors = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    approved: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    sample_collected: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    processing: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
    sent_to_lab: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  };

  const itemStatusColors = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    approved: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    not_available: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  };

  const collectionTypeColors = {
    walk_in: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    home_collection: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    scheduled: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
  };

  const urgencyColors = {
    routine: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    urgent: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    emergency: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lab/order/get/${orderId}`);
      const json = await res.json();

      if (json.status) {
        setOrder(json.data);
        setItems(json.data.items || []);
        setLabNotes(json.data.lab_notes || "");
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      toast.error("Error loading order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    try {
      const res = await fetch("/api/lab/order/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId, status }),
      });

      const json = await res.json();
      if (json.status) {
        toast.success("Order status updated successfully");
        fetchDetails();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const updateItemStatus = async (itemId, status) => {
    try {
      const res = await fetch("/api/lab/order/update-item-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, status }),
      });

      const json = await res.json();
      if (json.status) {
        toast.success("Test status updated");
        fetchDetails();
      } else {
        toast.error("Failed to update test status");
      }
    } catch (error) {
      toast.error("Error updating test status");
    }
  };

  const updateLabNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/lab/order/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          lab_notes: labNotes,
        }),
      });

      const json = await res.json();
      if (json.status) {
        toast.success("Lab notes saved successfully");
      } else {
        toast.error("Failed to save notes");
      }
    } catch (error) {
      toast.error("Error saving notes");
    } finally {
      setSaving(false);
    }
  };

  const downloadInvoice = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalAmount = () => {
    if (order?.total_amount && order.total_amount > 0) {
      return order.total_amount;
    }
    // Calculate from items if total_amount is 0
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="flex justify-center">
            
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <p className="text-blue-700 dark:text-blue-300 mt-4 text-lg font-medium animate-pulse">
            Loading order details...
          </p>
          <p className="text-blue-400 dark:text-blue-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The requested order could not be loaded.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const totalAmount = calculateTotalAmount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700 transition-all duration-200 hover:shadow mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Orders</span>
          </button>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardList className="w-7 h-7 text-white" />
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Lab Order #{order.unid}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm md:text-base">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home size={16} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${collectionTypeColors[order.collection_type]}`}>
                      {order.collection_type?.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  {order.patient_notes && (
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span className="text-sm">Has Patient Notes</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 rounded-full border ${statusColors[order.status]} font-semibold text-sm`}>
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </div>
                <button
                  onClick={downloadInvoice}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
                >
                  <Printer size={18} />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient & Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Patient Details</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <DetailCard 
                    icon={<User className="w-5 h-5" />}
                    label="Full Name"
                    value={order.patient?.details?.full_name}
                    color="blue"
                  />
                  <DetailCard 
                    icon={<Phone className="w-5 h-5" />}
                    label="Phone Number"
                    value={order.patient?.phone_number}
                    color="green"
                  />
                  <DetailCard 
                    icon={<Mail className="w-5 h-5" />}
                    label="Email"
                    value={order.patient?.details?.email}
                    color="purple"
                  />
                  <DetailCard 
                    icon={<Activity className="w-5 h-5" />}
                    label="Gender"
                    value={order.patient?.details?.gender}
                    color="pink"
                  />
                  <DetailCard 
                    icon={<MapPin className="w-5 h-5" />}
                    label="Address"
                    value={order.patient?.details?.address}
                    color="orange"
                  />
                  <DetailCard 
                    icon={<HeartPulse className="w-5 h-5" />}
                    label="Blood Group"
                    value={order.patient?.details?.blood_group}
                    color="red"
                  />
                  <DetailCard 
                    icon={<Calendar className="w-5 h-5" />}
                    label="Date of Birth"
                    value={order.patient?.details?.date_of_birth}
                    color="indigo"
                  />
                  <DetailCard 
                    icon={<Phone className="w-5 h-5" />}
                    label="Emergency Contact"
                    value={order.patient?.details?.emergency_contact}
                    color="amber"
                  />
                </div>
                
                {/* Patient Notes */}
                {order.patient_notes && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Patient Notes</h4>
                        <p className="text-blue-700 dark:text-blue-400">{order.patient_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tests Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                    <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ordered Tests</h2>
                  <span className="ml-auto px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    {items.length} tests
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-200 bg-white dark:bg-gray-800/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                              <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 dark:text-white">{item.test_name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Test ID: {item.unid}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-10">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${itemStatusColors[item.status]}`}>
                              {item.status.replace(/_/g, " ").toUpperCase()}
                            </div>
                            <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                              ₹{item.price?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <select
                          value={item.status}
                          onChange={(e) => updateItemStatus(item.id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[180px]"
                        >
                          {itemStatusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.replace(/_/g, " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disease & Diagnosis Card */}
            {order.prescription?.appointment?.disease_info && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                      <Thermometer className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Disease Information</h2>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${urgencyColors[order.prescription.appointment.disease_info.urgency]}`}>
                      {order.prescription.appointment.disease_info.urgency.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
                    <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                      {order.prescription.appointment.disease_info.summary}
                    </p>
                  </div>

                  {/* Probable Diagnoses */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Probable Diagnoses</h3>
                    <div className="space-y-3">
                      {order.prescription.appointment.disease_info.probable_diagnoses.map((diagnosis, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-800 dark:text-white">{diagnosis.name}</span>
                          </div>
                          <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-400">
                            {(diagnosis.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Tests */}
                  {order.prescription.appointment.disease_info.recommended_lab_tests && (
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Recommended Tests</h3>
                      <div className="flex flex-wrap gap-2">
                        {order.prescription.appointment.disease_info.recommended_lab_tests.map((test, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Specialties */}
                  {order.prescription.appointment.disease_info.recommended_specialties && (
                    <div>
                      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Recommended Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {order.prescription.appointment.disease_info.recommended_specialties.map((specialty, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prescription Card */}
            {order.prescription && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Prescription Details</h2>
                  </div>
                </div>
                <div className="p-6">
                  {/* Special Message */}
                  {order.prescription.special_message && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Special Instructions</h4>
                          <p className="text-amber-700 dark:text-amber-400">{order.prescription.special_message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lab Tests from Prescription */}
                  {order.prescription.lab_tests?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Prescribed Lab Tests</h3>
                      <div className="flex flex-wrap gap-2">
                        {order.prescription.lab_tests.map((test, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                            {test.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medicines */}
                  {order.prescription.medicines?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Prescribed Medicines</h3>
                      <div className="space-y-3">
                        {order.prescription.medicines.map((medicine, idx) => (
                          <div key={idx} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Pill className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  <span className="font-bold text-gray-800 dark:text-white">{medicine.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dose: {medicine.dose}</p>
                                {medicine.notes && (
                                  <p className="text-sm text-gray-500 dark:text-gray-500">Notes: {medicine.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investigations */}
                  {order.prescription.investigations?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Investigations</h3>
                      <div className="flex flex-wrap gap-2">
                        {order.prescription.investigations.map((investigation, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
                            {investigation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lab Notes Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-gray-50 dark:from-gray-900/20 dark:to-gray-800/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lab Notes</h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 h-40 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Write internal lab notes, observations, or special instructions here..."
                />
                <button
                  onClick={updateLabNotes}
                  disabled={saving}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Summary */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Current Status:</span>
                    <div className={`px-4 py-2 rounded-full border ${statusColors[order.status]} font-bold`}>
                      {order.status.replace(/_/g, " ").toUpperCase()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Update Status
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Card */}
            {order.prescription?.doctor && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Doctor Details</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <DetailCard 
                      icon={<User className="w-5 h-5" />}
                      label="Doctor Name"
                      value={order.prescription.doctor.full_name}
                      color="green"
                    />
                    <DetailCard 
                      icon={<BriefcaseMedical className="w-5 h-5" />}
                      label="Specialization"
                      value={order.prescription.doctor.specialization}
                      color="blue"
                    />
                    <DetailCard 
                      icon={<FileText className="w-5 h-5" />}
                      label="Qualification"
                      value={order.prescription.doctor.qualification}
                      color="purple"
                    />
                    <DetailCard 
                      icon={<MapPin className="w-5 h-5" />}
                      label="Clinic/Hospital"
                      value={order.prescription.doctor.clinic_name}
                      color="orange"
                    />
                    <DetailCard 
                      icon={<MapPin className="w-5 h-5" />}
                      label="Clinic Address"
                      value={order.prescription.doctor.clinic_address}
                      color="indigo"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Card */}
            {order.prescription?.appointment && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                      <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Appointment Details</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <DetailCard 
                      icon={<Calendar className="w-5 h-5" />}
                      label="Appointment Date"
                      value={order.prescription.appointment.appointment_date}
                      color="rose"
                    />
                    <DetailCard 
                      icon={<Clock className="w-5 h-5" />}
                      label="Appointment Time"
                      value={formatTime(order.prescription.appointment.appointment_time)}
                      color="indigo"
                    />
                    <DetailCard 
                      icon={<Activity className="w-5 h-5" />}
                      label="Appointment Status"
                      value={order.prescription.appointment.status}
                      color={
                        order.prescription.appointment.status === "approved" 
                          ? "green" 
                          : "yellow"
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Billing Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
                    <DollarSign className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Billing Summary</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Itemized List */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Itemized Charges:</div>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{item.test_name}</span>
                        <span className="font-semibold text-gray-800 dark:text-white">₹{item.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Total Amount</span>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={downloadInvoice}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <FileDown className="w-5 h-5" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Order Metadata Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-gray-800/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Information</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <DetailCard 
                    icon={<ClipboardList className="w-4 h-4" />}
                    label="Order ID"
                    value={order.id}
                    color="gray"
                    small
                  />
                  <DetailCard 
                    icon={<FileText className="w-4 h-4" />}
                    label="Prescription ID"
                    value={order.prescription_id}
                    color="gray"
                    small
                  />
                  <DetailCard 
                    icon={<Home className="w-4 h-4" />}
                    label="Collection Type"
                    value={order.collection_type?.replace(/_/g, " ").toUpperCase()}
                    color="gray"
                    small
                  />
                  {order.scheduled_at && (
                    <DetailCard 
                      icon={<Calendar className="w-4 h-4" />}
                      label="Scheduled At"
                      value={formatDate(order.scheduled_at)}
                      color="gray"
                      small
                    />
                  )}
                  <DetailCard 
                    icon={<Calendar className="w-4 h-4" />}
                    label="Last Updated"
                    value={formatDate(order.updated_at)}
                    color="gray"
                    small
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Enhanced Detail Card Component */
function DetailCard({ icon, label, value, color = "blue", small = false }) {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
    gray: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800",
  };

  return (
    <div className={`flex items-start gap-3 p-${small ? '2' : '3'} rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 bg-white dark:bg-gray-800/50`}>
      <div className={`p-${small ? '1.5' : '2'} rounded-lg ${colorClasses[color]} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${small ? 'text-xs' : 'text-sm'} font-medium text-gray-500 dark:text-gray-400 mb-1`}>{label}</p>
        <p className={`${small ? 'text-sm' : 'font-bold'} text-gray-800 dark:text-gray-200 break-words`}>
          {value || <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>}
        </p>
      </div>
    </div>
  );
}