/* ============================================================
   status.js  –  Warga: Halaman Status Pengajuan
   Endpoints: GET /api/auth/me -> GET /api/warga/:userId
   ============================================================ */

const API_URL = "http://localhost:8000";
const token   = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../index.html";
}

async function fetchStatus() {
    try {
        // 1. Get logged in User
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error("Gagal load profile");
        const meData = await meRes.json();
        const userId = meData.data.id;
        
        // 2. Get Warga Data using the userId
        const wargaRes = await fetch(`${API_URL}/api/warga/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!wargaRes.ok) throw new Error("Gagal load warga detail");
        const wargaData = await wargaRes.json();
        const w = wargaData.data;

        // --- UPDATE PROFILE (TOP BAR) ---
        document.getElementById("profileName").innerText = w.nama || meData.data.username;
        const initials = (w.nama || meData.data.username).substring(0,2).toUpperCase();
        document.getElementById("profileAvatar").innerText = initials;

        // --- UPDATE STATUS CARD ---
        const badge = document.getElementById("headerBadge");
        const valNama = document.getElementById("valNama");
        const valNik = document.getElementById("valNik");
        const valStatus = document.getElementById("valStatus");
        const noteDesc = document.getElementById("noteDesc");
        const updateTime = document.getElementById("updateTime");
        const btnPerbarui = document.getElementById("btnPerbarui");

        valNama.innerText = w.nama || "-";
        valNik.innerText = w.nik || "-";

        btnPerbarui.style.display = "none"; // Default disembunyikan

        // set up badges and colors
        if (w.status === "Disetujui") {
            badge.className = "badge success";
            badge.innerText = "DISETUJUI";
            valStatus.className = "status success";
            valStatus.innerHTML = `<i class="fa-solid fa-circle"></i> Disetujui`;
            noteDesc.innerHTML = `Selamat! Pengajuan Anda telah <b>Disetujui</b> dan akan segera dicairkan. Silakan menunggu informasi lebih lanjut dari desa.`;
        } else if (w.status === "Ditolak") {
            badge.className = "badge";
            badge.style.background = "var(--danger-bg)";
            badge.style.color = "var(--danger)";
            badge.innerText = "DITOLAK";
            valStatus.className = "status";
            valStatus.style.color = "var(--danger)";
            valStatus.innerHTML = `<i class="fa-solid fa-circle"></i> Ditolak`;
            
            // Catatan penolakan
            let alasan = "Ada kendala dengan pengajuan Anda.";
            if (w.notes && w.notes.length > 0) {
                alasan = `Alasan penolakan: <b>${w.notes[0].catatan}</b>`;
            }
            noteDesc.innerHTML = `Mohon maaf, pengajuan Anda ditolak. ${alasan} Silakan perbarui data Anda melalui menu Pengajuan BLT.`;
            
            // Tampilkan tombol perbarui
            btnPerbarui.style.display = "inline-block";
        } else {
            // Menunggu atau Pengecekan
            badge.className = "badge";
            badge.style.background = "#FEF9C3";
            badge.style.color = "#B45309";
            badge.innerText = "MENUNGGU VERIFIKASI";
            valStatus.className = "status";
            valStatus.style.color = "#B45309";
            valStatus.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Menunggu`;
            noteDesc.innerHTML = `Data pengajuan Anda telah kami terima dan saat ini sedang dalam proses verifikasi. Harap mengecek halaman ini secara berkala.`;
        }

        updateTime.innerText = `Terakhir diperbarui: ` + new Date().toLocaleTimeString('id-ID') + ` WIB`;

    } catch (err) {
        console.error(err);
        document.getElementById("noteDesc").innerHTML = `<span style="color:red;">Gagal memuat status pengajuan. Silakan coba lagi nanti.</span>`;
    }
}

fetchStatus();
