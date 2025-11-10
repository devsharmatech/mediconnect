"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  FileText,
  User,
} from "lucide-react";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchPrescriptions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(doctorFilter !== "all" && { doctor_id: doctorFilter }),
        ...(dateFilter.start && { start_date: dateFilter.start }),
        ...(dateFilter.end && { end_date: dateFilter.end }),
      });

      const res = await fetch(`/api/prescriptions/web?${params}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Failed to load");

      setPrescriptions(data.data.items || []);
      setPagination({
        currentPage: data.data.page,
        totalPages: Math.ceil(data.data.total / data.data.limit),
        totalItems: data.data.total,
        itemsPerPage: data.data.limit,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrescriptions(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, doctorFilter, dateFilter]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    if (!selectedIds.length) return toast.error("No prescriptions selected");
    try {
      const res = await fetch("/api/prescriptions/web/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Deleted successfully");
        setSelectedIds([]);
        fetchPrescriptions(pagination.currentPage);
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= pagination.totalPages) fetchPrescriptions(p);
  };

  return (
    <main className="flex-1 overflow-auto relative z-0">
      <div className="p-4 md:p-4 lg:p-4 bg-transparent">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="min-h-screen bg-gradient-to-br from-gray-50 rounded-2xl to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h4 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Prescription Management
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Showing {pagination.totalItems} prescriptions
              </p>
            </motion.div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by diagnosis or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) =>
                      setDateFilter((p) => ({ ...p, start: e.target.value }))
                    }
                    className="px-3 py-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) =>
                      setDateFilter((p) => ({ ...p, end: e.target.value }))
                    }
                    className="px-3 py-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchPrescriptions(1)}
                    className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                  >
                    <Filter size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchPrescriptions(pagination.currentPage)}
                    className="p-2 border rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                  >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  </motion.button>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div className="mt-4 flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {selectedIds.length} selected
                  </span>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-12">
                  <RefreshCw size={32} className="animate-spin text-gray-700 dark:text-gray-200" />
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No prescriptions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              setSelectedIds(
                                e.target.checked
                                  ? prescriptions.map((p) => p.id)
                                  : []
                              )
                            }
                            checked={
                              prescriptions.length > 0 &&
                              selectedIds.length === prescriptions.length
                            }
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-3 text-left">Prescription ID</th>
                        <th className="px-6 py-3 text-left">Doctor</th>
                        <th className="px-6 py-3 text-left">Patient</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => toggleSelect(p.id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{p.id}</td>
                          <td className="px-6 py-4">{p.doctor_id}</td>
                          <td className="px-6 py-4">{p.patient_id}</td>
                          <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setViewPrescription(p)}
                              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-full max-w-md"
            >
              <div className="text-center">
                <AlertTriangle className="w-10 h-10 mx-auto text-red-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Delete {selectedIds.length} prescription(s)? This cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="px-5 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewPrescription && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} /> Prescription Details
                </h3>
                <button onClick={() => setViewPrescription(null)}>
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-3 text-sm text-gray-800 dark:text-gray-200">
                <p><strong>ID:</strong> {viewPrescription.id}</p>
                <p><strong>Doctor:</strong> {viewPrescription.doctor_id}</p>
                <p><strong>Patient:</strong> {viewPrescription.patient_id}</p>
                <p><strong>Diagnosis:</strong> {viewPrescription.diagnosis || "N/A"}</p>
                <p><strong>Notes:</strong> {viewPrescription.notes || "N/A"}</p>
                <p><strong>Date:</strong> {new Date(viewPrescription.created_at).toLocaleString()}</p>
              </div>
              <div className="p-4 border-t dark:border-gray-700 text-right">
                <button
                  onClick={() => setViewPrescription(null)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
