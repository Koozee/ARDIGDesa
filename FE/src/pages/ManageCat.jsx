import React, { useState, useEffect } from "react";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { BsBoxSeamFill } from "react-icons/bs";
import { BsSearch, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  // Search and pagination states from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);

  // Get values from URL params
  const searchTerm = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;

  // Local state for search input (not synced with URL until search is submitted)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const navigate = useNavigate();

  // Update URL params
  const updateURLParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams };

    // Remove empty values
    Object.keys(updated).forEach((key) => {
      if (!updated[key] || updated[key] === "1") {
        delete updated[key];
      }
    });

    setSearchParams(updated);
  };

  // Fetch categories from database with search and pagination
  const fetchCategories = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(search && { search: search.trim() }),
      });

      const response = await axiosInstance.get(`/category/getcats?${params}`);

      setCategories(response.data.categories);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalCount);
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

  // Load categories on component mount and when URL params change
  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // Sync URL params on mount if they don't exist
  useEffect(() => {
    if (!searchParams.get("page") && !searchParams.get("search")) {
      // Set default page to 1 if no params exist
      setSearchParams({ page: "1" });
    }
  }, []);

  // Sync localSearchTerm with searchTerm from URL params
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    updateURLParams({ search: localSearchTerm.trim(), page: "1" });
  };

  // Handle page change
  const handlePageChange = (page) => {
    updateURLParams({ page: page.toString() });
  };

  // Handle search input change - only update local state, not URL
  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchTerm("");
    updateURLParams({ search: "", page: "1" });
  };

  // Check if search is in progress (removed debounced search)
  const isSearching = false;

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
      await fetchCategories(currentPage, searchTerm);
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
      await fetchCategories(currentPage, searchTerm);
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

      await fetchCategories(currentPage, searchTerm);
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

          {/* Current Filters Info */}
          {(searchTerm || currentPage > 1) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Filter Aktif:</span>
                {searchTerm && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <BsSearch size={12} />"{searchTerm}"
                  </span>
                )}
                {currentPage > 1 && (
                  <span className="ml-2">Halaman {currentPage}</span>
                )}
                <button
                  onClick={() => updateURLParams({ search: "", page: "1" })}
                  className="ml-3 text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  Reset Semua Filter
                </button>
              </div>
            </div>
          )}

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

          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ketik nama kategori, lalu tekan Enter atau klik Cari"
                  value={localSearchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cari
              </button>
              {localSearchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              )}
            </form>

            {/* Search Status Indicator */}
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <BsSearch size={14} />
                  Mencari: "{searchTerm}"
                </span>
              </div>
            )}
          </div>

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
                {searchTerm
                  ? `Tidak ada kategori yang ditemukan untuk "${searchTerm}"`
                  : "Belum ada kategori yang tersedia"}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, totalCount)} dari {totalCount}{" "}
                kategori
                {searchTerm && (
                  <span className="ml-2 text-blue-600">
                    (Filter: "{searchTerm}")
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <BsChevronLeft size={16} />
                  Sebelumnya
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Selanjutnya
                  <BsChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </main>
  );
}
