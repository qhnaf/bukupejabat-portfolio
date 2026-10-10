import React from "react";

// Menangkap error render di seluruh aplikasi agar pengguna melihat halaman
// darurat yang jelas, bukan layar kosong.
export default class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary menangkap error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-700">Terjadi kesalahan</h1>
                    <p className="text-sm text-slate-500 max-w-md">
                        Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke beranda.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Muat Ulang
                        </button>
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Ke Beranda
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
