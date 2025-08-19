import React, { useState, useEffect } from "react";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { useAuth } from "@/hooks/useAuth";
import TopNavbarDashboard from "@/fragments/Topnavbar";
import { axiosInstance } from "@/utils/axios";
import AddUserDialog from "@/fragments/AddUserDialog";
import EditUserDialog from "@/fragments/EditUserDialog";
import DeleteDialog from "@/fragments/DeleteDialog.jsx";
import UserTable from "@/fragments/UserTable";
import toast from "react-hot-toast";

export default function ManageUser() {
  const [isExpanded, setIsExpanded] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, isLoading: authLoading, updateUser } = useAuth();

  // State untuk daftar user
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State untuk dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State untuk form
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    password: "",
    confirmPassword: "",
    nama_lengkap: "",
    nomor_telepon: "",
    jabatan: "",
    role: "user",
  });

  // Fetch users
  const fetchUsers = async () => {
    if (user?.role !== "superadmin") return;

    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get("/user/getusers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal mengambil data user";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [user]);

  // Handle input change untuk form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null, // Reset ID field
      username: "",
      password: "",
      confirmPassword: "",
      nama_lengkap: "",
      nomor_telepon: "",
      jabatan: "",
      role: "user",
    });
    setError("");
    setSuccess("");
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      const errorMessage = "Password dan konfirmasi password tidak cocok";
      toast.error(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      const errorMessage = "Password minimal 6 karakter";
      toast.error(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    const loadingToast = toast.loading("Menambahkan user...");
    try {
      const response = await axiosInstance.post("/user/createuser", {
        username: formData.username,
        password: formData.password,
        nama_lengkap: formData.nama_lengkap,
        nomor_telepon: formData.nomor_telepon,
        jabatan: formData.jabatan,
        role: formData.role,
      });

      toast.dismiss(loadingToast);
      toast.success("User berhasil ditambahkan!");
      setSuccess("User berhasil ditambahkan!");
      setShowAddDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menambahkan user";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    let loadingToast = null;

    try {
      const updateData = {
        username: formData.username,
        nama_lengkap: formData.nama_lengkap,
        nomor_telepon: formData.nomor_telepon,
        jabatan: formData.jabatan,
        role: formData.role,
      };

      // Hanya kirim password jika diisi
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          const errorMessage = "Password dan konfirmasi password tidak cocok";
          toast.error(errorMessage);
          setError(errorMessage);
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          const errorMessage = "Password minimal 6 karakter";
          toast.error(errorMessage);
          setError(errorMessage);
          setIsLoading(false);
          return;
        }
        updateData.password = formData.password;
      }

      loadingToast = toast.loading("Memperbarui user...");
      const response = await axiosInstance.put(
        `/user/updateuser/${selectedUser.id}`,
        updateData
      );

      toast.dismiss(loadingToast);
      toast.success("User berhasil diperbarui!");
      setSuccess("User berhasil diperbarui!");
      setShowEditDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui user";
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    const loadingToast = toast.loading("Menghapus user...");
    try {
      await axiosInstance.delete(`/user/deleteuser/${selectedUser.id}`);
      toast.dismiss(loadingToast);
      toast.success("User berhasil dihapus!");
      setSuccess("User berhasil dihapus!");
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus user";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id, // Add user ID to formData
      username: user.username,
      password: "",
      confirmPassword: "",
      nama_lengkap: user.nama_lengkap,
      nomor_telepon: user.nomor_telepon || "",
      jabatan: user.jabatan || "",
      role: user.role,
    });
    setShowEditDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  // Loading state
  if (authLoading) {
    return (
      <main className="flex min-h-screen">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <DashboardLayout isExpanded={isExpanded}>
          <TopNavbarDashboard />
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <TopNavbarDashboard />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Manajemen User
            </h1>
            <p className="text-gray-600">Kelola data pengguna sistem</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Content */}
          <div>
            {/* Header dengan tombol tambah */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Daftar User
              </h2>
              {user?.role === "superadmin" && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddDialog(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Tambah User
                </button>
              )}
            </div>

            {/* Tabel User */}
            <UserTable
              users={users}
              loadingUsers={loadingUsers}
              currentUser={user}
              onEditUser={openEditDialog}
              onDeleteUser={openDeleteDialog}
            />
          </div>
        </div>

        {/* Dialog Components */}
        <AddUserDialog
          showAddDialog={showAddDialog}
          setShowAddDialog={setShowAddDialog}
          formData={formData}
          handleInputChange={handleInputChange}
          handleAddUser={handleAddUser}
          isLoading={isLoading}
        />

        <EditUserDialog
          showEditDialog={showEditDialog}
          setShowEditDialog={setShowEditDialog}
          formData={formData}
          handleInputChange={handleInputChange}
          handleEditUser={handleEditUser}
          isLoading={isLoading}
        />

        <DeleteDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteUser}
          documentTitle={
            selectedUser?.nama_lengkap || selectedUser?.username || ""
          }
          isLoading={isLoading}
          entityLabel="user"
        />
      </DashboardLayout>
    </main>
  );
}
