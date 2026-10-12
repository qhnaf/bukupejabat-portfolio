import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Pagination from "../components/Pagination";
import api, { endpoints } from "../api/client";
import { loadPdfLibs } from "../utils/pdfLibs";
import kemluBg from "../assets/images/logo_kemlu_fix.png";
import { logActivity } from "../utils/logActivity";
import Modal from "../components/Modal";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const EMPTY_PEJABAT = {
    id: "",
    nama: "",
    gelar_jabatan: "",
    alamat: "",
    telp: "",
};

export default function DetailKonhor({ konsulId: konsulIdProp, konsulNama }) {
    const navigate = useNavigate();
    const { konsulId: routeKonsulId } = useParams();
    const konsulId = konsulIdProp || routeKonsulId;

    const [pejabats, setPejabats] = useState([]);
    const [konsulDetail, setKonsulDetail] = useState(null);
    const [editPejabat, setEditPejabat] = useState(EMPTY_PEJABAT);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchPejabats();
        fetchKonsulDetail();
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, [konsulId]);

    // Cek apakah user boleh edit/hapus data pada konsul ini
    const canEdit = () => {
        if (!user || !konsulDetail) return false;
        if (user.role === 'superadmin') return true;
        // gunakan == agar integer vs string tidak masalah
        return konsulDetail.unit_kerja_id != null && user.unit_kerja_id != null &&
            konsulDetail.unit_kerja_id == user.unit_kerja_id;
    };

    const fetchKonsulDetail = async () => {
        try {
            const response = await api.get(endpoints.konsulKehormatanById(konsulId));
            if (response.data.success) {
                setKonsulDetail(response.data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil detail konsul:", error);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchPejabats = async () => {
        setLoading(true);
        try {
            const response = await api.get(endpoints.pejabatKonsul, {
                params: { konsul_id: konsulId }
            });
            if (response.data.success) {
                setPejabats(response.data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditPejabat(EMPTY_PEJABAT);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (pejabat) => {
        setEditPejabat({ ...pejabat });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditPejabat((prev) => ({ ...prev, [name]: value }));
    };

    const savePejabat = async (e) => {
        e.preventDefault();

        setIsSaving(true);
        try {
            if (isEditing) {
                await api.put(endpoints.pejabatKonsulById(editPejabat.id), editPejabat);
            } else {
                await api.post(endpoints.pejabatKonsul, { ...editPejabat, konsul_id: konsulId });
            }
            fetchPejabats();

            closeModal();
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: isEditing
                    ? "Data pejabat berhasil diperbarui."
                    : "Data pejabat berhasil ditambahkan.",
                confirmButtonColor: "#0ea5e9",
            });
        } catch {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Gagal menyimpan data pejabat.",
                confirmButtonColor: "#0ea5e9",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const deletePejabat = (id) => {
        Swal.fire({
            title: "Hapus data pejabat?",
            text: "Data pejabat konsul kehormatan akan dihapus.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(endpoints.pejabatKonsulById(id));
                fetchPejabats();
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Data pejabat berhasil dihapus.",
                    confirmButtonColor: "#0ea5e9",
                });
            }
        });
    };

    const filteredPejabats = pejabats.filter((p) => {
        const term = searchTerm.toLowerCase();

        return (
            (p.nama || "").toLowerCase().includes(term) ||
            (p.gelar_jabatan || "").toLowerCase().includes(term) ||
            (p.alamat || "").toLowerCase().includes(term) ||
            (p.telp || "").toLowerCase().includes(term)
        );
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentPejabats = filteredPejabats.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.max(1, Math.ceil(filteredPejabats.length / itemsPerPage));

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const title = konsulNama || (konsulDetail ? `${konsulDetail.kota}, ${konsulDetail.negara}` : `Memuat...`);

    const downloadPDF = async (action = 'preview') => {
        try {
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
                doc.addImage(kemluBg, 'PNG', x, y, imgWidth, imgHeight);
            };

            const originalAddPage = doc.addPage.bind(doc);
            doc.addPage = function () {
                originalAddPage();
                drawWatermark();
                return this;
            };

            drawWatermark();

            // --- HEADER HALAMAN ---
            doc.setFont("times", "bold");
            doc.setFontSize(11);
            doc.text("DAFTAR PEJABAT KONSUL KEHORMATAN", pageWidth / 2, 18, { align: "center" });

            // --- NAMA KOTA DAN NEGARA ---
            doc.setFontSize(12);
            const konsulNameLong = konsulDetail ? `${konsulDetail.kota}, ${konsulDetail.negara}`.toUpperCase() : "KONSUL KEHORMATAN";
            const splitKonsulName = doc.splitTextToSize(konsulNameLong, pageWidth - 40);
            doc.text(splitKonsulName, pageWidth / 2, 26, { align: "center" });

            let currentY = 26 + splitKonsulName.length * 6 + 4;

            // ── GARIS PEMISAH ────────────────────────────────────────────
            doc.setLineWidth(0.4);
            doc.line(15, currentY, pageWidth - 15, currentY);
            currentY += 6;

            doc.setFont("times", "normal");
            doc.setFontSize(10);

            if (konsulDetail) {
                const labelX = 15;
                const colonX = 47;
                const valueX = 52;
                const lineH = 5.5;
                const maxValueW = pageWidth - valueX - 15;

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

                drawRow("Alamat", konsulDetail.alamat);
                drawRow("No. Telepon", konsulDetail.no_telp);
                drawRow("Fax", konsulDetail.fax);
                drawRow("Email", konsulDetail.email);
                drawRow("Website", konsulDetail.website);
                drawRow("Hari Kerja", konsulDetail.hari_kerja);
            } else {
                currentY += 5;
            }

            const tableColumn = ["No.", "Nama Lengkap", "Jabatan", { content: "Alamat & Telepon", colSpan: 3, styles: { halign: 'center' } }];
            const tableRows = [];

            if (pejabats.length === 0) {
                tableRows.push([
                    { content: "1.", styles: { valign: 'top', halign: 'center' } },
                    { content: "Data Pejabat Belum Tersedia", colSpan: 5, styles: { halign: 'center', fontStyle: 'italic', textColor: [120, 120, 120] } }
                ]);
            } else {
                pejabats.forEach((p, index) => {
                    let contacts = [];
                    const kantor = p.alamat && p.alamat !== "-" ? p.alamat : "s.d.a.";
                    contacts.push({ lbl: "Kantor", val: kantor });
                    if (p.telp || p.no_telp || p.telepon) contacts.push({ lbl: "Telp.", val: (p.telp || p.no_telp || p.telepon) });
                    if (p.fax && p.fax !== "-") contacts.push({ lbl: "Fax", val: p.fax });
                    if (p.no_handphone && p.no_handphone !== "-") contacts.push({ lbl: "Hp.", val: p.no_handphone });
                    if (p.email && p.email !== "-") contacts.push({ lbl: "Email", val: p.email });
                    if (p.wisma && p.wisma !== "-") contacts.push({ lbl: "Wisma", val: p.wisma });

                    if (contacts.length === 0) contacts.push({ lbl: "-", val: "-" });

                    const span = contacts.length;
                    const formatNama = p.nama ? p.nama.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : "-";
                    
                    contacts.forEach((c, cIdx) => {
                        if (cIdx === 0) {
                            tableRows.push([
                                { content: `${index + 1}.`, rowSpan: span, styles: { valign: 'top', halign: 'center' } },
                                { content: formatNama, rowSpan: span, styles: { valign: 'top' } },
                                { content: p.gelar_jabatan || "-", rowSpan: span, styles: { valign: 'top' } },
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
                head: [tableColumn],
                body: tableRows,
                startY: currentY,
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
                margin: { left: 15, right: 15 }
            });

            const fileName = konsulDetail ? `${konsulDetail.kota}_${konsulDetail.negara}`.replace(/\s+/g, "_") : "Konhor";
            doc.setProperties({ title: `Buku_Pejabat_${fileName}.pdf` });
            
            if (action === 'download') {
                doc.save(`Buku_Pejabat_${fileName}.pdf`);
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'File PDF berhasil diunduh.', confirmButtonColor: '#0ea5e9', timer: 2000, showConfirmButton: false });
                logActivity("DOWNLOAD PDF", `Mengunduh PDF Daftar Konsul Kehormatan ${konsulDetail ? konsulDetail.kota : ""}`);
            } else {
                const pdfBlob = doc.output('bloburl');
                window.open(pdfBlob, '_blank');
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Preview PDF berhasil dibuka di tab baru.', confirmButtonColor: '#0ea5e9', timer: 2000, showConfirmButton: false });
                logActivity("PREVIEW PDF", `Preview PDF Daftar Konsul Kehormatan ${konsulDetail ? konsulDetail.kota : ""}`);
            }
        } catch (error) {
            console.error("Error creating PDF:", error);
            Swal.fire({ icon: 'error', title: 'Gagal PDF', text: 'Terjadi kesalahan saat membuat PDF.' });
        }
    };

    return (
        <Card padding={false} className="mb-5">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 w-full">
                    <div className="w-full lg:w-auto">
                        <h2 className="text-base font-bold text-slate-800 uppercase mb-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="cursor-pointer hover:text-sky-600"
                            >
                                Detail Pejabat Konsul Kehormatan
                            </button>
                            <span className="text-sky-600"> - {title}</span>
                        </h2>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <div className="w-full md:w-72">
                                <Input
                                    type="text"
                                    aria-label="Cari pejabat"
                                    placeholder="Cari pejabat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    }
                                    className="h-9"
                                />
                            </div>

                            <div className="text-xs font-semibold text-slate-400">
                                Total {filteredPejabats.length} data tersedia
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto flex justify-end gap-2">
                        <div className="flex overflow-hidden rounded-xl shadow-lg shadow-rose-100">
                            <Button variant="softDanger" onClick={() => downloadPDF('preview')} className="rounded-none h-9 transition-all active:scale-95">
                                <span className="text-xs font-bold uppercase">Preview</span>
                            </Button>
                            <Button variant="danger" onClick={() => downloadPDF('download')} className="rounded-none h-9 transition-all active:scale-95">
                                <span className="text-xs font-bold uppercase">Unduh PDF</span>
                            </Button>
                        </div>
                        {canEdit() && (
                        <Button variant="primary" onClick={openAddModal} className="w-full md:w-auto h-9 shadow-lg shadow-sky-100 transition-all active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-xs font-bold uppercase">Tambah</span>
                        </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-black tracking-wider">
                        <tr>
                            <th className="px-4 py-4 w-12 text-center">No</th>
                            <th className="px-4 py-4">Nama</th>
                            <th className="px-4 py-4">Gelar/Jabatan</th>
                            <th className="px-4 py-4">Alamat</th>
                            <th className="px-4 py-4">No. Telp</th>
                            {canEdit() && <th className="px-4 py-4 w-24 text-center sticky right-0 bg-slate-50">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={canEdit() ? "6" : "5"} className="p-10 text-center">
                                    <span className="loading loading-spinner text-sky-500"></span>
                                </td>
                            </tr>
                        ) : filteredPejabats.length > 0 ? (
                            currentPejabats.map((p, index) => (
                                <tr key={p.id} className="hover:bg-sky-50/40 transition-colors group">
                                    <td className="px-4 py-3 text-sm text-center text-slate-400 font-bold">
                                        {indexOfFirst + index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-700 capitalize">
                                        {p.nama || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-500">
                                        {p.gelar_jabatan || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-sm">
                                        {p.alamat || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-600">
                                        {p.telp || "-"}
                                    </td>
                                    {canEdit() && (
                                    <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-[#f6fbff] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)]">
                                        <div className="flex justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={() => openEditModal(p)}
                                                className="px-2 text-amber-500 hover:bg-amber-100"
                                                title="Edit Pejabat"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={() => deletePejabat(p.id)}
                                                className="px-2 text-red-400 hover:bg-red-100"
                                                title="Hapus Pejabat"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={canEdit() ? "6" : "5"} className="p-10 text-center text-slate-400 italic">
                                    Data tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredPejabats.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredPejabats.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                    }}
                />
            )}

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                title={isEditing ? "Edit Data Pejabat Konsul Kehormatan" : "Tambah Data Pejabat Konsul Kehormatan"}
                size="lg"
            >
                    <form className="space-y-5" onSubmit={savePejabat}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="Nama"
                                id="pejabat-nama"
                                type="text"
                                name="nama"
                                value={editPejabat.nama}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="No. Telepon"
                                id="pejabat-telp"
                                type="text"
                                name="telp"
                                value={editPejabat.telp}
                                onChange={handleInputChange}
                            />
                        </div>

                        <Input
                            label="Gelar/Jabatan"
                            id="pejabat-gelar"
                            type="text"
                            name="gelar_jabatan"
                            value={editPejabat.gelar_jabatan}
                            onChange={handleInputChange}
                        />

                        <Textarea
                            label="Alamat"
                            id="pejabat-alamat"
                            name="alamat"
                            rows={3}
                            value={editPejabat.alamat}
                            onChange={handleInputChange}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="ghost" type="button" onClick={closeModal} className="uppercase text-[10px]">Batal</Button>
                            <Button variant="primary" type="submit" disabled={isSaving} className="uppercase text-xs px-10">
                                {isSaving ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
            </Modal>
        </Card>
    );
}
