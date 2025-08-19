import React, { useState, useEffect } from "react";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { BsBoxSeamFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/utils/axios";
import toast from "react-hot-toast";
import DeleteDialog from "@/fragments/DeleteDialog.jsx";
import TopNavbarDashboard from "../fragments/Topnavbar";

export default function ManageCat() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/category/getcats");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal mengambil data kategori";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const loadingToast = toast.loading("Menambahkan kategori...");
    try {
      const response = await axiosInstance.post("/category/createcat", {
        nama_kategori: newCategory,
        deskripsi: newDescription,
        userId: 1,
      });

      // Refresh the categories list
      await fetchCategories();
      setNewCategory("");
      setNewDescription("");
      setShowForm(false);
      toast.dismiss(loadingToast);
      toast.success("Kategori berhasil ditambahkan!");
    } catch (err) {
      console.error("Error adding category:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal menambahkan kategori";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const loadingToast = toast.loading("Menghapus kategori...");
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/category/deletecat/${categoryToDelete.id}`);
      await fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      toast.success("Kategori berhasil dihapus!");
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal menghapus kategori";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleEdit = (cat) => {
    setEditCategoryId(cat.id);
    setEditCategoryName(cat.nama_kategori);
    setEditCategoryDescription(cat.deskripsi || "");
    setShowForm(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Memperbarui kategori...");
    try {
      await axiosInstance.put(`/category/updatecat/${editCategoryId}`, {
        nama_kategori: editCategoryName,
        deskripsi: editCategoryDescription,
      });

      await fetchCategories();
      setEditCategoryId(null);
      setEditCategoryName("");
      setEditCategoryDescription("");
      toast.dismiss(loadingToast);
      toast.success("Kategori berhasil diperbarui!");
    } catch (err) {
      console.error("Error updating category:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal memperbarui kategori";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <DashboardLayout isExpanded={isExpanded}>
          <div className="p-6 w-full">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Memuat data kategori...</div>
            </div>
          </div>
        </DashboardLayout>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
    <TopNavbarDashboard />
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <DashboardLayout isExpanded={isExpanded}>
        <div className="p-6 w-full">
          <h1 className="text-2xl font-bold mb-6">Manajemen Kategori Arsip</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            + Tambah Kategori Baru
          </button>

          {showForm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <form
                onSubmit={handleAddCategory}
                className="bg-white p-6 rounded shadow-md flex flex-col gap-4 min-w-[400px]"
              >
                <h2 className="text-lg font-semibold">Tambah Kategori Baru</h2>
                <input
                  type="text"
                  className="border px-3 py-2 rounded"
                  placeholder="Nama Kategori"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="border px-3 py-2 rounded resize-none"
                  placeholder="Deskripsi Kategori (opsional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows="3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={() => {
                      setShowForm(false);
                      setNewCategory("");
                      setNewDescription("");
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          )}

          {editCategoryId && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <form
                onSubmit={handleEditSubmit}
                className="bg-white p-6 rounded shadow-md flex flex-col gap-4 min-w-[400px]"
              >
                <h2 className="text-lg font-semibold">Edit Kategori</h2>
                <input
                  type="text"
                  className="border px-3 py-2 rounded"
                  placeholder="Nama Kategori"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="border px-3 py-2 rounded resize-none"
                  placeholder="Deskripsi Kategori (opsional)"
                  value={editCategoryDescription}
                  onChange={(e) => setEditCategoryDescription(e.target.value)}
                  rows="3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={() => {
                      setEditCategoryId(null);
                      setEditCategoryName("");
                      setEditCategoryDescription("");
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirmation Modal (reusable) */}
          <DeleteDialog
            open={showDeleteModal}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            documentTitle={categoryToDelete?.nama_kategori || ""}
            isLoading={isDeleting}
            entityLabel="kategori"
          />

          {/* Tampilan grid kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {categories.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                Belum ada kategori yang tersedia
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center bg-white rounded-lg shadow p-6 relative cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/manage-kategori/${cat.id}`)}
                >
                  {/* Icon folder */}
                  <BsBoxSeamFill size={50} />
                  <div className="text-lg font-semibold mt-5 text-center">
                    {cat.nama_kategori}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {cat.deskripsi || "Tidak ada deskripsi"}
                  </div>
                  <div className="text-xs text-gray-400">
                    Dibuat oleh: {cat.User?.nama_lengkap || "Unknown"}
                  </div>
                  <div className="flex gap-2 mt-5 justify-center">
                    <button
                      className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(cat);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(cat);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </main>
  );
}
