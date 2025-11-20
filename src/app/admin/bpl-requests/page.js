"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  X,
} from "lucide-react";

const STATUS_OPTIONS = ["pending", "approved", "rejected"];

function formatDate(dt) {
  if (!dt) return "N/A";
  try {
    return new Date(dt).toLocaleDateString();
  } catch {
    return dt;
  }
}

/* -------------------- View Modal -------------------- */
function BplViewModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const docs = [
    { label: "Aadhaar", url: request.aadhaar_card_url },
    { label: "Ration Card", url: request.ration_card_url },
    { label: "Income Certificate", url: request.income_certificate_url },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 overflow-auto">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BPL Request Details</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Request ID: {request.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow label="Name" value={request.name} />
            <InfoRow label="DOB" value={formatDate(request.dob)} />
            <InfoRow label="Gender" value={request.gender} />
            <InfoRow label="Mobile" value={request.mobile} />
            <InfoRow label="Aadhaar No" value={request.aadhaar_no} />
            <InfoRow label="Ration Card No" value={request.ration_card_no} />
            <InfoRow label="Household Size" value={String(request.household_size || "N/A")} />
            <InfoRow label="Head of Household" value={request.head_of_household} />
            <InfoRow label="Monthly Income" value={request.monthly_income ? `₹${request.monthly_income}` : "N/A"} />
            <InfoRow label="Employment Status" value={request.employment_status} />
            <InfoRow label="Government Benefits" value={request.government_benefits} />
            <InfoRow label="Disability" value={request.disability ? "Yes" : "No"} />
            <InfoRow label="Status" value={request.status} />
            <InfoRow label="Submitted" value={formatDate(request.created_at)} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {docs.map((d) => (
                <div key={d.label} className="p-3 border rounded-lg bg-white dark:bg-gray-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="text-xs text-gray-500">{d.url ? "Uploaded" : "Pending"}</div>
                  </div>
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">View</a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-xs text-gray-500 w-36">{label}</div>
      <div className="text-sm text-gray-900 dark:text-white">{value || "N/A"}</div>
    </div>
  );
}

/* -------------------- Main Page Component -------------------- */
export default function BplRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Fetch paginated admin list
  const fetchRequests = async (page = 1, limit = pagination.limit, search = searchTerm, status = statusFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/bpl-requests?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch");

      const data = json.data || json.data?.data || json.data?.labs || json.data;
      
      let list = [];
      let total = 0;
      let pageResp = page;
      let limitResp = limit;

      if (Array.isArray(json.data)) {
        list = json.data;
        total = json.meta?.total || json.count || json.total || json?.data?.length || 0;
      } else if (json.data && Array.isArray(json.data.data)) {
        list = json.data.data;
        total = json.data.meta?.total || json.data.count || 0;
        pageResp = json.data.meta?.page || page;
        limitResp = json.data.meta?.limit || limit;
      } else if (Array.isArray(data)) {
        list = data;
        total = json.meta?.total || json.count || 0;
      } else if (json.data && json.data.length >= 0) {
        list = json.data;
        total = json.meta?.total || json.count || 0;
      } else {
        // fallback
        list = json.data || [];
        total = json.meta?.total || json.count || (Array.isArray(list) ? list.length : 0);
      }

      const totalPages = Math.max(1, Math.ceil((total || 0) / limitResp));

      setRequests(list);
      setPagination({ page: pageResp, limit: limitResp, total, totalPages });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((p) => ({ ...p, page: newPage }));
    fetchRequests(newPage, pagination.limit);
  };

  useEffect(() => {
    fetchRequests(1, pagination.limit);
  }, [pagination.limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchRequests(1, pagination.limit, searchTerm, statusFilter);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm, statusFilter]);

  const toggleSelect = (id) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const selectAllVisible = () => {
    const ids = requests.map((r) => r.id);
    setSelectedIds(ids);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkDelete = async () => {
    if (!selectedIds.length) return toast.error("No selected requests");
    if (!confirm(`Delete ${selectedIds.length} selected requests?`)) return;

    try {
      const res = await fetch("/api/admin/bpl-requests/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Bulk delete failed");
      toast.success("Deleted successfully");
      setSelectedIds([]);
      fetchRequests(pagination.page);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete");
    }
  };

  const updateStatus = async (request_id, status) => {
    if (!["approved", "rejected", "pending"].includes(status)) return;
    try {
      const res = await fetch("/api/admin/bpl-requests/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Status update failed");
      toast.success("Status updated successfully");
      fetchRequests(pagination.page);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (!selectedIds.length) return toast.error("No selected requests");
    try {
      await Promise.all(selectedIds.map((id) => updateStatus(id, status)));
      setSelectedIds([]);
      fetchRequests(pagination.page);
    } catch (err) {
      // updateStatus shows toast on fail
    }
  };

  const openView = async (id) => {
    try {
      const res = await fetch(`/api/admin/bpl-requests/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch");
      setDetailItem(json.data || json.data?.data || json.data?.result || json);
      setViewOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    }
  };

  return (
    <>
      <main className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">BPL Requests</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage BPL requests — view, approve, reject, and delete.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  placeholder="Search name, mobile, aadhaar..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-gray-500 focus:border-transparent transition-all"
              >
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button 
                onClick={() => fetchRequests(1)} 
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />
                  <div>
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{selectedIds.length} requests selected</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-400">You can perform bulk actions on selected requests</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => bulkUpdateStatus("approved")} 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Approve Selected
                  </button>
                  <button 
                    onClick={() => bulkUpdateStatus("pending")} 
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Set Pending
                  </button>
                  <button 
                    onClick={() => bulkUpdateStatus("rejected")} 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Reject Selected
                  </button>
                  <button 
                    onClick={bulkDelete} 
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Delete Selected
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 uppercase">
                <tr>
                  <th className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length > 0 && selectedIds.length === requests.length} 
                      onChange={(e) => e.target.checked ? selectAllVisible() : clearSelection()} 
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                  </th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Aadhaar / Ration</th>
                  <th className="p-4 font-medium">Household</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex justify-center">
                        <RefreshCw className="animate-spin mr-2" size={18} />
                        Loading requests...
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(r.id)} 
                          onChange={() => toggleSelect(r.id)} 
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">{r.name || "—"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">User: {r.user_id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 dark:text-white">{r.mobile || "—"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.dob)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 dark:text-white">{r.aadhaar_no || "—"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{r.ration_card_no || "—"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 dark:text-white">Household: {r.household_size ?? "—"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Head: {r.head_of_household || "—"}</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${r.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : r.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"}`}>
                          {r.status === "approved" && <CheckCircle size={12} />}
                          {r.status === "rejected" && <XCircle size={12} />}
                          {r.status || "pending"}
                        </div>
                        <div className="mt-2">
                          <select 
                            value={r.status || "pending"} 
                            onChange={(e) => updateStatus(r.id, e.target.value)} 
                            className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-gray-500 transition-all"
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            title="View Details" 
                            onClick={() => openView(r.id)} 
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            title="Delete" 
                            onClick={() => toggleSelect(r.id)} 
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                <select 
                  value={pagination.limit} 
                  onChange={(e) => setPagination((p) => ({ ...p, limit: parseInt(e.target.value), page: 1 }))} 
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-gray-500 transition-all"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={pagination.page === 1} 
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)} 
                  disabled={pagination.page === 1} 
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium">
                  {pagination.page} / {pagination.totalPages}
                </div>

                <button 
                  onClick={() => handlePageChange(pagination.page + 1)} 
                  disabled={pagination.page === pagination.totalPages} 
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.totalPages)} 
                  disabled={pagination.page === pagination.totalPages} 
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BplViewModal isOpen={viewOpen} onClose={() => setViewOpen(false)} request={detailItem} />
    </>
  );
}