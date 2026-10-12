import React, { useState, lazy, Suspense } from "react";
import api, { endpoints } from "../api/client";
import { loadPdfLibs } from "../utils/pdfLibs";
import Swal from "sweetalert2";
import Button from "../components/ui/Button";
import kemluBg from "../assets/images/logo-kemlu-flipbook.png";
import watermarkImg from "../assets/images/logo_kemlu_fix.png";
// FlipbookViewer memuat react-pdf (berat) — dimuat hanya saat flipbook dibuka.
const FlipbookViewer = lazy(() => import("../components/FlipbookViewer"));

const BASE_INFO_ROWS = [
    { label: "Alamat", field: "alamat" },
    { label: "No. Telepon", field: "telepon" },
    { label: "Fax", field: "fax" },
    { label: "Email", field: "email" },
    { label: "Website", field: "website" },
];

const PDF_ALLOWED_KEYWORDS = [
    "menteri", "wakil menteri", "staf ahli", "sekretaris jenderal", "inspektur jenderal", "duta besar", "kepala badan", "kepala pusat",
    "kepala biro", "kepala bagian", "kepala subbagian", "direktur jenderal", "direktur",
];

const PDF_CONFIG = {
    dalam: {
        url: endpoints.unitKerjaDalamNegeri,
        title: "DAFTAR PEJABAT DALAM NEGERI",
        label: "Dalam Negeri",
        loadingTitle: "Memproses PDF...",
        fileName: "Daftar_Pejabat_Dalam_Negeri.pdf",
        infoRows: BASE_INFO_ROWS,
        filterPejabat: (p) => {
            const jabatanStr = (p.jabatan || "").toLowerCase();
            return PDF_ALLOWED_KEYWORDS.some((key) => jabatanStr.includes(key));
        },
        remapJabatan: null,
    },
    luar: {
        url: endpoints.unitKerjaLuarNegeri,
        title: "DAFTAR PEJABAT LUAR NEGERI",
        label: "Luar Negeri",
        loadingTitle: "Memproses PDF Luar Negeri...",
        fileName: "Daftar_Pejabat_Luar_Negeri.pdf",
        infoRows: [
            ...BASE_INFO_ROWS,
            { label: "Hari Kerja", field: "hari_kerja" },
            { label: "Beda Jam", field: "beda_jam" },
            { label: "Musim Panas", field: "musim_panas" },
            { label: "Musim Dingin", field: "musim_dingin" },
        ],
        filterPejabat: () => true,
        remapJabatan: (jabatan) =>
            jabatan.toUpperCase().includes("STAF SK") ? "Administrasi Umum" : jabatan,
    },
};

export default function PublicPage() {
    const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
    const [flipbookTitle, setFlipbookTitle] = useState("");
    const [flipbookData, setFlipbookData] = useState([]);

    const trackHit = async (type) => {
        try {
            await api.post(endpoints.publicActivitiesHit, { type });
        } catch (error) {
            console.error("Gagal mencatat log aktivitas:", error);
        }
    };

    const downloadPdf = async (type, action = 'preview') => {
        const cfg = PDF_CONFIG[type];
        trackHit(action);

        Swal.fire({
            title: cfg.loadingTitle,
            text: 'Sedang menyusun daftar pejabat per orang...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const [unitsRes, pegawaiRes] = await Promise.all([
                api.get(cfg.url),
                api.get(endpoints.pegawai)
            ]);
            const filteredUnits = unitsRes.data.data || [];
            const allPegawai = pegawaiRes.data.data || [];

            const { jsPDF, autoTable } = await loadPdfLibs();
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            const imgWidth = 200;
            const imgHeight = 140;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            const drawWatermark = () => {
                doc.setGState(new doc.GState({ opacity: 1.0 }));
                doc.addImage(watermarkImg, 'PNG', x, y, imgWidth, imgHeight);
            };

            const originalAddPage = doc.addPage.bind(doc);
            doc.addPage = function () {
                originalAddPage();
                drawWatermark();
                return this;
            };

            drawWatermark();

            let isFirstPage = true;
            let hasData = false;

            filteredUnits.forEach((unit) => {
                const pejabatForUnit = allPegawai.filter(
                    (p) => p.unit_kerja_id === unit.id && cfg.filterPejabat(p)
                );

                hasData = true;

                if (!isFirstPage) {
                    doc.addPage();
                }
                isFirstPage = false;

                // --- HEADER HALAMAN ---
                doc.setFont("times", "bold");
                doc.setFontSize(11);
                doc.text(cfg.title, pageWidth / 2, 18, { align: "center" });

                // --- NAMA PANJANG SATKER ---
                doc.setFontSize(12);
                const unitNameLong = unit.deskripsi ? unit.deskripsi.toUpperCase() : (unit.nama_unit_kerja ? unit.nama_unit_kerja.toUpperCase() : "UNIT TIDAK DIKETAHUI");
                const splitUnitName = doc.splitTextToSize(unitNameLong, pageWidth - 40);
                doc.text(splitUnitName, pageWidth / 2, 26, { align: "center" });

                let currentY = 26 + splitUnitName.length * 6 + 4;

                // ── GARIS PEMISAH ────────────────────────────────────────────
                doc.setLineWidth(0.4);
                doc.line(15, currentY, pageWidth - 15, currentY);
                currentY += 6;

                // ── HELPER: cetak baris label : nilai (format surat resmi) ──
                const labelX = 15;   // mulai label
                const colonX = 47;   // posisi titik dua
                const valueX = 52;   // mulai nilai
                const maxValueW = pageWidth - valueX - 15; // lebar maks nilai
                const lineH = 5.5;  // jarak antar baris

                doc.setFont("times", "normal");
                doc.setFontSize(10);

                const drawRow = (label, value) => {
                    const displayVal = (!value || String(value).trim() === "" || String(value).trim() === "-") ? "-" : value;
                    doc.setFont("times", "bold");
                    doc.text(label, labelX, currentY);
                    doc.setFont("times", "normal");
                    doc.text(":", colonX, currentY);
                    const splitVal = doc.splitTextToSize(String(displayVal), maxValueW);
                    doc.text(splitVal, valueX, currentY);
                    currentY += splitVal.length * lineH + 1;
                };

                cfg.infoRows.forEach(({ label, field }) => drawRow(label, unit[field]));

                // --- ISI TABEL ---
                const tableRows = [];
                if (pejabatForUnit.length === 0) {
                    tableRows.push([
                        { content: "1.", styles: { valign: 'top', halign: 'center' } },
                        { content: "Data Pejabat Belum Tersedia", colSpan: 5, styles: { halign: 'center', fontStyle: 'italic', textColor: [120, 120, 120] } }
                    ]);
                } else {
                    pejabatForUnit.forEach((p, i) => {
                        let jabatanFormat = p.jabatan || "-";
                        if (cfg.remapJabatan) jabatanFormat = cfg.remapJabatan(jabatanFormat);

                        const formatNama = p.nama_pegawai || p.nama || "-";
                        const titleCaseNama = formatNama === "-" ? "-" : formatNama.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
                        const titleCaseJabatan = jabatanFormat === "-" ? "-" : jabatanFormat.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());

                        let contacts = [];
                        const kantor = p.alamat && p.alamat !== "-" ? p.alamat : "s.d.a.";
                        contacts.push({ lbl: "Kantor", val: kantor });
                        if (p.telepon && p.telepon !== "-") contacts.push({ lbl: "Telp.", val: p.telepon });
                        if (p.fax && p.fax !== "-") contacts.push({ lbl: "Fax", val: p.fax });
                        if (p.no_handphone && p.no_handphone !== "-") contacts.push({ lbl: "Hp.", val: p.no_handphone });
                        if (p.email && p.email !== "-") contacts.push({ lbl: "Email", val: p.email });
                        if (p.wisma && p.wisma !== "-") contacts.push({ lbl: "Wisma", val: p.wisma });

                        if (contacts.length === 0) contacts.push({ lbl: "-", val: "-" });

                        const span = contacts.length;
                        contacts.forEach((c, cIdx) => {
                            if (cIdx === 0) {
                                tableRows.push([
                                    { content: `${i + 1}.`, rowSpan: span, styles: { valign: 'top', halign: 'center' } },
                                    { content: titleCaseNama, rowSpan: span, styles: { valign: 'top' } },
                                    { content: titleCaseJabatan, rowSpan: span, styles: { valign: 'top' } },
                                    { content: c.lbl, styles: { cellPadding: { top: 4, bottom: 1, left: 4, right: 1 } } },
                                    { content: ":", styles: { cellPadding: { top: 4, bottom: 1, left: 1, right: 1 } } },
                                    { content: c.val, styles: { cellPadding: { top: 4, bottom: 1, left: 1, right: 4 } } }
                                ]);
                            } else {
                                tableRows.push([
                                    { content: c.lbl, styles: { cellPadding: { top: 1, bottom: cIdx === span - 1 ? 4 : 1, left: 4, right: 1 } } },
                                    { content: ":", styles: { cellPadding: { top: 1, bottom: cIdx === span - 1 ? 4 : 1, left: 1, right: 1 } } },
                                    { content: c.val, styles: { cellPadding: { top: 1, bottom: cIdx === span - 1 ? 4 : 1, left: 1, right: 4 } } }
                                ]);
                            }
                        });
                    });
                }

                autoTable(doc, {
                    startY: currentY,
                    head: [["No.", "Nama Lengkap", "Jabatan", { content: "Alamat & Telepon", colSpan: 3, styles: { halign: 'center' } }]],
                    body: tableRows,
                    theme: "plain",
                    styles: { font: "times", fontSize: 10, cellPadding: 4, textColor: [0, 0, 0] },
                    headStyles: { fontStyle: "bold", lineWidth: { top: 0.5, bottom: 0.5 }, lineColor: [0, 0, 0], halign: 'center' },
                    columnStyles: {
                        0: { cellWidth: 13, halign: 'center' },
                        1: { cellWidth: 45, halign: 'left' },
                        2: { cellWidth: 50, halign: 'left' },
                        3: { cellWidth: 16 },
                        4: { cellWidth: 4, halign: 'center' },
                        5: { cellWidth: 'auto' }
                    },
                    margin: { left: 15, right: 15 },
                });
            });

            if (!hasData) {
                Swal.fire('Informasi', 'Tidak ditemukan data pejabat.', 'info');
                return;
            }

            doc.setProperties({ title: cfg.fileName });

            if (action === 'download') {
                doc.save(cfg.fileName);
                Swal.close();
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: `PDF Pejabat ${cfg.label} berhasil diunduh.`, timer: 2000, showConfirmButton: false });
            } else {
                const pdfBlob = doc.output('bloburl');
                const previewWindow = window.open(pdfBlob, '_blank');
                Swal.close();
                if (previewWindow) {
                    Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Preview PDF Pejabat ${cfg.label} berhasil dibuka di tab baru.`, timer: 2000, showConfirmButton: false });
                } else {
                    doc.save(cfg.fileName);
                    Swal.fire({ icon: 'info', title: 'Tab preview diblokir', text: 'Browser memblokir tab baru, PDF diunduh langsung.', timer: 2500, showConfirmButton: false });
                }
            }

        } catch (error) {
            console.error("Gagal Download PDF:", error);
            Swal.fire('Error', 'Terjadi kesalahan teknis saat menyusun data PDF.', 'error');
        }
    };

    const prepareFlipbook = async (type) => {
        trackHit('preview');
        Swal.fire({
            title: 'Menyiapkan Flipbook...',
            text: 'Sedang menyusun halaman digital...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const urlUnits = type === 'dalam' ? endpoints.unitKerjaDalamNegeri : endpoints.unitKerjaLuarNegeri;
            const [unitsRes, pegawaiRes] = await Promise.all([
                api.get(urlUnits),
                api.get(endpoints.pegawai)
            ]);

            const filteredUnits = unitsRes.data.data || [];
            const allPegawai = pegawaiRes.data.data || [];
            const allowedKeywords = [
                "menteri", "wakil menteri", "staf ahli",
                "kepala biro", "kepala bagian", "kepala subbagian"
            ];

            let pages = [];

            filteredUnits.forEach((unit) => {
                let pejabatForUnit = [];
                if (type === 'dalam') {
                    pejabatForUnit = allPegawai.filter(p => {
                        const jabatanStr = (p.jabatan || "").toLowerCase();
                        const isPejabat = allowedKeywords.some(key => jabatanStr.includes(key));
                        return isPejabat && p.unit_kerja_id === unit.id;
                    });
                } else {
                    pejabatForUnit = allPegawai.filter(p => p.unit_kerja_id === unit.id);
                }

                const unitNameLong = unit.deskripsi ? unit.deskripsi.toUpperCase() : (unit.nama_unit_kerja ? unit.nama_unit_kerja.toUpperCase() : "UNIT TIDAK DIKETAHUI");

                if (pejabatForUnit.length === 0) {
                    pages.push({
                        unit: unit,
                        type: type,
                        unitName: unitNameLong,
                        pejabat: [],
                        isLanjutan: false,
                        startIndex: 0
                    });
                } else {
                    // Format pejabat
                    const formattedPejabat = pejabatForUnit.map(p => {
                        let jabatanFormat = p.jabatan || "-";
                        if (type === 'luar' && jabatanFormat.toUpperCase().includes("STAF SK")) {
                            jabatanFormat = "Administrasi Umum";
                        }
                        const formatNama = p.nama_pegawai || p.nama || "-";
                        const titleCaseNama = formatNama === "-" ? "-" : formatNama.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
                        const titleCaseJabatan = jabatanFormat === "-" ? "-" : jabatanFormat.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());

                        let contacts = [];
                        const kantor = p.alamat && p.alamat !== "-" ? p.alamat : "s.d.a.";
                        contacts.push({ lbl: "Kantor", val: kantor });
                        if (p.telepon && p.telepon !== "-") contacts.push({ lbl: "Telp.", val: p.telepon });
                        if (p.fax && p.fax !== "-") contacts.push({ lbl: "Fax", val: p.fax });
                        if (p.no_handphone && p.no_handphone !== "-") contacts.push({ lbl: "Hp.", val: p.no_handphone });
                        if (p.email && p.email !== "-") contacts.push({ lbl: "Email", val: p.email });
                        if (p.wisma && p.wisma !== "-") contacts.push({ lbl: "Wisma", val: p.wisma });

                        if (contacts.length === 0) contacts.push({ lbl: "-", val: "-" });

                        return {
                            nama: titleCaseNama,
                            jabatan: titleCaseJabatan,
                            contacts: contacts
                        };
                    });

                    // First page: max 2 pejabat
                    pages.push({
                        unit: unit,
                        type: type,
                        unitName: unitNameLong,
                        pejabat: formattedPejabat.slice(0, 2),
                        isLanjutan: false,
                        startIndex: 0
                    });

                    // Subsequent pages: max 4 pejabat per page
                    for (let i = 2; i < formattedPejabat.length; i += 4) {
                        pages.push({
                            unit: unit,
                            type: type,
                            unitName: `${unitNameLong} (Lanjutan)`,
                            pejabat: formattedPejabat.slice(i, i + 4),
                            isLanjutan: true,
                            startIndex: i
                        });
                    }
                }
            });

            if (pages.length === 0) {
                Swal.fire('Informasi', 'Tidak ditemukan data pejabat.', 'info');
                return;
            }

            setFlipbookTitle(type === 'dalam' ? 'Daftar Pejabat Dalam Negeri' : 'Daftar Pejabat Luar Negeri');
            setFlipbookData(pages);
            Swal.close();
            setIsFlipbookOpen(true);

        } catch (error) {
            console.error("Gagal Flipbook:", error);
            Swal.fire('Error', 'Terjadi kesalahan teknis saat menyusun data Flipbook.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-4xl w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 text-center transition-all">
                    <div className="mb-12">
                        <div className="inline-block mb-6">
                            <img src={kemluBg} alt="Logo Kemlu" className="h-24 object-contain" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">Portal Unduhan Dokumen Pejabat</h1>
                        <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">
                            Data Update{" "}
                            {new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date())}{" "}
                            {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full px-4 sm:px-0">
                        <div className="group w-full sm:w-64 max-w-sm p-8 bg-white border-2 border-slate-100 hover:border-emerald-500 rounded-[28px] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-100 flex flex-col items-center gap-6">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <span className="font-black text-slate-800 uppercase tracking-widest text-sm block">Dalam Negeri</span>
                            </div>
                            <div className="flex flex-col gap-2 w-full mt-2">
                                <Button onClick={() => prepareFlipbook('dalam')} className="w-full py-3 text-xs font-bold uppercase tracking-wide shadow-lg shadow-sky-200 border border-sky-400 hover:border-sky-500 group/btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover/btn:rotate-12 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                    Buka Flipbook
                                </Button>
                                <div className="flex gap-2 w-full">
                                    <Button variant="softSuccess" onClick={() => downloadPdf('dalam', 'preview')} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                                        Preview PDF
                                    </Button>
                                    <Button variant="success" onClick={() => downloadPdf('dalam', 'download')} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wide shadow-sm shadow-emerald-200">
                                        Unduh PDF
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="group w-full sm:w-64 max-w-sm p-8 bg-white border-2 border-slate-100 hover:border-rose-500 rounded-[28px] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-rose-100 flex flex-col items-center gap-6">
                            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <span className="font-black text-slate-800 uppercase tracking-widest text-sm block">Luar Negeri</span>
                            </div>
                            <div className="flex flex-col gap-2 w-full mt-2">
                                <Button onClick={() => prepareFlipbook('luar')} className="w-full py-3 text-xs font-bold uppercase tracking-wide shadow-lg shadow-sky-200 border border-sky-400 hover:border-sky-500 group/btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover/btn:rotate-12 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                    Buka Flipbook
                                </Button>
                                <div className="flex gap-2 w-full">
                                    <Button variant="softDanger" onClick={() => downloadPdf('luar', 'preview')} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wide border border-rose-100">
                                        Preview PDF
                                    </Button>
                                    <Button variant="danger" onClick={() => downloadPdf('luar', 'download')} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wide shadow-sm shadow-rose-200">
                                        Unduh PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[4px]">
                        Kementerian Luar Negeri Republik Indonesia
                    </p>
                </div>
            </main>

            {/* FLIPBOOK MODAL */}
            {isFlipbookOpen && (
                <Suspense fallback={null}>
                    <FlipbookViewer
                        title={flipbookTitle}
                        pages={flipbookData}
                        bgImage={kemluBg}
                        onClose={() => setIsFlipbookOpen(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}