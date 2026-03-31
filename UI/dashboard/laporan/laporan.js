/* ============================================================
   laporan.js  –  Admin: Halaman Laporan BLT
   Endpoints:
     GET  /api/warga          → data lengkap warga
     GET  /api/warga/export/pdf → download PDF dari server
   ============================================================ */

const API_URL = "http://localhost:8000";
const token   = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../index.html";
}

/* ===== STATE ===== */
let allData    = [];   // data asli dari API
let filtered   = [];   // setelah filter & search

/* ===== ELEMEN ===== */
const loadingState   = document.getElementById("loadingState");
const emptyState     = document.getElementById("emptyState");
const tableContainer = document.getElementById("tableContainer");
const laporanBody    = document.getElementById("laporanBody");
const searchInput    = document.getElementById("searchInput");
const filterStatus   = document.getElementById("filterStatus");
const countLabel     = document.getElementById("countLabel");

/* ===== FETCH ===== */
async function fetchData() {
    showLoading();
    try {
        const res = await fetch(`${API_URL}/api/warga`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Unauthorized");

        const result = await res.json();

        // Hanya warga yang sudah mengisi form (ada address atau berkas)
        allData = result.data.filter(w =>
            w.address || w.fotoKtp || w.fotoKk || w.fotoRumah || w.fotoDapur
        );

        updateStats();
        applyFilter();

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Gagal memuat data", text: "Tidak dapat terhubung ke server.", confirmButtonColor: "#7b1e1e" });
        showEmpty();
    }
}

/* ===== STATS ===== */
function updateStats() {
    document.getElementById("statTotal").textContent     = allData.length;
    document.getElementById("statDisetujui").textContent = allData.filter(w => w.status === "Disetujui").length;
    document.getElementById("statMenunggu").textContent  = allData.filter(w => w.status === "Menunggu").length;
    document.getElementById("statDitolak").textContent   = allData.filter(w => w.status === "Ditolak").length;

    // Animasi count-up
    animateNumbers();
}

function animateNumbers() {
    document.querySelectorAll(".stat-num").forEach(el => {
        const target = parseInt(el.textContent) || 0;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 20));
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current >= target) clearInterval(timer);
        }, 30);
    });
}

/* ===== FILTER & SEARCH ===== */
searchInput.addEventListener("input", applyFilter);

function applyFilter() {
    const q      = searchInput.value.trim().toLowerCase();
    const status = filterStatus.value;

    filtered = allData.filter(w => {
        const matchStatus = status === "all" || w.status === status;
        const matchSearch = !q ||
            w.nama.toLowerCase().includes(q) ||
            w.nik.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    renderTable();
}

/* ===== RENDER TABLE ===== */
function renderTable() {
    laporanBody.innerHTML = "";

    if (filtered.length === 0) {
        showEmpty();
        countLabel.textContent = "0";
        return;
    }

    showTable();
    countLabel.textContent = filtered.length;

    filtered.forEach((w, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="td-no">${idx + 1}</td>
            <td>
                <div class="cell-nama">${w.nama}</div>
                <div class="cell-nik">${w.nik}</div>
            </td>
            <td>${w.nik}</td>
            <td>${w.address || '<span class="text-soft">Belum diisi</span>'}</td>
            <td>${renderBerkas(w)}</td>
            <td>${renderBadge(w.status)}</td>
        `;
        laporanBody.appendChild(row);
    });
}

/* ===== BERKAS ===== */
function renderBerkas(w) {
    const list = [
        { label: "KTP",   ada: !!w.fotoKtp   },
        { label: "KK",    ada: !!w.fotoKk    },
        { label: "Rumah", ada: !!w.fotoRumah },
        { label: "Dapur", ada: !!w.fotoDapur },
    ];
    return `<div class="berkas-list">
        ${list.map(b => `<span class="berkas-tag ${b.ada ? 'ada' : 'kosong'}">${b.label}</span>`).join("")}
    </div>`;
}

/* ===== BADGE ===== */
function renderBadge(status) {
    const map = {
        Disetujui: { cls: "badge-disetujui", dot: "#16A34A" },
        Menunggu:  { cls: "badge-menunggu",  dot: "#B45309" },
        Ditolak:   { cls: "badge-ditolak",   dot: "#DC2626" },
    };
    const s   = map[status] || { cls: "", dot: "#94A3B8" };
    const dot = `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${s.dot}"/></svg>`;
    return `<span class="badge ${s.cls}">${dot} ${status || "-"}</span>`;
}

/* ===== STATES ===== */
function showLoading() {
    loadingState.style.display   = "flex";
    emptyState.style.display     = "none";
    tableContainer.style.display = "none";
}
function showEmpty() {
    loadingState.style.display   = "none";
    emptyState.style.display     = "flex";
    tableContainer.style.display = "none";
}
function showTable() {
    loadingState.style.display   = "none";
    emptyState.style.display     = "none";
    tableContainer.style.display = "block";
}

/* ============================================================
   EXPORT PDF — generate di frontend dengan jsPDF
   ============================================================ */
function exportPDF() {
    if (filtered.length === 0) {
        Swal.fire({ icon: "warning", title: "Data kosong", text: "Tidak ada data untuk diekspor.", confirmButtonColor: "#7b1e1e" });
        return;
    }

    const btn = document.getElementById("btnPdf");
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-loading"></span> Menyiapkan PDF...`;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Judul Dokumen
        doc.setFontSize(16);
        doc.text("Laporan Data Warga (BLT)", 105, 15, { align: "center" });
        doc.setFontSize(10);
        const tglCetak = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Tanggal Dicetak: ${tglCetak}`, 105, 22, { align: "center" });

        // Generate data baris tabel
        const tableBody = filtered.map((w, idx) => [
            idx + 1,
            w.nik,
            w.nama,
            w.address || "-",
            w.status
        ]);

        // AutoTable plugin
        doc.autoTable({
            startY: 30,
            head: [['No', 'NIK', 'Nama Lengkap', 'Alamat', 'Status']],
            body: tableBody,
            headStyles: { fillColor: [123, 30, 30] }, // Warna merah maroon
            theme: 'striped',
            styles: { fontSize: 9 }
        });

        // Unduh File
        doc.save(`Laporan_BLT_${formatTanggalFile()}.pdf`);

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Gagal", text: "Tidak dapat membuat file PDF.", confirmButtonColor: "#7b1e1e" });
    } finally {
        btn.disabled  = false;
        btn.innerHTML = origText;
    }
}

/* ============================================================
   EXPORT EXCEL — generate di frontend dengan SheetJS
   ============================================================ */
function exportExcel() {
    if (filtered.length === 0) {
        Swal.fire({ icon: "warning", title: "Data kosong", text: "Tidak ada data untuk diekspor.", confirmButtonColor: "#7b1e1e" });
        return;
    }

    const btn = document.getElementById("btnExcel");
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-loading"></span> Menyiapkan...`;

    try {
        // Buat array untuk sheet
        const rows = filtered.map((w, idx) => ({
            "No"              : idx + 1,
            "Nama Lengkap"    : w.nama,
            "NIK"             : w.nik,
            "Alamat"          : w.address || "-",
            "Foto KTP"        : w.fotoKtp   ? "Ada" : "Belum",
            "Foto KK"         : w.fotoKk    ? "Ada" : "Belum",
            "Foto Rumah"      : w.fotoRumah ? "Ada" : "Belum",
            "Foto Dapur"      : w.fotoDapur ? "Ada" : "Belum",
            "Status Pengajuan": w.status,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);

        // Lebar kolom
        ws["!cols"] = [
            { wch: 5 }, { wch: 28 }, { wch: 20 }, { wch: 35 },
            { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 16 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Laporan BLT");
        XLSX.writeFile(wb, `Laporan_BLT_${formatTanggalFile()}.xlsx`);

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Gagal", text: "Tidak dapat membuat file Excel.", confirmButtonColor: "#7b1e1e" });
    } finally {
        btn.disabled  = false;
        btn.innerHTML = origText;
    }
}

/* ===== HELPER: format tanggal untuk nama file ===== */
function formatTanggalFile() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
}

/* ===== INIT ===== */
fetchData();
