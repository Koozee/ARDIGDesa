import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import {
  BsSearch,
  BsPencil,
  BsTrash,
  BsDownload,
  BsFileEarmark,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { axiosInstance } from "@/utils/axios";
import DeleteDialog from "@/fragments/DeleteDialog";
import TopNavbarDashboard from "@/fragments/Topnavbar";

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchJudul, setSearchJudul] = useState("");
  const [searchNomor, setSearchNomor] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const openDeleteModal = (doc) => {
    setDocToDelete(doc);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setDocToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/documents/deletedoc/${docToDelete.id}`);
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
      closeDeleteModal();
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal menghapus dokumen");
    } finally {
      setDeleting(false);
    }
  };

  // Helper: tentukan tipe file berdasarkan mime (jika ada) atau ekstensi path_file
  const getFileTypeInfo = (doc) => {
    const mime = doc?.mime_type || doc?.tipe_file || "";
    const path = String(doc?.path_file || "").toLowerCase();

    let label = "FILE";
    let className =
      "bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold";

    const isImage =
      mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|bmp|webp)$/.test(path);
    const isPdf = mime === "application/pdf" || path.endsWith(".pdf");
    const isMsWord = mime === "application/msword" || /\.doc$/.test(path);
    const isDocx =
      mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.docx$/.test(path);

    if (isImage) {
      label = "IMAGE";
      className =
        "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold";
    } else if (isPdf) {
      label = "PDF";
      className =
        "bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold";
    } else if (isMsWord || isDocx) {
      label = "WORD";
      className =
        "bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold";
    }

    return { label, className };
  };

  // Helper: format rincian dokumen dari JSON menjadi format yang mudah dibaca
  const formatRincianDokumen = (rincian) => {
    if (!rincian || typeof rincian !== "object") {
      return String(rincian || "");
    }

    // Fungsi untuk membuat label yang user-friendly secara dinamis
    const createUserFriendlyLabel = (key) => {
      return key
        .replace(/_/g, " ") // Ganti underscore dengan spasi
        .replace(/\b\w/g, l => l.toUpperCase()) // Kapitalisasi huruf pertama setiap kata
        .replace(/\b(rt|rw|nik|kk|akta)\b/gi, (match) => match.toUpperCase()) // Kapitalisasi singkatan
        .replace(/\b(alamat|desa|kelurahan|kecamatan|kabupaten|provinsi)\b/gi, (match) => 
          match.charAt(0).toUpperCase() + match.slice(1).toLowerCase() // Kapitalisasi kata geografis
        );
    };

    // Hitung total field untuk menentukan apakah perlu truncate
    const totalFields = Object.keys(rincian).length;
    const maxFieldsToShow = 2; // Maksimal field yang ditampilkan sebelum truncate

    // Jika field sedikit, tampilkan semua
    if (totalFields <= maxFieldsToShow) {
      return (
        <div className="space-y-1 text-sm">
          {Object.entries(rincian).map(([key, value]) => {
            const label = createUserFriendlyLabel(key);
            return (
              <div key={key} className="flex flex-col">
                <span className="font-medium text-gray-700">{label}:</span>
                <span className="text-gray-600 ml-2">{value || "-"}</span>
              </div>
            );
          })}
        </div>
      );
    }

    // Jika field banyak, tampilkan beberapa saja dengan "..." dan tooltip
    const visibleFields = Object.entries(rincian).slice(0, maxFieldsToShow);
    const hiddenFields = Object.entries(rincian).slice(maxFieldsToShow);
    
    const fullContent = (
      <div className="space-y-1 text-sm">
        {Object.entries(rincian).map(([key, value]) => {
          const label = createUserFriendlyLabel(key);
          return (
            <div key={key} className="flex flex-col">
              <span className="font-medium text-gray-700">{label}:</span>
              <span className="text-gray-600 ml-2">{value || "-"}</span>
            </div>
          );
        })}
      </div>
    );

    return (
      <div className="space-y-1 text-sm" title={fullContent}>
        {visibleFields.map(([key, value]) => {
          const label = createUserFriendlyLabel(key);
          return (
            <div key={key} className="flex flex-col">
              <span className="font-medium text-gray-700">{label}:</span>
              <span className="text-gray-600 ml-2">{value || "-"}</span>
            </div>
          );
        })}
        <div className="text-gray-500 italic text-xs">
          ... dan {hiddenFields.length} rincian lainnya
        </div>
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`/documents/getdocs/category/${id}`, {
        params: {
          page,
          limit,
          searchJudul,
          searchNomor,
          tanggal: filterTanggal,
        },
      })
      .then((res) => {
        const payload = res.data || {};
        setDocs(payload.data || []);
        if (payload.pagination) {
          setTotalPages(payload.pagination.totalPages || 1);
          setTotalItems(payload.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalItems(Array.isArray(payload) ? payload.length : 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Gagal memuat dokumen");
        setLoading(false);
      });
  }, [id, page, limit, searchJudul, searchNomor, filterTanggal]);

  useEffect(() => {
    axiosInstance
      .get(`/category/getcat/${id}`)
      .then((res) => {
        setCategoryName(res.data.nama_kategori);
      })
      .catch(() => setCategoryName("Kategori"));
  }, [id]);

  // Data ditangani via server-side filtering & pagination
  const displayedDocs = docs;

  return (
    <main className="flex min-h-screen">
    <TopNavbarDashboard />
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <DashboardLayout isExpanded={isExpanded}>
        <div className="flex justify-between p-6 w-full">
          <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 cursor-pointer"
            onClick={() => navigate("/upload-document")}
          >
            + Tambah Dokumen Baru
          </button>
        </div>
        <section className="px-6 pb-6">
          {/* Search & Filter Card */}
          <div className="bg-white rounded shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div className="relative">
              <label className="block text-xs mb-1">Cari Judul</label>
              <span className="absolute left-2 top-7 text-gray-400">
                <BsSearch size={14} />
              </span>
              <input
                type="text"
                className="border pl-7 pr-2 py-1 rounded w-40 focus:outline-blue-400"
                placeholder="Judul dokumen"
                value={searchJudul}
                onChange={(e) => {
                  setSearchJudul(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="relative">
              <label className="block text-xs mb-1">Cari Nomor Surat</label>
              <span className="absolute left-2 top-7 text-gray-400">
                <BsSearch size={14} />
              </span>
              <input
                type="text"
                className="border pl-7 pr-2 py-1 rounded w-40 focus:outline-blue-400"
                placeholder="Nomor surat"
                value={searchNomor}
                onChange={(e) => {
                  setSearchNomor(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Filter Tanggal</label>
              <input
                type="date"
                className="border px-2 py-1 rounded focus:outline-blue-400"
                value={filterTanggal}
                onChange={(e) => {
                  setFilterTanggal(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            {(searchJudul || searchNomor || filterTanggal) && (
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                onClick={() => {
                  setSearchJudul("");
                  setSearchNomor("");
                  setFilterTanggal("");
                  setPage(1);
                }}
              >
                Reset
              </button>
            )}
          </div>

          <div className="w-full overflow-x-auto rounded shadow bg-white">
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Memuat data...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <>
              <table className="min-w-[900px] w-full text-sm border-separate border-spacing-0">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Judul
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Nomor Surat
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Tanggal Dokumen
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Path File
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Tipe File
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Tipe Dokumen
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Rincian Dokumen
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Pengunggah
                    </th>
                    <th className="py-3 px-3 border-b text-left whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDocs.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-6 text-gray-400"
                      >
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                  {displayedDocs.map((doc, idx) => (
                    <tr
                      key={doc.id}
                      className={
                        idx % 2 === 0
                          ? "bg-gray-50 hover:bg-blue-50"
                          : "bg-white hover:bg-blue-50"
                      }
                    >
                      <td className="py-2 px-3 border-b align-top truncate">
                        <div className="flex items-center gap-2">
                          <BsFileEarmark className="text-blue-400" />
                          <span>{doc.judul}</span>
                          {String(doc.tipe_dokumen || "").toLowerCase() ===
                          "kartu keluarga" ? (
                            <button
                              className="ml-auto text-xs text-blue-700 underline cursor-pointer"
                              onClick={() =>
                                navigate(`/document/family-member/${doc.id}`)
                              }
                              title="Lihat Anggota Keluarga"
                            >
                              Lihat Anggota
                            </button>
                          ) : (
                            <button
                              className="ml-auto text-xs text-blue-700 underline cursor-pointer"
                              onClick={() => navigate(`/document/detail/${doc.id}`)}
                              title="Lihat Detail Dokumen"
                            >
                              Lihat Detail
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-b align-top max-w-[120px] truncate">
                        {doc.nomor_surat}
                      </td>
                      <td className="py-2 px-3 border-b align-top max-w-[120px] truncate">
                        {doc.tanggal_dokumen}
                      </td>
                      <td
                        className="py-2 px-3 border-b align-top max-w-[220px] truncate"
                        title={doc.path_file}
                      >
                        {doc.path_file ? (
                          <a
                            className="text-blue-600 underline cursor-pointer"
                            href={
                              `${import.meta.env.VITE_URI_API}` +
                              "/files/" +
                              String(doc.path_file || "")
                                .split(/[/\\]/)
                                .pop()
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {String(doc.path_file || "")
                              .split(/[/\\]/)
                              .pop()}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-3 border-b align-top">
                        {(() => {
                          const info = getFileTypeInfo(doc);
                          return (
                            <span className={info.className}>{info.label}</span>
                          );
                        })()}
                      </td>
                      <td className="py-2 px-3 border-b align-top max-w-[120px] truncate">
                        {doc.tipe_dokumen}
                      </td>
                      <td className="py-2 px-3 border-b align-top max-w-[300px]">
                        {doc.rincian_dokumen
                          ? typeof doc.rincian_dokumen === "object"
                            ? formatRincianDokumen(doc.rincian_dokumen)
                            : String(doc.rincian_dokumen)
                          : "-"}
                      </td>
                      <td className="py-2 px-3 border-b items-center gap-1">
                        <span>{doc.User.nama_lengkap}</span>
                      </td>
                      <td className="py-4 px-3 border-b items-center flex gap-2">
                        <button
                          className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                          title="Edit"
                          onClick={() =>
                            navigate(`/upload-document?edit=${doc.id}`)
                          }
                        >
                          <BsPencil />
                        </button>
                        <button
                          className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                          title="Hapus"
                          onClick={() => openDeleteModal(doc)}
                        >
                          <BsTrash />
                        </button>
                        <a
                          className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-700 cursor-pointer"
                          title="Download"
                          href={
                            `${import.meta.env.VITE_URI_API}`.replace(
                              "/api",
                              ""
                            ) +
                            "/files/" +
                            String(doc.path_file || "")
                              .split(/[/\\]/)
                              .pop()
                          }
                          download
                        >
                          <BsDownload />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>
          {!loading && !error && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)} dari {totalItems} dokumen
                {(searchJudul || searchNomor || filterTanggal) && (
                  <span className="ml-2 text-blue-600">
                    {searchJudul && `(Judul: "${searchJudul}")`}
                    {searchNomor && ` (Nomor: "${searchNomor}")`}
                    {filterTanggal && ` (Tanggal: ${filterTanggal})`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    page === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <BsChevronLeft size={16} />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pageNum === page
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    page === totalPages
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
        </section>
      </DashboardLayout>
      <DeleteDialog
        open={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        documentTitle={docToDelete?.judul || ""}
        isLoading={deleting}
      />
    </main>
  );
}
