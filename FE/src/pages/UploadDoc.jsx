import React, { useEffect, useState } from "react";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { axiosInstance } from "@/utils/axios";
import { authService } from "@/utils/auth";
import TopNavbarDashboard from "../fragments/Topnavbar";

const DOC_TYPES = [
  { value: "", label: "Pilih jenis dokumen...", defaultCategoryId: "" },

  // --- Kependudukan ---
  {
    value: "Kartu Keluarga",
    label: "Kartu Keluarga (KK)",
    defaultCategoryId: "kependudukan",
  },
  {
    value: "Kartu Tanda Penduduk",
    label: "Kartu Tanda Penduduk (KTP)",
    defaultCategoryId: "kependudukan",
  },
  {
    value: "Akta Kelahiran",
    label: "Akta Kelahiran",
    defaultCategoryId: "kependudukan",
  },
  {
    value: "Akta Kematian",
    label: "Akta Kematian",
    defaultCategoryId: "kependudukan",
  },
  {
    value: "Surat Pindah / Datang",
    label: "Surat Pindah / Datang",
    defaultCategoryId: "kependudukan",
  },

  // --- Surat Pelayanan ---
  {
    value: "Surat Pengantar",
    label: "Surat Pengantar",
    defaultCategoryId: "keuangan",
  },
  {
    value: "Surat Keterangan Usaha",
    label: "Surat Keterangan Usaha (SKU)",
    defaultCategoryId: "keuangan",
  },
  {
    value: "Surat Keterangan Tidak Mampu",
    label: "Surat Keterangan Tidak Mampu (SKTM)",
    defaultCategoryId: "keuangan",
  },

  // --- Surat Dinas ---
  {
    value: "Surat Masuk",
    label: "Surat Masuk (Undangan, Edaran, dll)",
    defaultCategoryId: "umum",
  },

  // --- Lainnya ---
  {
    value: "Dokumen Lainnya",
    label: "Dokumen Lainnya",
    defaultCategoryId: "lainnya",
  },
];

// Kategori diambil dari database via API

const GENDER_OPTIONS = [
  { value: "", label: "Pilih..." },
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

const initialMember = () => ({
  nik: "",
  nama_lengkap: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  status_hubungan: "",
  pendidikan_akhir: "",
  agama: "",
  status: "",
  pekerjaan: "",
  nama_ayah: "",
  nama_ibu: "",
});

export default function UploadDoc() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [judul, setJudul] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggalDokumen, setTanggalDokumen] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [anggota, setAnggota] = useState([initialMember()]);
  const [metadataItems, setMetadataItems] = useState([{ key: "", value: "" }]);
  const [isScanning, setIsScanning] = useState(false);
  const [useOCR, setUseOCR] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("none"); // 'image' | 'pdf' | 'word' | 'other' | 'none'

  const addMember = () => setAnggota((prev) => [...prev, initialMember()]);
  const removeMember = (index) =>
    setAnggota((prev) => prev.filter((_, i) => i !== index));
  const updateMember = (index, field, value) => {
    setAnggota((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };
  const addMetadataItem = () =>
    setMetadataItems((prev) => [
      ...prev,
      { jenis_informasi: "", isi_informasi: "" },
    ]);
  const removeMetadataItem = (index) =>
    setMetadataItems((prev) => prev.filter((_, i) => i !== index));
  const updateMetadataItem = (index, field, value) => {
    setMetadataItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };
  const validateMembers = () => {
    if (docType !== "Kartu Keluarga") return "";
    for (let i = 0; i < anggota.length; i += 1) {
      const m = anggota[i];
      if (!m.nik || String(m.nik).replace(/\D/g, "").length !== 16) {
        return `Baris ${i + 1}: NIK harus 16 digit`;
      }
      if (!m.nama_lengkap) return `Baris ${i + 1}: Nama lengkap wajib`;
    }
    return "";
  };

  const handleScanOCR = async () => {
    try {
      setError("");
      setSuccess("");
      if (!selectedFile) {
        setError("Silakan pilih file dokumen terlebih dahulu untuk discan.");
        return;
      }
      if (previewType !== "image") {
        setError("Scan OCR hanya tersedia untuk file gambar (JPG/PNG).");
        return;
      }
      setIsScanning(true);
      const fd = new FormData();
      fd.append("documentFile", selectedFile);
      const res = await axiosInstance.post("/documents/scan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const rincian = res?.data?.data?.rincian_dokumen || {};
      const items = Object.entries(rincian).map(
        ([jenis_informasi, isi_informasi]) => ({
          jenis_informasi,
          isi_informasi: String(isi_informasi ?? ""),
        })
      );
      setMetadataItems(
        items.length ? items : [{ jenis_informasi: "", isi_informasi: "" }]
      );
      setSuccess(
        "Hasil OCR berhasil dimuat ke rincian dokumen. Silakan review/ubah bila perlu."
      );
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Gagal melakukan OCR. Coba lagi.";
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Fungsi untuk fetch kategori dari API dengan pagination
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setError("");
      // Menggunakan endpoint yang sudah ada pagination, ambil semua kategori dengan limit besar
      const res = await axiosInstance.get("/category/getcats?page=1&limit=100");
      // Ambil data dari response yang sudah ada pagination
      const allCategories = res.data?.categories || [];
      setCategories(allCategories);
      // Jangan langsung set filteredCategories, biarkan kosong sampai user focus
    } catch (err) {
      setError("Gagal memuat kategori. Silakan coba lagi.");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Ambil kategori dari API dengan pagination
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const categoryContainer = document.querySelector(
        "[data-category-container]"
      );
      if (categoryContainer && !categoryContainer.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync searchInput with selected category
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find((cat) => cat.id == categoryId);
      if (selectedCategory) {
        setSearchInput(selectedCategory.nama_kategori);
      }
    }
  }, [categoryId, categories]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
    setSuccess("");
    // Reset preview
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (_) {}
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      const lowerName = String(file.name || "").toLowerCase();
      if (file.type.startsWith("image/")) {
        setPreviewType("image");
      } else if (
        file.type === "application/pdf" ||
        lowerName.endsWith(".pdf")
      ) {
        setPreviewType("pdf");
      } else if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        lowerName.endsWith(".doc") ||
        lowerName.endsWith(".docx")
      ) {
        setPreviewType("word");
      } else {
        setPreviewType("other");
      }
    } else {
      setPreviewUrl("");
      setPreviewType("none");
    }
  };

  // Cleanup object URL on unmount/change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (_) {}
      }
    };
  }, [previewUrl]);

  const handleDocTypeChange = (e) => {
    const newDocType = e.target.value;
    setDocType(newDocType);

    // Cari jenis dokumen yang dipilih dari array DOC_TYPES
    const selectedDoc = DOC_TYPES.find((doc) => doc.value === newDocType);

    // Jika ditemukan, atur kategori default-nya berdasarkan nama kategori dari DB
    if (selectedDoc && categories.length > 0) {
      const defaultCatNameLower = String(
        selectedDoc.defaultCategoryId
      ).toLowerCase();
      const matched = categories.find(
        (c) =>
          String(c.nama_kategori || "").toLowerCase() === defaultCatNameLower
      );
      setCategoryId(matched ? String(matched.id) : "");
    }

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docType) {
      setError("Silakan pilih jenis dokumen.");
      setSuccess("");
      return;
    }
    if (!selectedFile) {
      setError("Silakan pilih file dokumen.");
      setSuccess("");
      return;
    }
    if (!judul.trim()) {
      setError("Judul dokumen wajib diisi.");
      setSuccess("");
      return;
    }
    if (!categoryId) {
      setError("Silakan pilih kategori dokumen.");
      setSuccess("");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("documentFile", selectedFile);
      fd.append("judul", judul);
      if (nomorSurat) fd.append("nomor_surat", nomorSurat);
      if (tanggalDokumen) fd.append("tanggal_dokumen", tanggalDokumen);
      fd.append("tipe_dokumen", docType);
      fd.append("categoryId", categoryId);
      const userId = authService.getUserId();
      if (userId) fd.append("userId", userId);

      // Jika KK, sertakan anggota_keluarga
      if (docType === "Kartu Keluarga") {
        const memberErr = validateMembers();
        if (memberErr) {
          setError(memberErr);
          setSuccess("");
          return;
        }
        fd.append("anggota_keluarga", JSON.stringify(anggota));
      }

      // Rincian dokumen bebas (jenis_informasi -> isi_informasi)
      const rincianObj = {};
      metadataItems.forEach((it) => {
        const k = String(it.jenis_informasi || "").trim();
        const v = String(it.isi_informasi || "").trim();
        if (k) rincianObj[k] = v;
      });
      if (Object.keys(rincianObj).length > 0) {
        fd.append("rincian_dokumen", JSON.stringify(rincianObj));
      }

      await axiosInstance.post("/documents/createdoc", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Dokumen berhasil diunggah!");
      setError("");
      // Reset form
      setSelectedFile(null);
      setDocType("");
      setCategoryId("");
      setJudul("");
      setNomorSurat("");
      setTanggalDokumen("");
      setMetadataItems([{ jenis_informasi: "", isi_informasi: "" }]);
      setAnggota([initialMember()]);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengunggah dokumen.";
      setError(msg);
      setSuccess("");
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50">
      <TopNavbarDashboard />
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <DashboardLayout isExpanded={isExpanded}>
        <article className="bg-white shadow-lg rounded-xl px-6 py-8 w-full mx-auto mt-10 border border-gray-100">
          <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-2 text-blue-700">
            Unggah Dokumen
          </h1>
          <h3 className="text-gray-500 text-center mb-6 text-base">
            Silakan unggah dokumen yang ingin dikelola (KTP, KK, surat
            keterangan, dll)
          </h3>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4"
          >
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Judul Dokumen
            </label>
            <input
              id="judul"
              type="text"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-blue-50"
              placeholder="Masukkan judul dokumen"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Surat (opsional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-blue-50"
                  placeholder="Masukkan nomor surat"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-blue-50"
                  value={tanggalDokumen}
                  onChange={(e) => setTanggalDokumen(e.target.value)}
                />
              </div>
            </div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori Dokumen
            </label>
            <select
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-blue-50"
              value={docType}
              onChange={handleDocTypeChange}
              required
            >
              {DOC_TYPES.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  disabled={type.value === ""}
                >
                  {type.label}
                </option>
              ))}
            </select>

            {/* Combobox Kategori - Input + Dropdown */}
            <div className="w-full relative" data-category-container>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Dokumen
              </label>

              {/* Input Text + Dropdown */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    isLoadingCategories
                      ? "Memuat kategori..."
                      : "Ketik nama kategori atau pilih dari dropdown..."
                  }
                  className="w-full px-4 py-2 pr-10 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-blue-50"
                  value={searchInput}
                  onChange={(e) => {
                    const searchTerm = e.target.value;
                    setSearchInput(searchTerm);

                    if (searchTerm) {
                      // Filter kategori berdasarkan nama
                      const filtered = categories.filter((cat) =>
                        cat.nama_kategori
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      );
                      setFilteredCategories(filtered);
                      setShowDropdown(true);
                      // Clear selected category if search doesn't match
                      if (
                        !filtered.find(
                          (cat) => cat.nama_kategori === searchTerm
                        )
                      ) {
                        setCategoryId("");
                      }
                    } else {
                      // Jika search kosong, tampilkan semua kategori
                      setFilteredCategories(categories);
                      setShowDropdown(true);
                      setCategoryId("");
                    }
                  }}
                  onFocus={() => {
                    // Show dropdown when focused
                    setFilteredCategories(categories);
                    setShowDropdown(true);
                  }}
                  required
                />

                {/* Dropdown Arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Dropdown Options */}
              {showDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                        categoryId == cat.id
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        setCategoryId(cat.id);
                        setSearchInput(cat.nama_kategori);
                        setShowDropdown(false); // Hide dropdown
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cat.nama_kategori}</span>
                        {categoryId == cat.id && (
                          <span className="text-blue-600 text-sm">
                            ✓ Dipilih
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pesan jika tidak ada hasil */}
              {showDropdown &&
                filteredCategories.length === 0 &&
                searchInput &&
                !isLoadingCategories &&
                categories.length > 0 && (
                  <div className="text-sm text-orange-600 mt-2">
                    ⚠️ Tidak ada kategori yang cocok dengan "{searchInput}".
                    Coba kata kunci lain.
                  </div>
                )}
            </div>
            <label
              htmlFor="file"
              className="w-full flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg shadow-md tracking-wide uppercase border border-blue-200 cursor-pointer hover:bg-blue-100 transition-all duration-200"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                ></path>
              </svg>
              <p className="mt-2 text-base leading-normal">
                Pilih file dokumen
              </p>
              <p className="mt-2 text-sm leading-normal text-gray-500">
                (jpg, jpeg, png, pdf, docx, doc) maksimal 5MB
              </p>
              <input
                type="file"
                name="file"
                id="file"
                maxLength={5242880}
                className="hidden"
                accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </label>
            {/* Opsi Scan OCR */}
            <div className="w-full flex items-center gap-2">
              <input
                id="use-ocr"
                type="checkbox"
                className="h-4 w-4"
                checked={useOCR}
                onChange={(e) => setUseOCR(e.target.checked)}
              />
              <label htmlFor="use-ocr" className="text-sm text-gray-700">
                Gunakan scan OCR (hanya untuk file gambar)
              </label>
            </div>

            {useOCR && selectedFile && previewType === "image" && (
              <button
                type="button"
                onClick={handleScanOCR}
                className={`w-full bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-semibold shadow-md cursor-pointer ${
                  isScanning ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={isScanning}
              >
                {isScanning
                  ? "Memindai (OCR)..."
                  : "Scan OCR untuk prefill rincian dokumen"}
              </button>
            )}

            {/* Rincian Dokumen Section (jenis informasi yang diisi) */}
            <div className="w-full mt-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 text-left">
                Rincian Dokumen (opsional - jenis informasi yang diisi)
              </h2>
              <div className="overflow-auto border border-blue-100 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Jenis Informasi</th>
                      <th className="px-3 py-2 text-left">Isi Informasi</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {metadataItems.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">
                          <input
                            className="w-56 px-2 py-1 border rounded"
                            value={it.jenis_informasi}
                            onChange={(e) =>
                              updateMetadataItem(
                                idx,
                                "jenis_informasi",
                                e.target.value
                              )
                            }
                            placeholder="contoh: Perihal"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className="w-full px-2 py-1 border rounded"
                            value={it.isi_informasi}
                            onChange={(e) =>
                              updateMetadataItem(
                                idx,
                                "isi_informasi",
                                e.target.value
                              )
                            }
                            placeholder="contoh: Surat Keterangan"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            className="text-red-600 hover:underline"
                            onClick={() => removeMetadataItem(idx)}
                            disabled={metadataItems.length === 1}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 w-full text-left">
                <button
                  type="button"
                  onClick={addMetadataItem}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 cursor-pointer"
                >
                  + Tambah Rincian Dokumen
                </button>
              </div>
            </div>
            {(selectedFile || docType) && (
              <div className="text-sm text-gray-700 text-center">
                {docType && (
                  <div>
                    <span className="font-semibold">Jenis dokumen:</span>{" "}
                    {DOC_TYPES.find((t) => t.value === docType)?.label}
                  </div>
                )}
                {selectedFile && (
                  <div>
                    <span className="font-semibold">File dipilih:</span>{" "}
                    {selectedFile.name}
                  </div>
                )}
              </div>
            )}
            {selectedFile && previewType !== "none" && (
              <div className="w-full mt-3 border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700 font-semibold">
                    Preview
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedFile.name}
                  </div>
                </div>
                {previewType === "image" && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded border"
                  />
                )}
                {previewType === "pdf" && (
                  <iframe
                    title="PDF Preview"
                    src={previewUrl}
                    className="w-full h-101 border rounded"
                  />
                )}
                {previewType === "word" && (
                  <div className="text-sm text-gray-700">
                    Tidak dapat menampilkan pratinjau dokumen Word secara
                    langsung.{" "}
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline"
                    >
                      Buka file
                    </a>
                  </div>
                )}
                {previewType === "other" && (
                  <div className="text-sm text-gray-700">
                    Pratinjau tidak tersedia untuk tipe file ini.{" "}
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline"
                    >
                      Buka file
                    </a>
                  </div>
                )}
              </div>
            )}
            {docType === "Kartu Keluarga" && (
              <div className="w-full mt-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 text-left">
                  Anggota Keluarga
                </h2>
                <div className="overflow-auto border border-blue-100 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-3 py-2 text-left">NIK</th>
                        <th className="px-3 py-2 text-left">Nama Lengkap</th>
                        <th className="px-3 py-2 text-left">Tempat Lahir</th>
                        <th className="px-3 py-2 text-left">Tanggal Lahir</th>
                        <th className="px-3 py-2 text-left">Jenis Kelamin</th>
                        <th className="px-3 py-2 text-left">Status Hubungan</th>
                        <th className="px-3 py-2 text-left">Pendidikan</th>
                        <th className="px-3 py-2 text-left">Agama</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Pekerjaan</th>
                        <th className="px-3 py-2 text-left">Nama Ayah</th>
                        <th className="px-3 py-2 text-left">Nama Ibu</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {anggota.map((m, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">
                            <input
                              className="w-44 px-2 py-1 border rounded"
                              value={m.nik}
                              onChange={(e) =>
                                updateMember(idx, "nik", e.target.value)
                              }
                              placeholder="16 digit"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-56 px-2 py-1 border rounded"
                              value={m.nama_lengkap}
                              onChange={(e) =>
                                updateMember(
                                  idx,
                                  "nama_lengkap",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-36 px-2 py-1 border rounded"
                              value={m.tempat_lahir}
                              onChange={(e) =>
                                updateMember(
                                  idx,
                                  "tempat_lahir",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              className="w-40 px-2 py-1 border rounded"
                              value={m.tanggal_lahir}
                              onChange={(e) =>
                                updateMember(
                                  idx,
                                  "tanggal_lahir",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              className="w-40 px-2 py-1 border rounded"
                              value={m.jenis_kelamin}
                              onChange={(e) =>
                                updateMember(
                                  idx,
                                  "jenis_kelamin",
                                  e.target.value
                                )
                              }
                            >
                              {GENDER_OPTIONS.map((g) => (
                                <option key={g.value} value={g.value}>
                                  {g.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-44 px-2 py-1 border rounded"
                              value={m.status_hubungan}
                              onChange={(e) =>
                                updateMember(
                                  idx,
                                  "status_hubungan",
                                  e.target.value
                                )
                              }
                              placeholder="Kepala Keluarga/Anak/Istri/..."
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-40 px-2 py-1 border rounded"
                              value={m.pendidikan_akhir}
                              onChange={(e) =>
                                updateMember(
                                  idx,
                                  "pendidikan_akhir",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-36 px-2 py-1 border rounded"
                              value={m.agama}
                              onChange={(e) =>
                                updateMember(idx, "agama", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-28 px-2 py-1 border rounded"
                              value={m.status}
                              onChange={(e) =>
                                updateMember(idx, "status", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-40 px-2 py-1 border rounded"
                              value={m.pekerjaan}
                              onChange={(e) =>
                                updateMember(idx, "pekerjaan", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-40 px-2 py-1 border rounded"
                              value={m.nama_ayah}
                              onChange={(e) =>
                                updateMember(idx, "nama_ayah", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="w-40 px-2 py-1 border rounded"
                              value={m.nama_ibu}
                              onChange={(e) =>
                                updateMember(idx, "nama_ibu", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() => removeMember(idx)}
                              disabled={anggota.length === 1}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 w-full text-left">
                  <button
                    type="button"
                    onClick={addMember}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    + Tambah Anggota
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center w-full">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-sm text-center w-full">
                {success}
              </div>
            )}
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-600 transition-all duration-200 text-white px-6 py-2 rounded-md font-semibold shadow-md w-full cursor-pointer ${
                !selectedFile || !docType ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={!selectedFile || !docType}
            >
              Upload
            </button>
          </form>
        </article>
      </DashboardLayout>
    </main>
  );
}
