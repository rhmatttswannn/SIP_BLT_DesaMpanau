/* ============================================================
   data-blt.js  –  Admin: Halaman Data BLT
   Endpoint yang dipakai:
     GET    /api/warga            → ambil semua warga (include berkas & notes)
     PATCH  /api/warga/verify/:id → verifikasi (Disetujui / Ditolak)
   ============================================================ */

const API_URL = "http://localhost:8000";
const token   = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../index.html";
}

/* ===== STATE ===== */
let allWarga  = [];       // data asli dari API
let filtered  = [];       // data setelah filter/search
let activeFilter = "all"; // filter aktif saat ini
let selectedWarga = null; // warga yang sedang dibuka di modal

/* ===== ELEMEN ===== */
const loadingState  = document.getElementById("loadingState");
const emptyState    = document.getElementById("emptyState");
const tableContainer= document.getElementById("tableContainer");
const tableBody     = document.getElementById("bltTableBody");
const searchInput   = document.getElementById("searchInput");

/* ===== SWAL HELPER ===== */
const swal = (opts) => Swal.fire(opts);

/* ===== FETCH DATA ===== */
async function fetchData() {
    showLoading();
    try {
        const res = await fetch(`${API_URL}/api/warga`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Unauthorized");

        const result = await res.json();

        // Hanya tampilkan warga yang sudah mengisi form (address / fotoKtp ada)
        allWarga = result.data.filter(w =>
            w.address || w.fotoKtp || w.fotoKk || w.fotoRumah || w.fotoDapur
        );

        applyFilter();
        updateStats();

    } catch (err) {
        console.error(err);
        swal({
            icon: "error",
            title: "Gagal memuat data",
            text: "Tidak dapat terhubung ke server. Silakan coba lagi.",
            confirmButtonColor: "#7b1e1e"
        });
        showEmpty();
    }
}

/* ===== UPDATE HEADER STATS ===== */
function updateStats() {
    document.getElementById("statTotal").textContent    = allWarga.length;
    document.getElementById("statMenunggu").textContent = allWarga.filter(w => w.status === "Menunggu").length;
    document.getElementById("statDisetujui").textContent= allWarga.filter(w => w.status === "Disetujui").length;
    document.getElementById("statDitolak").textContent  = allWarga.filter(w => w.status === "Ditolak").length;
}

/* ===== FILTER ===== */
function setFilter(status, btn) {
    activeFilter = status;

    // toggle class active pada tombol
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    applyFilter();
}

function applyFilter() {
    const q = searchInput.value.trim().toLowerCase();

    filtered = allWarga.filter(w => {
        const matchFilter = activeFilter === "all" || w.status === activeFilter;
        const matchSearch = !q ||
            w.nama.toLowerCase().includes(q) ||
            w.nik.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    renderTable();
}

/* ===== SEARCH ===== */
searchInput.addEventListener("input", applyFilter);

/* ===== RENDER TABLE ===== */
function renderTable() {
    tableBody.innerHTML = "";

    if (filtered.length === 0) {
        showEmpty();
        return;
    }

    showTable();

    filtered.forEach((w, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>
                <div class="cell-nama">${w.nama}</div>
                <div class="cell-nik">${w.nik}</div>
            </td>
            <td>${w.address || '<span style="color:#94A3B8">Belum diisi</span>'}</td>
            <td>${renderBerkas(w)}</td>
            <td>${renderBadge(w.status)}</td>
            <td>
                <div style="display:flex; gap:6px;">
                    <button class="btn-detail" onclick="openModal(${w.id})">
                        <!-- eye -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Detail
                    </button>
                    <button class="btn-hapus" onclick="deleteWarga(${w.id}, '${w.nama.replace(/'/g, "\\'")}')">
                        <!-- trash -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        Hapus
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/* ===== BERKAS INDICATOR ===== */
function renderBerkas(w) {
    const berkas = [
        { label: "KTP",   ada: !!w.fotoKtp   },
        { label: "KK",    ada: !!w.fotoKk    },
        { label: "Rumah", ada: !!w.fotoRumah },
        { label: "Dapur", ada: !!w.fotoDapur },
    ];
    return `<div class="berkas-list">
        ${berkas.map(b => `<span class="berkas-tag ${b.ada ? 'ada' : 'kosong'}">${b.label}</span>`).join("")}
    </div>`;
}

/* ===== STATUS BADGE ===== */
function renderBadge(status) {
    const map = {
        Menunggu:  { cls: "badge-menunggu",  label: "Menunggu"  },
        Disetujui: { cls: "badge-disetujui", label: "Disetujui" },
        Ditolak:   { cls: "badge-ditolak",   label: "Ditolak"   },
    };
    const s = map[status] || { cls: "", label: status };

    // SVG dot sebagai pengganti icon FA
    const svgDot = {
        Menunggu:  `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#B45309"/></svg>`,
        Disetujui: `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#16A34A"/></svg>`,
        Ditolak:   `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#DC2626"/></svg>`,
    };
    const dot = svgDot[status] || `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#94A3B8"/></svg>`;

    return `<span class="badge ${s.cls}">${dot} ${s.label}</span>`;
}

/* ===== SHOW/HIDE STATES ===== */
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
   MODAL DETAIL & VERIFIKASI
   ============================================================ */
async function openModal(wargaId) {
    // cari dari cache berdasarkan warga.id
    selectedWarga = allWarga.find(w => w.id === wargaId) || null;
    if (!selectedWarga) return;

    // Isi header modal
    document.getElementById("modalNama").textContent = selectedWarga.nama;
    document.getElementById("modalNik").textContent  = selectedWarga.nik;

    // Info
    document.getElementById("modalAlamat").textContent   = selectedWarga.address || "-";
    document.getElementById("modalStatusBadge").innerHTML = renderBadge(selectedWarga.status);

    // Foto dokumen
    renderDocPreview("previewKtp",   selectedWarga.fotoKtp,   "fa-id-card",    "Foto KTP");
    renderDocPreview("previewKk",    selectedWarga.fotoKk,    "fa-people-roof","Kartu Keluarga");
    renderDocPreview("previewRumah", selectedWarga.fotoRumah, "fa-house",      "Foto Rumah");
    renderDocPreview("previewDapur", selectedWarga.fotoDapur, "fa-utensils",   "Foto Dapur");

    // Catatan penolakan (notes)
    renderCatatan(selectedWarga.notes || []);

    // Footer: tombol aksi
    renderModalFooter(selectedWarga.status);

    // Buka modal
    document.getElementById("modalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}

/* Render preview foto dokumen */
function renderDocPreview(elId, filePath, iconClass, label) {
    const el = document.getElementById(elId);
    const parentEl = el.closest(".dokumen-item");

    if (filePath) {
        // Normalkan path: ganti backslash → forward slash
        const normalPath = filePath.replace(/\\/g, "/");
        const imgUrl = `${API_URL}/${normalPath}`;

        el.classList.add("has-img");
        el.innerHTML = `
            <img src="${imgUrl}"
                alt="${label}"
                onerror="this.parentElement.innerHTML='<i class=\\'fa-solid ${iconClass} doc-icon\\'></i><span>${label}</span><small style=\\'font-size:11px;color:#94A3B8;\\'>Foto tidak dapat dimuat</small>';this.parentElement.classList.remove('has-img');">
            <div class="doc-img-overlay"><i class="fa-solid fa-eye"></i></div>
        `;
        // aktifkan klik lihat gambar
        if (parentEl) {
            parentEl.dataset.hasImg = "true";
            parentEl.style.cursor = "pointer";
        }
    } else {
        el.classList.remove("has-img");
        el.innerHTML = `
            <i class="fa-solid ${iconClass} doc-icon"></i>
            <span>${label}</span>
            <small style="font-size:11px;color:#94A3B8;">Belum diunggah</small>
        `;
        // nonaktifkan klik
        if (parentEl) {
            parentEl.dataset.hasImg = "false";
            parentEl.style.cursor = "default";
        }
    }
}

/* Render catatan penolakan */
function renderCatatan(notes) {
    const section = document.getElementById("catatanSection");
    const list    = document.getElementById("catatanList");
    list.innerHTML = "";

    if (!notes || notes.length === 0) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";
    notes.forEach(note => {
        const tanggal = new Date(note.createdAt).toLocaleDateString("id-ID", {
            day:   "numeric",
            month: "long",
            year:  "numeric",
            hour:  "2-digit",
            minute:"2-digit"
        });
        list.innerHTML += `
            <div class="catatan-item">
                <p>${note.catatan}</p>
                <small>${tanggal}</small>
            </div>
        `;
    });
}

/* Footer tombol aksi berdasarkan status */
function renderModalFooter(status) {
    const area = document.getElementById("verifikasiArea");
    const verifiedMessage = document.getElementById("verifiedMessage");
    closeTolakForm(); // reset form tolak

    if (status === "Menunggu") {
        // tampilkan tombol setujui & tolak
        document.getElementById("modalFooter").style.display = "flex";
        area.style.display = "flex";
        verifiedMessage.style.display = "none";
    } else {
        // sudah diverifikasi — tampilkan pesan
        const label = status === "Disetujui"
            ? `<i class='fa-solid fa-circle-check' style='color:#16A34A'></i> Pengajuan ini sudah <b>Disetujui</b>`
            : `<i class='fa-solid fa-circle-xmark' style='color:#DC2626'></i> Pengajuan ini sudah <b>Ditolak</b>`;
        
        area.style.display = "none";
        verifiedMessage.innerHTML = `<p class='verified-msg'>${label}</p>`;
        verifiedMessage.style.display = "block";
        document.getElementById("modalFooter").style.display = "flex";
    }
}

/* ===== BUKA FORM TOLAK ===== */
function openTolakForm() {
    document.getElementById("verifikasiArea").style.display = "none";
    document.getElementById("tolakForm").style.display      = "flex";
    document.getElementById("catatanInput").focus();
}

function closeTolakForm() {
    document.getElementById("tolakForm").style.display      = "none";
    document.getElementById("verifikasiArea").style.display = "flex";
    document.getElementById("catatanInput").value = "";
}

/* ===== VERIFIKASI WARGA ===== */
async function verifikasiWarga(status) {
    if (!selectedWarga) return;

    let catatan = "";

    if (status === "Ditolak") {
        catatan = document.getElementById("catatanInput").value.trim();
        if (!catatan) {
            Swal.fire({
                icon: "warning",
                title: "Catatan wajib diisi",
                text: "Harap masukkan alasan penolakan sebelum menolak pengajuan.",
                confirmButtonColor: "#7b1e1e"
            });
            return;
        }
    }

    const konfirmasi = await Swal.fire({
        icon: status === "Disetujui" ? "question" : "warning",
        title: status === "Disetujui"
            ? `Setujui pengajuan ${selectedWarga.nama}?`
            : `Tolak pengajuan ${selectedWarga.nama}?`,
        text: status === "Disetujui"
            ? "Warga akan mendapatkan status Disetujui."
            : `Alasan: "${catatan}"`,
        showCancelButton: true,
        confirmButtonColor: status === "Disetujui" ? "#16A34A" : "#DC2626",
        cancelButtonColor:  "#6B7280",
        confirmButtonText:  status === "Disetujui" ? "Ya, Setujui!" : "Ya, Tolak!",
        cancelButtonText:   "Batal"
    });

    if (!konfirmasi.isConfirmed) return;

    try {
        const body = { status };
        if (status === "Ditolak") body.catatan = catatan;

        const res = await fetch(`${API_URL}/api/warga/verify/${selectedWarga.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const result = await res.json();

        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: result.message || "Terjadi kesalahan",
                confirmButtonColor: "#7b1e1e"
            });
            return;
        }

        // Update cache lokal agar tidak perlu refetch
        const idx = allWarga.findIndex(w => w.id === selectedWarga.id);
        if (idx !== -1) {
            allWarga[idx].status = status;
            if (status === "Ditolak" && body.catatan) {
                allWarga[idx].notes = allWarga[idx].notes || [];
                allWarga[idx].notes.unshift({ catatan, createdAt: new Date().toISOString() });
            }
            selectedWarga = allWarga[idx];
        }

        // Update stats & tabel
        updateStats();
        applyFilter();

        // Simpan nama sebelum selectedWarga di null-kan oleh closeModalBtn
        const wargaNama = selectedWarga.nama;

        // Tutup modal & tampilkan sukses
        closeModalBtn();

        // Gunakan Swal.fire
        Swal.fire({
            icon: "success",
            title: status === "Disetujui" ? "Pengajuan Disetujui!" : "Pengajuan Ditolak",
            text: `Data warga atas nama ${wargaNama} berhasil diperbarui.`,
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {
        console.error("Verifikasi Error:", err);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Tidak dapat terhubung ke server.",
            confirmButtonColor: "#7b1e1e"
        });
    }
}

/* ===== HAPUS WARGA ===== */
async function deleteWarga(id, nama) {
    const konfirmasi = await Swal.fire({
        icon: "warning",
        title: `Hapus Data Warga?`,
        text: `Data pengajuan atas nama "${nama}" akan dihapus secara permanen beserta berkas fotonya.`,
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor:  "#6B7280",
        confirmButtonText:  "Ya, Hapus!",
        cancelButtonText:   "Batal"
    });

    if (!konfirmasi.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/api/warga/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await res.json();

        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "Gagal Menghapus",
                text: result.message || "Terjadi kesalahan pada server",
                confirmButtonColor: "#7b1e1e"
            });
            return;
        }

        // Update local cache
        allWarga = allWarga.filter(w => w.id !== id);
        
        // Update stats & table
        updateStats();
        applyFilter();

        Swal.fire({
            icon: "success",
            title: "Terhapus",
            text: `Data warga atas nama ${nama} berhasil dihapus.`,
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {
        console.error("Delete Error:", err);
        Swal.fire({
            icon: "error",
            title: "Error Koneksi",
            text: "Tidak dapat terhubung ke server untuk menghapus data.",
            confirmButtonColor: "#7b1e1e"
        });
    }
}

/* ===== TUTUP MODAL ===== */
function closeModalBtn() {
    document.getElementById("modalOverlay").classList.remove("open");
    document.body.style.overflow = "";
    selectedWarga = null;
    closeTolakForm();
}

function closeModal(e) {
    // tutup hanya jika klik di overlay (bukan di modal-box)
    if (e.target === document.getElementById("modalOverlay")) {
        closeModalBtn();
    }
}

/* ============================================================
   LIGHTBOX — Viewer Foto Dokumen
   ============================================================ */

// Daftar dokumen yang muncul di lightbox (dibangun saat modal dibuka)
let lbSlides    = [];   // [{ label, src, icon }]
let lbCurrent   = 0;    // index slide aktif

const DOKUMEN_META = [
    { key: "fotoKtp",   label: "Foto KTP",      icon: "fa-id-card"    },
    { key: "fotoKk",    label: "Kartu Keluarga", icon: "fa-people-roof"},
    { key: "fotoRumah", label: "Foto Rumah",     icon: "fa-house"      },
    { key: "fotoDapur", label: "Foto Dapur",     icon: "fa-utensils"   },
];

/* Bangun slides dari data warga yang sedang dibuka */
function buildSlides(warga) {
    lbSlides = DOKUMEN_META.map(m => ({
        label : m.label,
        icon  : m.icon,
        src   : warga[m.key]
            ? `${API_URL}/${warga[m.key].replace(/\\/g, "/")}`
            : null,
    }));
}

/* Buka lightbox pada slide tertentu */
function openLightbox(startIndex) {
    if (!selectedWarga) return;

    buildSlides(selectedWarga);
    lbCurrent = startIndex;

    renderLbThumbs();
    lbGoto(lbCurrent);

    document.getElementById("lightbox").classList.add("open");
    document.body.style.overflow = "hidden";
}

/* Render strip thumbnail bawah */
function renderLbThumbs() {
    const strip = document.getElementById("lbThumbs");
    strip.innerHTML = "";

    lbSlides.forEach((slide, i) => {
        const div = document.createElement("div");
        div.className = "lb-thumb" + (slide.src ? "" : " empty");
        div.title = slide.label;

        if (slide.src) {
            div.innerHTML = `<img src="${slide.src}" alt="${slide.label}"
                onerror="this.parentElement.classList.add('empty');this.remove()">`;
            div.onclick = () => lbGoto(i);
        } else {
            div.innerHTML = `
                <i class="fa-solid ${slide.icon}"></i>
                <span>${slide.label.split(" ")[0]}</span>`;
        }

        strip.appendChild(div);
    });
}

/* Pindah ke slide ke-i */
function lbGoto(i) {
    lbCurrent = i;
    const slide = lbSlides[i];

    const img      = document.getElementById("lbImg");
    const spinner  = document.getElementById("lbSpinner");
    const label    = document.getElementById("lbLabel");
    const counter  = document.getElementById("lbCounter");
    const dlBtn    = document.getElementById("lbDownloadBtn");
    const prevBtn  = document.querySelector(".lb-prev");
    const nextBtn  = document.querySelector(".lb-next");

    // Update label & counter
    label.textContent   = slide.label;
    counter.textContent = `${i + 1} / ${lbSlides.length}`;

    // Aktif thumbnail
    document.querySelectorAll(".lb-thumb").forEach((t, ti) => {
        t.classList.toggle("active", ti === i);
    });

    // Tombol nav
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === lbSlides.length - 1);

    if (slide.src) {
        // Tampilkan spinner, sembunyikan gambar
        img.style.opacity = "0";
        spinner.style.display = "flex";

        img.onload = () => {
            spinner.style.display = "none";
            img.style.opacity     = "1";
            img.style.animation   = "lbImgIn 0.25s ease";
        };
        img.onerror = () => {
            spinner.style.display = "none";
            img.style.opacity     = "1";
        };

        img.src = slide.src;

        // Simpan src ke dataset tombol download
        if (dlBtn) {
            dlBtn.dataset.src      = slide.src;
            dlBtn.dataset.filename = slide.label.replace(/\s/g, "_") + ".jpg";
            dlBtn.style.display    = "flex";
        }
    } else {
        // Tidak ada foto
        spinner.style.display = "none";
        img.src               = "";
        img.style.opacity     = "1";
        if (dlBtn) dlBtn.style.display = "none";
    }
}

/* Navigasi prev / next */
function lbNavigate(dir) {
    const next = lbCurrent + dir;
    if (next < 0 || next >= lbSlides.length) return;
    lbGoto(next);
}

/* ===== DOWNLOAD foto via blob (cross-origin safe) ===== */
async function lbDownload() {
    const btn      = document.getElementById("lbDownloadBtn");
    const src      = btn?.dataset.src;
    const filename = btn?.dataset.filename || "foto.jpg";
    if (!src) return;

    const labelEl = btn?.querySelector(".lb-btn-text");
    if (labelEl) labelEl.textContent = "Mengunduh...";
    btn.disabled = true;

    try {
        const res  = await fetch(src, { cache: "force-cache" });
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
        console.error("Download gagal:", err);
        swal({ icon: "error", title: "Gagal mengunduh", text: "Coba lagi nanti.", confirmButtonColor: "#7b1e1e" });
    } finally {
        if (labelEl) labelEl.textContent = "Unduh";
        btn.disabled = false;
    }
}

/* Tutup lightbox */
function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
}

function closeLightboxOverlay(e) {
    if (e.target === document.getElementById("lightbox")) {
        closeLightbox();
    }
}

/* Keyboard: Esc=tutup, ←/→=navigasi */
document.addEventListener("keydown", (e) => {
    if (!document.getElementById("lightbox").classList.contains("open")) return;
    if (e.key === "Escape")     closeLightbox();
    if (e.key === "ArrowLeft")  lbNavigate(-1);
    if (e.key === "ArrowRight") lbNavigate(1);
});

/* Klik dokumen-item di modal → buka lightbox */
function viewImage(el) {
    if (el.dataset.hasImg === "false") return; // belum ada foto

    // Cari index slide berdasarkan previewId
    const previewId = el.querySelector("[id^='preview']")?.id;
    const idxMap = { previewKtp: 0, previewKk: 1, previewRumah: 2, previewDapur: 3 };
    const startIdx = (previewId !== undefined && idxMap[previewId] !== undefined)
        ? idxMap[previewId]
        : 0;

    openLightbox(startIdx);
}

/* ===== INIT ===== */
fetchData();
