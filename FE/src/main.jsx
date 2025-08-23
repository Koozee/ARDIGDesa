import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Toaster, resolveValue } from "react-hot-toast";
import { BsBell } from "react-icons/bs";
import NotFoundPages from "@/pages/404.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import UploadDoc from "@/pages/UploadDoc.jsx";
import ManageCat from "@/pages/ManageCat.jsx";
import CategoryDetail from "@/pages/CategoryDetail.jsx";
import Login from "@/pages/Login.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import Profile from "@/pages/Profile.jsx";
import ManageUser from "@/pages/ManageUser.jsx";
import KKDetail from "@/pages/KKDetail.jsx";
import DocDetail from "@/pages/DocDetail.jsx";

const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFoundPages />,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/upload-document",
    element: (
      <ProtectedRoute>
        <UploadDoc />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manage-kategori",
    element: (
      <ProtectedRoute>
        <ManageCat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manage-kategori/:id",
    element: (
      <ProtectedRoute>
        <CategoryDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/document/family-member/:documentId",
    element: (
      <ProtectedRoute>
        <KKDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/document/detail/:documentId",
    element: (
      <ProtectedRoute>
        <DocDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manage-user",
    element: (
      <ProtectedRoute>
        <ManageUser />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster position="top-right">
      {(t) => (
        <div
          className={`flex items-center gap-2 text-gray-800 p-4 shadow-md rounded-lg ${
            t.type === "success" && "bg-[#DFF8EC]"
          } ${t.type === "error" && "bg-[#FFEAED]"} ${
            t.type === "blank" && "bg-[#E2F2FF]"
          }`}
        >
          <div
            className={`text-2xl ${
              t.type === "success" &&
              "bg-[#00994D] p-2 text-sm text-white rounded-lg"
            } ${
              t.type === "error" &&
              "bg-[#D31121] p-2 text-sm text-white rounded-lg"
            } ${
              t.type === "blank" &&
              "bg-[#106EEA] p-2 text-sm text-white rounded-lg"
            }`}
          >
            <BsBell />
          </div>
          <p
            className={`${
              t.type === "success" && "text-[#1867A3] font-semibold font-heebo"
            } ${
              t.type === "error" && "text-[#B7000C] font-semibold font-heebo"
            } ${
              t.type === "blank" && "text-[#333333] font-semibold font-heebo"
            }`}
          >
            {resolveValue(t.message, t)}
          </p>
        </div>
      )}
    </Toaster>
    <RouterProvider router={router} />
  </StrictMode>
);
