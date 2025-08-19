import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/fragments/Sidebar";
import DashboardLayout from "@/layouts/dashboard";
import { axiosInstance } from "@/utils/axios";
import TopNavbarDashboard from "../fragments/Topnavbar";

export default function KKDetail() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState(null);

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

  const members = doc?.FamilyMembers || doc?.FamilyMember || doc?.family_members || [];

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
                <h1 className="text-2xl font-bold mb-1">Detail Kartu Keluarga</h1>
                <p className="text-sm text-gray-500">Judul: {doc?.judul}</p>
                <p className="text-sm text-gray-500">Tanggal: {doc?.tanggal_dokumen}</p>
                <p className="text-sm text-gray-500">Pengunggah: {doc?.User?.nama_lengkap}</p>
                <p className="text-sm text-gray-500">Kategori: {doc?.Category?.nama_kategori}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Metadata</h2>
                <pre className="bg-gray-50 p-3 rounded text-xs whitespace-pre-wrap">
{JSON.stringify(doc?.metadata || {}, null, 2)}
                </pre>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Anggota Keluarga</h2>
                {members.length === 0 ? (
                  <div className="text-gray-400">Belum ada data anggota keluarga.</div>
                ) : (
                  <div className="overflow-auto border rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-3 py-2 text-left">NIK</th>
                          <th className="px-3 py-2 text-left">Nama Lengkap</th>
                          <th className="px-3 py-2 text-left">Jenis Kelamin</th>
                          <th className="px-3 py-2 text-left">Tempat Lahir</th>
                          <th className="px-3 py-2 text-left">Tanggal Lahir</th>
                          <th className="px-3 py-2 text-left">Status Hubungan</th>
                          <th className="px-3 py-2 text-left">Pendidikan</th>
                          <th className="px-3 py-2 text-left">Agama</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Pekerjaan</th>
                          <th className="px-3 py-2 text-left">Nama Ayah</th>
                          <th className="px-3 py-2 text-left">Nama Ibu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m, idx) => (
                          <tr key={`${m.id || idx}`} className="border-t">
                            <td className="px-3 py-2">{m.nik}</td>
                            <td className="px-3 py-2">{m.nama_lengkap}</td>
                            <td className="px-3 py-2">{m.jenis_kelamin}</td>
                            <td className="px-3 py-2">{m.tempat_lahir}</td>
                            <td className="px-3 py-2">{m.tanggal_lahir}</td>
                            <td className="px-3 py-2">{m.status_hubungan}</td>
                            <td className="px-3 py-2">{m.pendidikan_akhir}</td>
                            <td className="px-3 py-2">{m.agama}</td>
                            <td className="px-3 py-2">{m.status}</td>
                            <td className="px-3 py-2">{m.pekerjaan}</td>
                            <td className="px-3 py-2">{m.nama_ayah}</td>
                            <td className="px-3 py-2">{m.nama_ibu}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      </DashboardLayout>
    </main>
  );
}


