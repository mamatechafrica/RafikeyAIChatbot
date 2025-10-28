"use client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { Toaster, toast } from "react-hot-toast";

type Clinic = {
  id: number;
  clinic_name?: string;
  services?: string;
  location?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  google_link?: string;
  source_country?: string;
  phone_combined?: string;
  email_combined?: string;
};

const ClinicsPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [country, setCountry] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [form, setForm] = useState<Omit<Clinic, "id">>({
    clinic_name: "",
    services: "",
    location: "",
    phone: "",
    website: "",
    latitude: undefined,
    longitude: undefined,
    google_link: "",
    source_country: "",
    phone_combined: "",
    email_combined: "",
  });
  const [editForm, setEditForm] = useState<Clinic | null>(null);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [page, limit, country]);

  const fetchClinics = async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      if (country) {
        params.append("country", country);
      }
      const res = await fetch(`https://rafikeybot.onrender.com/clinics/clinics?${params}`);
      if (!res.ok) throw new Error("Failed to fetch clinics");
      const data = await res.json();
      setClinics(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error("Failed to fetch clinics");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      clinic_name: "",
      services: "",
      location: "",
      phone: "",
      website: "",
      latitude: undefined,
      longitude: undefined,
      google_link: "",
      source_country: "",
      phone_combined: "",
      email_combined: "",
    });
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const toastId = toast.loading("Creating clinic...");
    try {
      const res = await fetch("https://rafikeybot.onrender.com/clinics/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create clinic");
      }
      toast.success("Clinic created successfully!", { id: toastId });
      setShowCreateModal(false);
      resetForm();
      fetchClinics();
    } catch (err: any) {
      toast.error("Error: " + err.message, { id: toastId });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setEditLoading(true);
    const toastId = toast.loading("Updating clinic...");
    try {
      const res = await fetch(`https://rafikeybot.onrender.com/clinics/clinics/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_name: editForm.clinic_name,
          services: editForm.services,
          location: editForm.location,
          phone: editForm.phone,
          website: editForm.website,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          google_link: editForm.google_link,
          source_country: editForm.source_country,
          phone_combined: editForm.phone_combined,
          email_combined: editForm.email_combined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update clinic");
      }
      toast.success("Clinic updated successfully!", { id: toastId });
      setShowEditModal(false);
      setEditForm(null);
      fetchClinics();
    } catch (err: any) {
      toast.error("Error: " + err.message, { id: toastId });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    setDeleteLoading(true);
    const toastId = toast.loading("Deleting clinic...");
    try {
      const res = await fetch(`https://rafikeybot.onrender.com/clinics/clinics/${clinicToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to delete clinic");
      }
      toast.success("Clinic deleted successfully!", { id: toastId });
      setShowDeleteModal(false);
      setClinicToDelete(null);
      fetchClinics();
    } catch (err: any) {
      toast.error("Error: " + err.message, { id: toastId });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (clinic: Clinic) => {
    setEditForm(clinic);
    setShowEditModal(true);
  };

  const openDeleteModal = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setShowDeleteModal(true);
  };

  const CreateModal = isClient && showCreateModal
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border p-8 relative max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
            <button className="absolute top-3 right-3 text-3xl font-bold text-gray-400 hover:text-red-500 transition" onClick={() => setShowCreateModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-2xl font-bold mb-6">Create New Clinic</h3>
            <form onSubmit={handleCreateClinic}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Clinic Name*</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} required value={form.clinic_name || ""} onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Services</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.services || ""} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Location</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.location || ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Website</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.website || ""} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Source Country</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.source_country || ""} onChange={e => setForm(f => ({ ...f, source_country: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Latitude</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} type="number" step="any" value={form.latitude ?? ""} onChange={e => setForm(f => ({ ...f, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Longitude</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} type="number" step="any" value={form.longitude ?? ""} onChange={e => setForm(f => ({ ...f, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Google Link</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.google_link || ""} onChange={e => setForm(f => ({ ...f, google_link: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone Combined</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.phone_combined || ""} onChange={e => setForm(f => ({ ...f, phone_combined: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Email Combined</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={form.email_combined || ""} onChange={e => setForm(f => ({ ...f, email_combined: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="px-6 py-2 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500 transition" onClick={() => setShowCreateModal(false)} disabled={formLoading}>Cancel</button>
                <button type="submit" className={`px-6 py-2 rounded-lg font-semibold text-white transition ${formLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:shadow-xl"}`} disabled={formLoading}>{formLoading ? "Creating..." : "Create Clinic"}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;

  const EditModal = isClient && showEditModal && editForm
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border p-8 relative max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
            <button className="absolute top-3 right-3 text-3xl font-bold text-gray-400 hover:text-red-500 transition" onClick={() => setShowEditModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-2xl font-bold mb-6">Edit Clinic</h3>
            <form onSubmit={handleEditClinic}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Clinic Name*</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} required value={editForm.clinic_name || ""} onChange={e => setEditForm(f => f ? { ...f, clinic_name: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Services</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.services || ""} onChange={e => setEditForm(f => f ? { ...f, services: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Location</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.location || ""} onChange={e => setEditForm(f => f ? { ...f, location: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.phone || ""} onChange={e => setEditForm(f => f ? { ...f, phone: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Website</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.website || ""} onChange={e => setEditForm(f => f ? { ...f, website: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Source Country</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.source_country || ""} onChange={e => setEditForm(f => f ? { ...f, source_country: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Latitude</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} type="number" step="any" value={editForm.latitude ?? ""} onChange={e => setEditForm(f => f ? { ...f, latitude: e.target.value ? parseFloat(e.target.value) : undefined } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Longitude</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} type="number" step="any" value={editForm.longitude ?? ""} onChange={e => setEditForm(f => f ? { ...f, longitude: e.target.value ? parseFloat(e.target.value) : undefined } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Google Link</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.google_link || ""} onChange={e => setEditForm(f => f ? { ...f, google_link: e.target.value } : f)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone Combined</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.phone_combined || ""} onChange={e => setEditForm(f => f ? { ...f, phone_combined: e.target.value } : f)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Email Combined</label>
                  <input className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`} value={editForm.email_combined || ""} onChange={e => setEditForm(f => f ? { ...f, email_combined: e.target.value } : f)} />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="px-6 py-2 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500 transition" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</button>
                <button type="submit" className={`px-6 py-2 rounded-lg font-semibold text-white transition ${editLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:shadow-xl"}`} disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;

  const DeleteModal = isClient && showDeleteModal && clinicToDelete
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-8 relative ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
            <button className="absolute top-3 right-3 text-3xl font-bold text-gray-400 hover:text-red-500 transition" onClick={() => setShowDeleteModal(false)} aria-label="Close" disabled={deleteLoading}>&times;</button>
            <h3 className="text-2xl font-bold mb-4">Delete Clinic</h3>
            <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{clinicToDelete.clinic_name}</span>?<br />This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button className="px-6 py-2 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500 transition" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</button>
              <button className={`px-6 py-2 rounded-lg font-semibold text-white transition ${deleteLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`} onClick={handleDeleteClinic} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}>
      <Toaster position="top-center" />
      <Sidebar isDarkMode={isDarkMode} isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "ml-0 sm:ml-16" : "ml-0 sm:ml-64"}`}>
        <Header isDarkMode={isDarkMode} isSidebarCollapsed={isSidebarCollapsed} toggleTheme={toggleTheme} toggleSidebar={toggleSidebar} />
        <main className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
          <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Clinics Management</h1>
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button className="px-6 py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl transition" onClick={() => setShowCreateModal(true)}>Create Clinic</button>
              <div className="flex items-center gap-2">
                <label className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Country:</label>
                <input className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`} value={country} onChange={e => { setPage(1); setCountry(e.target.value); }} placeholder="Filter by country" />
              </div>
              <div className="flex items-center gap-2">
                <label className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Page Size:</label>
                <select className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`} value={limit} onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}>
                  {[5, 10, 20, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}
                </select>
              </div>
            </div>
            <div className={`rounded-2xl shadow-2xl border transition-all duration-300 overflow-hidden ${isDarkMode ? "bg-gray-800/60 border-gray-700/50" : "bg-white/90 border-black/10"}`}>
              {loading ? (
                <div className="p-6 text-center text-gray-400">Loading clinics...</div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : clinics.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No clinics found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={isDarkMode ? "border-b border-gray-700" : "border-b border-gray-200"}>
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Clinic Name</th>
                        <th className="px-4 py-3 font-semibold">Location</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Country</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinics.map((clinic) => (
                        <tr key={clinic.id} className={`border-t hover:bg-purple-100/30 transition ${isDarkMode ? "border-gray-700 hover:bg-purple-900/30" : "border-gray-200"}`}>
                          <td className="px-4 py-3">{clinic.id}</td>
                          <td className="px-4 py-3 font-medium">{clinic.clinic_name || "N/A"}</td>
                          <td className="px-4 py-3">{clinic.location || "N/A"}</td>
                          <td className="px-4 py-3">{clinic.phone || "N/A"}</td>
                          <td className="px-4 py-3">{clinic.source_country || "N/A"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition" onClick={() => openEditModal(clinic)}>Edit</button>
                              <button className="px-3 py-1 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition" onClick={() => openDeleteModal(clinic)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button className={`px-4 py-2 rounded-lg font-semibold transition ${page === 1 ? "bg-gray-400 text-white cursor-not-allowed" : isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"}`} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
              <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Page {page}</span>
              <button className={`px-4 py-2 rounded-lg font-semibold transition ${clinics.length < limit ? "bg-gray-400 text-white cursor-not-allowed" : isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"}`} onClick={() => setPage(p => p + 1)} disabled={clinics.length < limit}>Next</button>
            </div>
          </div>
          {CreateModal}
          {EditModal}
          {DeleteModal}
        </main>
      </div>
    </div>
  );
};

export default ClinicsPage;