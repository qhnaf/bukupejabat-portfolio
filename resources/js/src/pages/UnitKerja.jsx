import React, { useState, useEffect } from "react";
import api, { endpoints } from "../api/client";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";

export default function UnitKerja() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);

    // STATE PENCARIAN & FILTER DROPDOWN
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); // State baru untuk Dropdown

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- STATE UNTUK MODAL EDIT ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [editData, setEditData] = useState({
        id: "",
        kode_unit_kerja: "",
        nama_unit_kerja: "",
        alamat: "",
        telepon: "",
        fax: "",
        email: "",
        website: "",
        hari_kerja: "",
        beda_jam: "",
        deskripsi: "",
    });

    // LOGIKA FILTER PENCARIAN & DROPDOWN GABUNGAN
    const filteredUnits = units.filter((unit) => {
        // 1. Cek Pencarian Teks
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (unit.nama_unit_kerja || "").toLowerCase().includes(searchLower) ||
            (unit.kode_unit_kerja || "").toLowerCase().includes(searchLower) ||
            (unit.email || "").toLowerCase().includes(searchLower) ||
            (unit.deskripsi || "").toLowerCase().includes(searchLower);

        // 2. Cek Dropdown Filter (Menggunakan awalan kode 07 dan 04)
        let matchesDropdown = true;
        if (filterType === "dalam_negeri") {
            matchesDropdown = (unit.kode_unit_kerja || "").startsWith("07");
        } else if (filterType === "luar_negeri") {
            matchesDropdown = (unit.kode_unit_kerja || "").startsWith("04");
        }

        // Harus lolos pencarian teks DAN lolos dropdown
        return matchesSearch && matchesDropdown;
    });

    // Reset halaman ke 1 setiap kali user mengetik pencarian ATAU mengganti dropdown
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    // PAGINATION MENGGUNAKAN filteredUnits
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUnits = filteredUnits.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const response = await api.get(endpoints.unitKerja);
            const result = response.data.data || [];
            setUnits(result);
            setCurrentPage(1);
            setSearchTerm("");
            setFilterType("all"); // Reset dropdown saat refresh data
        } catch (error) {
            console.error("Gagal mengambil data unit kerja:", error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (unit) => {
        setEditData({
            id: unit.id,
            kode_unit_kerja: unit.kode_unit_kerja || "",
            nama_unit_kerja: unit.nama_unit_kerja || "",
            alamat: unit.alamat || "",
            telepon: unit.telepon || "",
            fax: unit.fax || "",
            email: unit.email || "",
            website: unit.website || "",
            hari_kerja: unit.hari_kerja || "",
            beda_jam: unit.beda_jam || "",
            deskripsi: unit.deskripsi || "",
        });
        setIsEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await api.put(
                endpoints.unitKerjaById(editData.id),
                editData,
            );
            setIsEditModalOpen(false);
            fetchUnits();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data Unit Kerja berhasil diperbarui.',
                confirmButtonColor: '#0ea5e9'
            });

        } catch (error) {
            console.error("Gagal mengupdate data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Gagal menyimpan data. Silakan periksa koneksi atau console.',
                confirmButtonColor: '#0ea5e9'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full text-slate-700 relative">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Daftar Unit Kerja
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Total {filteredUnits.length} unit tersedia
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Kotak Pencarian */}
                    <div className="w-full sm:w-64">
                        <Input
                            type="text"
                            placeholder="Cari unit kerja..."
                            aria-label="Cari unit kerja"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="sm"
                            className="h-9"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            }
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Dropdown Filter Jenis Unit Kerja */}
                        <div className="relative w-full sm:w-40">
                            <select
                                value={filterType} // Bind state ke select value
                                onChange={(e) => setFilterType(e.target.value)} // Update state saat dipilih
                                className="select select-sm w-full py-2 px-4 bg-white text-slate-700 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none rounded-xl"
                                style={{ height: '36px' }}
                            >
                                <option value="all">Semua</option>
                                <option value="dalam_negeri">Dalam Negeri</option>
                                <option value="luar_negeri">Luar Negeri</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabel */}
            <div className="w-full overflow-x-auto border-t border-slate-100">
                <table className="w-full text-left border-collapse min-w-[850px] md:min-w-[1000px] table-auto">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-4 py-4 border-b border-slate-100 w-12 text-center">
                                No
                            </th>
                            <th className="px-4 py-4 border-b border-slate-100">
                                Nama Unit Kerja
                            </th>
                            <th className="px-4 py-4 border-b border-slate-100">
                                Email
                            </th>
                            <th className="px-4 py-4 border-b border-slate-100">
                                Telepon
                            </th>
                            <th className="px-4 py-4 border-b border-slate-100">
                                Alamat
                            </th>
                            <th className="px-4 py-4 border-b border-slate-100">
                                Website
                            </th>
                            <th className="px-4 py-4 border-b border-slate-100 w-16 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-10">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="p-10 text-center">
                                    <span className="loading loading-spinner text-sky-500"></span>
                                    <p className="text-xs mt-2 text-slate-400">
                                        Memuat data unit...
                                    </p>
                                </td>
                            </tr>
                        ) : filteredUnits.length > 0 ? (
                            currentUnits.map((unit, index) => (
                                <tr
                                    key={unit.id || index}
                                    className="hover:bg-sky-50/40 transition-colors group align-middle"
                                >
                                    <td className="px-4 py-3 text-sm text-center text-slate-500">
                                        {indexOfFirst + index + 1}
                                    </td>

                                    <td className="px-4 py-3 text-sm font-bold text-slate-700 w-[200px]">
                                        <div
                                            className="tooltip tooltip-right before:normal-case"
                                            data-tip={unit.deskripsi}
                                        >
                                            <div className="line-clamp-2 leading-snug text-left w-[180px]">
                                                {unit.nama_unit_kerja || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600 w-[70px]">
                                        <div
                                            className="tooltip tooltip-top before:content-[attr(data-tip)] before:normal-case"
                                            data-tip={unit.email}
                                        >
                                            <div className="truncate text-left w-[70px] leading-relaxed italic">
                                                {unit.email || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600 w-[70px]">
                                        <div
                                            className="tooltip tooltip-top before:content-[attr(data-tip)] before:normal-case"
                                            data-tip={unit.telepon}
                                        >
                                            <div className="truncate text-left w-[70px] leading-relaxed italic">
                                                {unit.telepon || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600 w-[150px]">
                                        <div
                                            className="tooltip tooltip-top before:normal-case"
                                            data-tip={unit.alamat}
                                        >
                                            <div className="truncate text-left w-[150px] leading-relaxed italic">
                                                {unit.alamat || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-sky-600 w-[150px]">
                                        <div
                                            className="tooltip tooltip-left before:normal-case"
                                            data-tip={unit.website}
                                        >
                                            <div className="truncate text-left w-[130px] underline decoration-sky-100 underline-offset-4">
                                                {unit.website || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-[#f6fbff] transition-colors shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal(unit)}
                                            className="px-2 text-amber-500 hover:bg-amber-100"
                                            title="Edit Unit Kerja"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                                                />
                                            </svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="p-10 text-center text-slate-400 italic"
                                >
                                    Pencarian tidak menemukan hasil.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            {filteredUnits.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredUnits.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={(value) => {
                        setItemsPerPage(value);
                        setCurrentPage(1);
                    }}
                    itemsPerPageOptions={[10, 25, 50, 100]}
                />
            )}

            {/* --- KOMPONEN MODAL EDIT --- */}
            {isEditModalOpen && (
                <Modal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Unit Kerja"
                    size="lg"
                >

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="uk-kode" className="block text-sm font-medium text-slate-700 mb-1">
                                        Kode Unit Kerja
                                    </label>
                                    <Input
                                        id="uk-kode"
                                        type="text"
                                        size="sm"
                                        name="kode_unit_kerja"
                                        value={editData.kode_unit_kerja}
                                        onChange={handleInputChange}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-nama" className="block text-sm font-medium text-slate-700 mb-1">
                                        Nama Unit Kerja
                                    </label>
                                    <Input
                                        id="uk-nama"
                                        type="text"
                                        size="sm"
                                        name="nama_unit_kerja"
                                        value={editData.nama_unit_kerja}
                                        onChange={handleInputChange}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-email" className="block text-sm font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <Input
                                        id="uk-email"
                                        type="email"
                                        size="sm"
                                        name="email"
                                        value={editData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-telepon" className="block text-sm font-medium text-slate-700 mb-1">
                                        Telepon
                                    </label>
                                    <Input
                                        id="uk-telepon"
                                        type="text"
                                        size="sm"
                                        name="telepon"
                                        value={editData.telepon}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-fax" className="block text-sm font-medium text-slate-700 mb-1">
                                        Fax
                                    </label>
                                    <Input
                                        id="uk-fax"
                                        type="text"
                                        size="sm"
                                        name="fax"
                                        value={editData.fax}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-website" className="block text-sm font-medium text-slate-700 mb-1">
                                        Website
                                    </label>
                                    <Input
                                        id="uk-website"
                                        type="text"
                                        size="sm"
                                        name="website"
                                        value={editData.website}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-hari" className="block text-sm font-medium text-slate-700 mb-1">
                                        Hari Kerja
                                    </label>
                                    <Input
                                        id="uk-hari"
                                        type="text"
                                        size="sm"
                                        name="hari_kerja"
                                        value={editData.hari_kerja}
                                        onChange={handleInputChange}
                                        placeholder="Cth: Senin - Jumat"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="uk-jam" className="block text-sm font-medium text-slate-700 mb-1">
                                        Beda Jam
                                    </label>
                                    <Input
                                        id="uk-jam"
                                        type="text"
                                        size="sm"
                                        name="beda_jam"
                                        value={editData.beda_jam}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="uk-alamat" className="block text-sm font-medium text-slate-700 mb-1">
                                    Alamat
                                </label>
                                <Textarea
                                    id="uk-alamat"
                                    name="alamat"
                                    value={editData.alamat}
                                    onChange={handleInputChange}
                                    rows="2"
                                />
                            </div>
                            <div>
                                <label htmlFor="uk-deskripsi" className="block text-sm font-medium text-slate-700 mb-1">
                                    Deskripsi
                                </label>
                                <Textarea
                                    id="uk-deskripsi"
                                    name="deskripsi"
                                    value={editData.deskripsi}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isUpdating}
                                >
                                    {isUpdating
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </Button>
                            </div>
                        </form>
                </Modal>
            )}
        </div>
    );
}