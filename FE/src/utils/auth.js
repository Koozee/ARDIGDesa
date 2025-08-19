// Fungsi utilitas untuk mengelola cookies
const cookieUtils = {
  setCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  removeCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const authService = {
  SESSION_DURATION_MS: 3 * 60 * 60 * 1000, // 3 jam dalam milidetik

  setToken(token) {
    // Simpan di cookies saja
    cookieUtils.setCookie("token", token, 1); // 1 hari
    this.updateLastActivity();
  },

  setUserInfo(user) {
    // Simpan informasi user di cookies saja
    cookieUtils.setCookie("userId", String(user.id), 1);
    cookieUtils.setCookie("username", user.username, 1);
    cookieUtils.setCookie("namaLengkap", user.nama_lengkap, 1);
    cookieUtils.setCookie("jabatan", user.jabatan, 1);
    cookieUtils.setCookie("role", user.role, 1);
    cookieUtils.setCookie("nomor_telepon", user.nomor_telepon, 1);
  },

  updateLastActivity() {
    const now = new Date().toISOString();
    cookieUtils.setCookie("lastActivity", now, 1);
  },

  isSessionIdle() {
    // Cek dari cookies saja
    const lastActivity = cookieUtils.getCookie("lastActivity");
    
    if (!lastActivity) return true;

    const lastActivityTime = new Date(lastActivity).getTime();
    const currentTime = Date.now();
    const idleTime = currentTime - lastActivityTime;

    return idleTime > this.SESSION_DURATION_MS;
  },

  refreshTokenIfActive() {
    if (!this.isAuthenticated()) return;

    const token = this.getToken();
    const userInfo = this.getUserInfo();

    if (token && userInfo.id) {
      // Perbarui nilai dengan waktu aktivitas baru
      this.setToken(token);
      this.setUserInfo(userInfo);
      this.updateLastActivity();
    }
  },

  getToken() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("token");
  },

  getUserId() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("userId");
  },



  getUsername() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("username");
  },

  getNamaLengkap() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("namaLengkap");
  },

  getJabatan() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("jabatan");
  },

  getRole() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("role");
  },

  getNomorTelepon() {
    // Ambil dari cookies saja
    return cookieUtils.getCookie("nomor_telepon");
  },

  // Fungsi untuk mendapatkan semua informasi user
  getUserInfo() {
    return {
      id: this.getUserId(),
      username: this.getUsername(),
      nama_lengkap: this.getNamaLengkap(),
      jabatan: this.getJabatan(),
      role: this.getRole(),
      nomor_telepon: this.getNomorTelepon()
    };
  },

  removeToken() {
    // Hapus dari cookies saja
    cookieUtils.removeCookie("token");
    cookieUtils.removeCookie("userId");
    cookieUtils.removeCookie("username");
    cookieUtils.removeCookie("namaLengkap");
    cookieUtils.removeCookie("jabatan");
    cookieUtils.removeCookie("role");
    cookieUtils.removeCookie("lastActivity");
    cookieUtils.removeCookie("nomor_telepon");
  },

  isAuthenticated() {
    const hasToken = Boolean(this.getToken());
    if (!hasToken) return false;

    if (this.isSessionIdle()) {
      this.removeToken();
      return false;
    }

    return true;
  },

  // Fungsi tambahan untuk mengelola cookies secara eksplisit
  setCookieData(name, value, days = 7) {
    cookieUtils.setCookie(name, value, days);
  },

  getCookieData(name) {
    return cookieUtils.getCookie(name);
  },

  removeCookieData(name) {
    cookieUtils.removeCookie(name);
  },

  // Fungsi untuk mengatur cookie dengan opsi keamanan tambahan
  setSecureCookie(name, value, days = 7, secure = true) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    let cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    
    if (secure && window.location.protocol === 'https:') {
      cookieString += ';Secure';
    }
    
    document.cookie = cookieString;
  }
};

export const handleUserNavigation = (role, navigate) => {
  switch (role) {
    case "superadmin":
      navigate("/dashboard");
      break;
    case "admin":
      navigate("/admin/dashboard");
      break;
    case "user":
      navigate("/user/dashboard");
      break;
    default:
      navigate("/login");
  }
};
