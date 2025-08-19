import { Link, useLocation } from "react-router-dom";
import {
  BsFillHouseFill,
  BsChevronLeft,
  BsChevronRight,
  BsCollectionFill,
  BsFileEarmarkArrowUpFill,
  BsPersonFillGear,
} from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={`flex flex-col gap-12 border-r-2 border-gray-200 h-screen p-7 bg-white fixed top-0 left-0 z-50 transition-all duration-300 overflow-y-auto ${
        isExpanded ? "w-[360px] 2xl:w-[420px]" : "w-[130px] 2xl:w-[200px]"
      }`}
    >
      <div className="flex items-center gap-2 relative">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-12 h-12 2xl:w-16 2xl:h-16"
        />
        {isExpanded && (
          <div>
            <h6 className="text-gray-500 text-[8px] 2xl:text-xs">
              Dinas Kependudukan dan Catatan Sipil Desa Purwosekar
            </h6>
            <h4 className="font-bold text-[14px] 2xl:text-lg text-blue-900">
              Arsip Digital
            </h4>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer"
        >
          {isExpanded ? (
            <BsChevronLeft className="text-gray-500" />
          ) : (
            <BsChevronRight className="text-gray-500" />
          )}
        </button>
      </div>

      <nav>
        <ul className="flex flex-col gap-3">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                location.pathname === "/dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-black"
              }`}
            >
              <BsFillHouseFill className="text-xl" />
              {isExpanded && (
                <span
                  className={`text-base font-normal ${
                    location.pathname !== "/dashboard" && "text-[#6D6D6D]"
                  }`}
                >
                  Dashboard
                </span>
              )}
            </Link>
          </li>

          {user?.role === "superadmin" && (
            <li>
              <Link
                to="/manage-user"
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                  location.pathname === "/manage-user"
                    ? "text-blue-600 bg-blue-50"
                    : "text-black"
                }`}
              >
                <BsPersonFillGear className="text-xl" />
                {isExpanded && (
                  <span
                    className={`text-base font-normal ${
                      location.pathname !== "/manage-user" && "text-[#6D6D6D]"
                    }`}
                  >
                    Manajemen User
                  </span>
                )}
              </Link>
            </li>
          )}

          <li>
            <Link
              to="/upload-document"
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                location.pathname === "/upload-document"
                  ? "text-blue-600 bg-blue-50"
                  : "text-black"
              }`}
            >
              <BsFileEarmarkArrowUpFill className="text-xl" />
              {isExpanded && (
                <span
                  className={`text-base font-normal ${
                    location.pathname !== "/upload-document" && "text-[#6D6D6D]"
                  }`}
                >
                  Unggah Dokumen
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/manage-kategori"
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                location.pathname === "/manage-kategori"
                  ? "text-blue-600 bg-blue-50"
                  : "text-black"
              }`}
            >
              <BsCollectionFill className="text-xl" />
              {isExpanded && (
                <span
                  className={`text-base font-normal ${
                    location.pathname !== "/manage-kategori" && "text-[#6D6D6D]"
                  }`}
                >
                  Manajemen Kategori
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
