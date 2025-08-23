import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { axiosInstance } from "@/utils/axios";
import TopNavbarDashboard from "../fragments/Topnavbar";

export default function DocDetail() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState(null);

  // Helper: format rincian dokumen dari JSON menjadi format yang mudah dibaca
  const formatRincianDokumen = (rincian) => {
    if (!rincian || typeof rincian !== "object") {
      return String(rincian || "");
    }

    // Fungsi untuk membuat label yang user-friendly secara dinamis
    const createUserFriendlyLabel = (key) => {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace(/\b(rt|rw|nik|kk|akta)\b/gi, (match) => match.toUpperCase())
        .replace(/\b(alamat|desa|kelurahan|kecamatan|kabupaten|provinsi)\b/gi, (match) =>
          match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
        );
    };

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
  };

  // Helper: buat URL file untuk preview/unduh
  const getFileUrl = (documentData) => {
    const base = `${import.meta.env.VITE_URI_API}`.replace("/api", "");
    const filename = String(documentData?.path_file || "").split(/[/\\]/).pop();
    return `${base}/files/${filename}`;
  };

  // Helper: deteksi tipe file (image/pdf/word/other)
  const getFileType = (documentData) => {
    const mime = documentData?.mime_type || documentData?.tipe_file || "";
    const path = String(documentData?.path_file || "").toLowerCase();

    const isImage = mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|bmp|webp)$/.test(path);
    const isPdf = mime === "application/pdf" || path.endsWith(".pdf");
    const isMsWord = mime === "application/msword" || /\.doc$/.test(path);
    const isDocx =
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.docx$/.test(path);

    if (isImage) return "image";
    if (isPdf) return "pdf";
    if (isMsWord || isDocx) return "word";
    return "other";
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    axiosInstance
      .get(`/documents/getdoc/${documentId}`)
      .then((res) => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Gagal memuat detail dokumen");
        setLoading(false);
      });
  }, [documentId]);

  return (
    <main className="flex min-h-screen bg-gray-50">
      <TopNavbarDashboard />
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <DashboardLayout isExpanded={isExpanded}>
        <div className="flex justify-between w-full mb-4">
          <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded" onClick={() => navigate(-1)}>
            Kembali
          </button>
        </div>
        <article className="bg-white shadow rounded px-6 py-6">
          {loading ? (
            <div className="text-gray-400">Memuat detail...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Detail Dokumen</h1>
                <p className="text-sm text-gray-500">Judul: {doc?.judul}</p>
                <p className="text-sm text-gray-500">Tanggal: {doc?.tanggal_dokumen}</p>
                <p className="text-sm text-gray-500">Pengunggah: {doc?.User?.nama_lengkap}</p>
                <p className="text-sm text-gray-500">Kategori: {doc?.Category?.nama_kategori}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Rincian Dokumen</h2>
                <div className="bg-gray-50 p-3 rounded">
                  {doc?.rincian_dokumen ? (
                    typeof doc.rincian_dokumen === "object" ? (
                      formatRincianDokumen(doc.rincian_dokumen)
                    ) : (
                      <span className="text-sm">{String(doc.rincian_dokumen)}</span>
                    )
                  ) : (
                    <span className="text-gray-400 text-sm">Tidak ada rincian dokumen</span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Preview Dokumen</h2>
                {!doc?.path_file ? (
                  <div className="text-gray-400 text-sm">Tidak ada file untuk dipreview.</div>
                ) : (
                  (() => {
                    const type = getFileType(doc);
                    const url = getFileUrl(doc);
                    if (type === "image") {
                      return (
                        <div className="border rounded p-2">
                          <img
                            src={url}
                            alt="Preview dokumen"
                            className="max-h-96 w-auto object-contain mx-auto"
                          />
                        </div>
                      );
                    }
                    if (type === "pdf") {
                      return (
                        <div className="border rounded">
                          <iframe src={url} title="Preview PDF" className="w-full h-[480px]" />
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Preview tidak tersedia untuk tipe ini.</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Buka/Unduh
                        </a>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </article>
      </DashboardLayout>
    </main>
  );
}


