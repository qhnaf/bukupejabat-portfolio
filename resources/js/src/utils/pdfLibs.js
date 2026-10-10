// Library PDF berat (jspdf + jspdf-autotable) dimuat saat dibutuhkan saja,
// supaya tidak ikut membesarkan chunk utama aplikasi.
export async function loadPdfLibs() {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
    ]);
    return { jsPDF, autoTable };
}
