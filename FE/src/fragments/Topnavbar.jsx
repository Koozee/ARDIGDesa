import { BsPersonFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function TopNavbarDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const closeModal = (e) => {
      if (
        isModalOpen &&
        !e.target.closest("button") &&
        !e.target.closest(".modal-content")
      ) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("click", closeModal);
    return () => document.removeEventListener("click", closeModal);
  }, [isModalOpen]);

  return (
    <>
      <header
        className={`w-full font-heebo fixed top-0 right-0 py-4 px-8 flex justify-end items-center bg-white z-40  transition-all duration-300`}
      >
        {isLoading ? (
          // Loading skeleton
          <div className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg">
            <div className="flex flex-col items-end">
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mt-1"></div>
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ) : (
          // User info button
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">Masuk sebagai</span>
              <span className="text-sm font-semibold text-gray-900">
                {user?.nama_lengkap || "User"}
              </span>
              <span className="text-xs font-semibold text-gray-400 capitalize">
                {user?.jabatan} - {user?.role}
              </span>
            </div>
            <div
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(237.64deg, #000000 -70.75%, #2290FF 142.43%)",
              }}
            >
              <BsPersonFill className="text-white text-xl" />
            </div>
          </button>
        )}
      </header>
      {isModalOpen && !isLoading && (
        <div className="fixed top-20 right-8 z-50 bg-white shadow-lg rounded-lg w-56 border border-gray-100">
          <nav>
            <ul className="flex flex-col">
              <li>
                <Link
                  to="/profile"
                  className="font-medium px-5 py-3 hover:bg-gray-100 block text-sm"
                >
                  Profil Saya
                </Link>
              </li>
              <li className="border-t border-[#F6F6F6]">
                <button
                  onClick={handleLogout}
                  className="w-full text-left font-medium px-5 py-3 text-red-600 hover:bg-gray-100 block text-sm cursor-pointer"
                >
                  Keluar
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
