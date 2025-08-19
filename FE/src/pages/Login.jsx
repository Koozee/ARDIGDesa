import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { axiosInstance } from "../utils/axios";
import image from "@/assets/authimage.jpg";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  // Cek apakah user sudah login
  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.currentTarget.username.value.trim();
    const password = e.currentTarget.password.value;

    if (!username || !password) {
      return toast.error("Username dan password tidak boleh kosong");
    }

    setIsLoading(true);
    try {
      const resp = await axiosInstance.post("/user/login", {
        username,
        password,
      });
      
      // Handle response menggunakan hook useAuth
      const result = login(resp.data);
      
      if (result.success) {
        toast.success("Login berhasil!");
      } else {
        toast.error(result.message || "Login gagal");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login gagal. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-slate-100">
      {/* Left: image */}
      <div
        className="md:w-[45%] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="flex flex-col justify-end items-start w-full h-full p-6 relative z-10">
          <span className="text-white text-sm font-light">
            Arsip Digital Desa Purwosekar
          </span>
          <p className="text-white text-xl md:text-2xl font-bold mt-2">
            Kecamatan Tajinan Kabupaten Malang
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="w-full md:w-[55%] flex flex-col justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto border border-gray-200 rounded-xl py-8 px-8 mb-5 mt-16 shadow-sm">
          <h2 className="text-2xl md:text-3xl text-gray-800 font-bold mb-2 text-center">
            Masuk Akun
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center">
            Masukkan username & kata sandi anda
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                name="username"
                id="username"
                type="text"
                className="block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan username"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kata Sandi
              </label>
              <input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan kata sandi"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                ) : (
                  <FiEye className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#288CCF] hover:bg-[#1867A3] disabled:bg-gray-400 text-white rounded-lg py-2.5 mt-4 font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
        <div className="text-center text-sm text-gray-600 m">
          © All rights reserved - Kantor Administrasi Desa Purwosekar
        </div>
      </div>
    </main>
  );
}
