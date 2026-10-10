import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const endpoints = {
    login: "/login",
    logout: "/logout",
    users: "/users",
    usersById: (id) => `/users/${id}`,
    unitKerja: "/unit-kerja",
    unitKerjaDalamNegeri: "/unit-kerja/dalam-negeri",
    unitKerjaLuarNegeri: "/unit-kerja/luar-negeri",
    unitKerjaById: (id) => `/unit-kerja/${id}`,
    pegawai: "/pegawai",
    pegawaiByUnit: (unitId) => `/pegawai/unit/${unitId}`,
    pegawaiById: (id) => `/pegawai/${id}`,
    konsulKehormatan: "/konsul-kehormatan",
    konsulKehormatanById: (id) => `/konsul-kehormatan/${id}`,
    pejabatKonsul: "/pejabat-konsul",
    pejabatKonsulById: (id) => `/pejabat-konsul/${id}`,
    activityLogs: "/activity-logs",
    publicActivitiesHit: "/public-activities/hit",
    publicActivitiesStats: "/public-activities/stats",
    dashboardStats: "/dashboard/stats",
    syncConfig: "/sync-config",
    syncLogs: "/sync-logs",
    syncLogsExport: "/sync-logs/export",
    syncTrigger: "/sync-data/trigger",
    syncTestConnection: "/sync-data/test-connection",
};

export default api;
