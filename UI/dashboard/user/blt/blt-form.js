const API_URL = "http://localhost:8000";
const API_UPLOAD = `${API_URL}/api/warga/uploadForm`;

const form = document.getElementById("userBLTForm");
const successBox = document.getElementById("successMessage");

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../../index.html";
}

// Cegah manipulasi/membuka iframe secara langsung 
if (window.self === window.top) {
    window.location.href = "../user.html";
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

const btnSubmit = document.getElementById("submitBtn");

btnSubmit.addEventListener("click", async (e) => {
    // Validasi HTML5 wajib jalan sebelum dikirim
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // --- OPTIMASI: Validasi ukuran dan tipe file di sisi klien (Frontend) ---
    const maxMB = 2;
    const maxBytes = maxMB * 1024 * 1024;
    const fileInputs = [
        { el: form.fotoKtp, label: "Foto KTP" },
        { el: form.fotoKk, label: "Foto KK" },
        { el: form.fotoRumah, label: "Foto Rumah" },
        { el: form.fotoDapur, label: "Foto Dapur" }
    ];

    for (let item of fileInputs) {
        if (item.el.files && item.el.files.length > 0) {
            const file = item.el.files[0];
            
            // Cek ukuran
            if (file.size > maxBytes) {
                Swal.fire({
                    icon: "warning",
                    title: "Ukuran Terlalu Besar",
                    text: `${item.label} (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal ${maxMB} MB. Silakan kompres gambar Anda terlebih dahulu.`,
                    confirmButtonColor: "#7b1e1e"
                });
                return; // Stop proses pengiriman
            }

            // Cek format gambar
            if (!file.type.startsWith("image/")) {
                Swal.fire({
                    icon: "warning",
                    title: "Format Tidak Sesuai",
                    text: `${item.label} harus berupa file gambar (JPG/PNG).`,
                    confirmButtonColor: "#7b1e1e"
                });
                return; // Stop proses pengiriman
            }
        }
    }

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

        // Coba tangkap response json dari server
        let result;
        try {
            result = await res.json();
        } catch (e) {
            // Jika crash/format HTML dari nginx/multer yg tidak dihandle, fallback
            throw new Error("Gagal membaca respons dari server. Pastikan ukuran file Anda tidak terlalu besar.");
        }

        if (res.ok) {
            form.style.display = "none";
            successBox.style.display = "block";
            successBox.style.color = "green";
            successBox.innerHTML = `✅ Pengajuan berhasil dikirim. Silakan tunggu verifikasi dan pantau di menu Status Pengajuan.`;
            
            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Data pengajuan Anda berhasil diunggah!",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            // Jika res tidak ok (400, 413, 500 dll)
            throw new Error(result.message || "Terjadi kesalahan saat mengunggah formulir.");
        }

    } catch (error) {
        console.error("Upload error:", error);
        Swal.fire({
            icon: "error",
            title: "Pengajuan Gagal",
            text: error.message || "Tidak dapat terhubung ke server.",
            confirmButtonColor: "#7b1e1e"
        });
    } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
    }
});