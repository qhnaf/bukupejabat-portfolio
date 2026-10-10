import React, { lazy, Suspense, useState, useEffect } from "react";
import api from "./api/client";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// Halaman dimuat lazy (per-route) agar chunk utama tetap kecil.
const PagePublic = lazy(() => import("./pages/PagePublic"));
const Login = lazy(() => import("./pages/Login"));
const DashboardAdmin = lazy(() => import("./pages/DashboardAdmin"));
const DataPegawai = lazy(() => import("./pages/DataPegawai"));
const PerSatker = lazy(() => import("./pages/PerSatker"));
const DalamNegeri = lazy(() => import("./pages/DalamNegeri"));
const LuarNegeri = lazy(() => import("./pages/LuarNegeri"));
const DetailPegawai = lazy(() => import("./pages/DetailPegawai"));
const UnitKerja = lazy(() => import("./pages/UnitKerja"));
const DataAdmin = lazy(() => import("./pages/DataAdmin"));
const PengaturanAkun = lazy(() => import("./pages/PengaturanAkun"));
const KonsulKehormatan = lazy(() => import("./pages/KonsulKehormatan"));
const DetailKehormatan = lazy(() => import("./pages/DetailKonhor"));
const SyncData = lazy(() => import("./pages/SyncData"));

function PageLoading() {
    return (
        <div role="status" aria-live="polite" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" aria-hidden="true"></div>
            <p className="text-sm text-slate-500">Memuat halaman...</p>
        </div>
    );
}

function ProtectedLayout({ onSignOut }) {
    return (
        <MainLayout onSignOut={onSignOut}>
            <Outlet />
        </MainLayout>
    );
}

export default function App() {
    // 1. Inisialisasi state langsung dari localStorage agar saat refresh tidak logout
    const [authed, setAuthed] = useState(() => {
        const savedStatus = localStorage.getItem("isLoggedIn");
        return savedStatus === "true";
    });

    const navigate = useNavigate();

    // 2. Interceptor 401: token kadaluarsa → logout + redirect.
    //    Pelampiran token Bearer otomatis ditangani di api/client.js.
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    handleSignOut();
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // 2. Fungsi Login: Simpan status ke localStorage
    const handleLogin = () => {
        setAuthed(true);
        localStorage.setItem("isLoggedIn", "true");
    };

    // 3. Fungsi SignOut: Hapus status dari localStorage
    const handleSignOut = () => {
        setAuthed(false);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_divisi");
    };

    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoading />}>
                <Routes>
                    <Route path="/" element={<PagePublic />} />
                    <Route path="/public" element={<Navigate to="/" replace />} />

                    <Route
                        path="/login"
                        element={
                            authed ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Login onLogin={handleLogin} />
                            )
                        }
                    />

                    <Route
                        element={
                            authed ? (
                                <ProtectedLayout onSignOut={handleSignOut} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    >
                        <Route path="/dashboard" element={<DashboardAdmin />} />
                        <Route path="/pegawai" element={<DataPegawai />} />
                        <Route path="/satkerja" element={<PerSatker />} />
                        <Route path="/satkerja/dalam-negeri" element={<DalamNegeri />} />
                        <Route path="/satkerja/luar-negeri" element={<LuarNegeri />} />
                        <Route
                            path="/detail-pegawai/:unitId"
                            element={<DetailPegawai />}
                        />
                        <Route path="/admin" element={<DataAdmin />} />
                        {localStorage.getItem("user_role") === "superadmin" && (
                            <>
                                <Route path="/unit-kerja" element={<UnitKerja />} />
                                <Route path="/unit-kerja/form" element={<UnitKerja />} />
                                <Route path="/pengaturan/sync-data" element={<SyncData />} />
                            </>
                        )}
                        <Route path="/pengaturan/akun" element={<PengaturanAkun />} />
                        <Route path="/konsul-kehormatan" element={<KonsulKehormatan />} />
                        <Route path="/konsul-kehormatan/:konsulId" element={<DetailKehormatan />} />
                    </Route>

                    <Route
                        path="*"
                        element={
                            <Navigate to="/" replace />
                        }
                    />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}
