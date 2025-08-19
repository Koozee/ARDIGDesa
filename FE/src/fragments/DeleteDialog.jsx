import React from "react";

export default function DeleteDialog({
  open,
  onClose,
  onConfirm,
  documentTitle,
  isLoading,
  entityLabel = "dokumen",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full overflow-y-auto max-h-[90vh] max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-3">Konfirmasi Hapus</h3>
        <p className="text-gray-600 mb-5">
          Anda yakin ingin menghapus {entityLabel}{" "}
          <span className="font-medium">{documentTitle}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
