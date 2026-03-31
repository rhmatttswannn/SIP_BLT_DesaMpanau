/* ============================================================
   dashboard-home.js  –  Admin Dashboard Overview
   Endpoints: GET /api/warga
   ============================================================ */

const API_URL = "http://localhost:8000";
const token   = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../index.html";
}

let wargas = [];

async function fetchData() {
    try {
        const res = await fetch(`${API_URL}/api/warga`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Unauthorized");

        const result = await res.json();
        
        // Filter out those who haven't filled out the form (we count actual applicants)
        wargas = result.data.filter(w => 
            w.address || w.fotoKtp || w.fotoKk || w.fotoRumah || w.fotoDapur
        );

        renderStats();
        renderChart();
        renderTable();

        document.getElementById("loadingState").style.display = "none";
        document.getElementById("dashboardContent").style.display = "block";

    } catch (err) {
        console.error(err);
        Swal.fire({ 
            icon: "error", 
            title: "Gagal memuat data", 
            text: "Tidak dapat terhubung ke server untuk mengambil statistik dashboard." 
        });
    }
}

function renderStats() {
    const disetujui = wargas.filter(w => w.status === "Disetujui").length;
    const menunggu  = wargas.filter(w => w.status === "Menunggu").length;
    const ditolak   = wargas.filter(w => w.status === "Ditolak").length;

    animateValue("valTotalWarga", 0, wargas.length, 600);
    animateValue("valDisetujui", 0, disetujui, 600);
    animateValue("valMenunggu", 0, menunggu, 600);
    animateValue("valDitolak", 0, ditolak, 600);
}

function renderChart() {
    const disetujui = wargas.filter(w => w.status === "Disetujui").length;
    const menunggu  = wargas.filter(w => w.status === "Menunggu").length;
    const ditolak   = wargas.filter(w => w.status === "Ditolak").length;

    const ctx = document.getElementById('bltChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Disetujui', 'Menunggu', 'Ditolak'],
            datasets: [{
                data: [disetujui, menunggu, ditolak],
                backgroundColor: [
                    '#16A34A', // success
                    '#B45309', // warning
                    '#DC2626'  // danger
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12, family: "'Inter', sans-serif" }
                    }
                }
            }
        }
    });
}

function renderTable() {
    const tb = document.getElementById("recentTableBody");
    tb.innerHTML = "";

    // urutkan berdasarkan update / ID terbaru dan ambil 5
    const uprec = [...wargas].sort((a,b) => b.id - a.id).slice(0, 5);

    if (uprec.length === 0) {
        tb.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#94A3B8;">Belum ada data pengajuan</td></tr>`;
        return;
    }

    uprec.forEach(w => {
        // hitung berkas
        let count = 0;
        if(w.fotoKtp) count++;
        if(w.fotoKk) count++;
        if(w.fotoRumah) count++;
        if(w.fotoDapur) count++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="cell-nama">${w.nama}</div>
                <div class="cell-nik">${w.nik}</div>
            </td>
            <td>${renderBadge(w.status)}</td>
            <td><span class="text-berkas">${count} dari 4 Berkas</span></td>
        `;
        tb.appendChild(tr);
    });
}

function renderBadge(status) {
    const map = {
        Disetujui: { cls: "badge-disetujui", dot: "#16A34A" },
        Menunggu:  { cls: "badge-menunggu",  dot: "#B45309" },
        Ditolak:   { cls: "badge-ditolak",   dot: "#DC2626" },
    };
    const s   = map[status] || { cls: "", dot: "#94A3B8" };
    const dot = `<svg width="6" height="6" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${s.dot}"/></svg>`;
    return `<span class="badge ${s.cls}">${dot} ${status || "-"}</span>`;
}

// Helper Number Animation
function animateValue(id, start, end, duration) {
    if (start === end) {
        document.getElementById(id).innerHTML = end;
        return;
    }
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

fetchData();
