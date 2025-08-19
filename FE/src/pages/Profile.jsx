import React, { useState } from "react";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { useAuth } from "@/hooks/useAuth";
import TopNavbarDashboard from "../fragments/Topnavbar";
import { axiosInstance } from "@/utils/axios";

export default function Profile() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("biodata");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, isLoading: authLoading, updateUser } = useAuth();

  // State untuk form edit
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    password: "",
    confirmPassword: "",
  });

  console.log(user);
  // Data profil user dari auth
  const profileData = {
    namalengkap: user?.nama_lengkap,
    nomor_telepon: user?.nomor_telepon,
    username: user?.username,
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validasi password
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      setIsLoading(false);
      return;
    }

    // Validasi password minimal 6 karakter
    if (editForm.password && editForm.password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        username: editForm.username,
      };

      // Hanya kirim password jika diisi
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const response = await axiosInstance.put(
        `user/updateuser/${user.id}`,
        updateData
      );

      if (response.status === 200) {
        setSuccess("Profil berhasil diperbarui!");

        // Update user data di context
        if (updateUser) {
          updateUser({
            ...user,
            username: editForm.username,
          });
        }

        // Reset form
        setEditForm({
          username: editForm.username,
          password: "",
          confirmPassword: "",
        });

        // Tutup dialog setelah 2 detik
        setTimeout(() => {
          setEditDialogOpen(false);
          setSuccess("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form ketika dialog dibuka
  const handleOpenEditDialog = () => {
    setEditForm({
      username: user?.username || "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("");
    setEditDialogOpen(true);
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
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <DashboardLayout isExpanded={isExpanded}>
        <TopNavbarDashboard />

        {/* Header Sambutan */}
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Profil Saya</h1>
        <p className="text-gray-600 mb-6">Kelola informasi profil Anda</p>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Profil
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b border-gray-200 mb-6">
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "biodata"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("biodata")}
            >
              Biodata
            </button>
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "username"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("username")}
            >
              Username & Password
            </button>
          </div>
          {/* Tab Content */}
          {activeTab === "biodata" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900">
                        {profileData?.namalengkap || "Belum diisi"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Jabatan
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900">
                        {user?.jabatan || "Belum diisi"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900 capitalize">
                        {user?.role || "Belum diisi"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900">
                        {user?.nomor_telepon || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      ID User
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900 font-mono">
                        {user?.id || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Username & Password
                </h3>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={handleOpenEditDialog}
                >
                  Edit Profil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 font-mono">
                      {profileData?.username || "Belum diisi"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900">••••••••</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Informasi Keamanan
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Untuk keamanan akun Anda, password tidak ditampilkan.
                        Hubungi administrator untuk reset password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Modal Edit Profile */}
      {editDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Username & Password
              </h3>
              <button
                onClick={() => setEditDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru (opsional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editForm.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
