import React, { useState, useEffect } from "react";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { useAuth } from "@/hooks/useAuth";
import TopNavbarDashboard from "../fragments/Topnavbar";
import { axiosInstance } from "@/utils/axios";
import { BsFileBarGraph, BsFiles, BsFileText, BsPlusSquare } from "react-icons/bs";

export default function Dashboard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();

  // State untuk data dashboard
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalCategories: 0,
    documentsThisMonth: 0,
    topCategories: [],
  });

  // Fetch data dari database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dokumen (paginated)
        const documentsResponse = await axiosInstance.get("/documents/getdocs");
        const documentsPayload = documentsResponse.data || {};
        const documentsData = documentsPayload.data || [];
        setDocuments(documentsData);

        // Fetch kategori dengan pagination (ambil semua dengan limit besar)
        const categoriesResponse = await axiosInstance.get(
          "/category/getcats?page=1&limit=100"
        );
        const categoriesData = categoriesResponse.data?.categories || [];
        setCategories(categoriesData);

        // Hitung statistik
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const documentsThisMonth = documentsData.filter((doc) => {
          try {
            const docDate = new Date(doc.createdAt);
            if (isNaN(docDate.getTime())) return false;
            return (
              docDate.getMonth() === currentMonth &&
              docDate.getFullYear() === currentYear
            );
          } catch (error) {
            return false;
          }
        }).length;

        // Hitung kategori yang paling banyak digunakan
        const categoryUsage = {};
        documentsData.forEach((doc) => {
          if (doc.Category?.nama_kategori) {
            categoryUsage[doc.Category.nama_kategori] =
              (categoryUsage[doc.Category.nama_kategori] || 0) + 1;
          }
        });

        const topCategories = Object.entries(categoryUsage)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        setStats({
          totalDocuments:
            (documentsPayload.pagination && documentsPayload.pagination.total) ||
            documentsData.length,
          totalCategories: categoriesData.length,
          documentsThisMonth: documentsThisMonth,
          topCategories: topCategories,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen">
        <TopNavbarDashboard />
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <DashboardLayout isExpanded={isExpanded}>
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
        {/* Header Sambutan */}
        <h1 className="text-3xl font-bold mb-6 text-blue-900">
          Selamat Datang, {user?.nama_lengkap || "User"}!
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Kartu Statistik */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="w-full h-32 bg-white shadow rounded-xl flex flex-col items-center justify-center px-8 py-4">
            <div className="flex items-center gap-2">
              <BsFileText className="text-2xl font-bold" />
              <p className="text-sm w-full text-gray-500">
                Total Dokumen Tersimpan
              </p>
            </div>
            <p className="w-full text-2xl text-left font-bold mt-2">
              {stats.totalDocuments}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl flex flex-col items-center justify-center px-8 py-4">
            <div className="flex items-center gap-2">
              <BsFiles className="text-2xl font-bold" />
              <p className="text-sm w-full text-gray-500">
                Total Kategori Tersimpan
              </p>
            </div>
            <p className="w-full text-2xl text-left font-bold mt-2">
              {stats.totalCategories}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl flex flex-col items-center justify-center px-8 py-4">
            <div className="flex items-center gap-2">
              <BsFileBarGraph className="text-2xl font-bold" />
              <p className="text-xs w-full text-gray-500">
                Dokumen Diunggah Bulan Ini
              </p>
            </div>
            <p className="w-full text-2xl text-left font-bold mt-2">
              {stats.documentsThisMonth}
            </p>
          </div>
        </section>

        {/* Tombol Aksi Cepat */}
        <div className="mb-8 flex justify-start gap-4">
          <button
            onClick={() => (window.location.href = "/upload-document")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <BsPlusSquare className="text-2xl leading-none" /> Unggah Dokumen Baru
          </button>
          <button
            onClick={() => (window.location.href = "/manage-kategori")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl leading-none">📁</span> Kelola Kategori
          </button>
        </div>

        {/* Daftar Kategori Tersimpan */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Kategori Tersimpan ({stats.totalCategories})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>Belum ada kategori yang tersimpan</p>
              </div>
            ) : (
              categories.slice(0, 8).map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/manage-kategori/${category.id}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        📁
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {category.nama_kategori}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {category.deskripsi || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {categories.length > 8 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => (window.location.href = "/manage-kategori")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat Semua Kategori ({stats.totalCategories}) →
              </button>
            </div>
          )}
        </div>

        {/* Daftar Aktivitas Terakhir */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Aktivitas Terakhir
          </h2>
          <div className="overflow-x-auto">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada dokumen yang diunggah</p>
              </div>
            ) : (
              <table className="min-w-full text-left border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-2 px-4 font-semibold">Nama Dokumen</th>
                    <th className="py-2 px-4 font-semibold">Kategori</th>
                    <th className="py-2 px-4 font-semibold">Nomor Surat</th>
                    <th className="py-2 px-4 font-semibold">Tanggal Dokumen</th>
                    <th className="py-2 px-4 font-semibold">Diunggah Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.slice(0, 10).map((doc, idx) => (
                    <tr
                      key={doc.id}
                      className="border-t border-gray-100 hover:bg-blue-50"
                    >
                      <td className="py-2 px-4 font-medium">{doc.judul}</td>
                      <td className="py-2 px-4">
                        {doc.Category?.nama_kategori || "Tidak ada kategori"}
                      </td>
                      <td className="py-2 px-4">{doc.nomor_surat || "-"}</td>
                      <td className="py-2 px-4">
                        {doc.tanggal_dokumen
                          ? formatDate(doc.tanggal_dokumen)
                          : "-"}
                      </td>
                      <td className="py-2 px-4">
                        {doc.User?.nama_lengkap || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {documents.length > 10 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => (window.location.href = "/manage-kategori")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat Semua Dokumen →
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </main>
  );
}
