const API_URL = "http://localhost:8000";
const API_UPLOAD = `${API_URL}/api/warga/uploadForm`;

const form = document.getElementById("userBLTForm");
const successBox = document.getElementById("successMessage");

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../../index.html";
}

// Cek status warga saat form dibuka
window.addEventListener("load", async () => {
    try {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error("Gagal auth me");
        const meData = await meRes.json();
        const userId = meData.data.id;

        const wargaRes = await fetch(`${API_URL}/api/warga/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!wargaRes.ok) throw new Error("Gagal load warga");
        const wData = await wargaRes.json();
        const w = wData.data;

        // Jika form sudah diisi (ada fotoKtp) DAN statusnya BUKAN ditolak, sembunyikan form
        if (w.fotoKtp && w.status !== "Ditolak") {
            form.style.display = "none";
            successBox.style.display = "block";
            successBox.innerHTML = `✅ Anda sudah melakukan pengajuan BLT dan status Anda saat ini adalah <b>${w.status}</b>. Silakan cek menu Status Pengajuan.`;
        } else if (w.status === "Ditolak") {
            let alasan = "Ada kendala pada berkas Anda.";
            if (w.notes && w.notes.length > 0) {
                alasan = w.notes[0].catatan;
            }
            // Jika ditolak, boleh perbarui, beri info
            successBox.style.display = "block";
            successBox.style.color = "#DC2626"; // merah agar jelas
            successBox.innerHTML = `⚠️ Pengajuan Anda sebelumnya <b>Ditolak</b>.<br><b>Alasan:</b> <i>${alasan}</i><br><br>Silakan unggah ulang data terbaru Anda di bawah ini:`;
        }

    } catch(err) {
        console.error("Cek status form error:", err);
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("address", form.address.value);
    formData.append("fotoKtp", form.fotoKtp.files[0]);
    formData.append("fotoKk", form.fotoKk.files[0]);
    formData.append("fotoRumah", form.fotoRumah.files[0]);
    formData.append("fotoDapur", form.fotoDapur.files[0]);

    // disable button temporarily
    const btn = form.querySelector(".btn-submit");
    const origText = btn.innerHTML;
    btn.innerHTML = `Mengirim...`;
    btn.disabled = true;

    try {
        const res = await fetch(API_UPLOAD, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const result = await res.json();

        if (res.ok) {
            form.style.display = "none";
            successBox.style.display = "block";
            successBox.style.color = "green";
            successBox.innerHTML = `✅ Pengajuan berhasil dikirim. Silakan tunggu verifikasi dan pantau di menu Status Pengajuan.`;
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Upload error:", error);
    } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
    }
});