const API_URL = "http://localhost:8000";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../index.html";
}

const wargaTable = document.getElementById("wargaTable");
const pagination = document.getElementById("pagination");
const form = document.getElementById("wargaForm");

const dataPerPage = 10;
let currentPage = 1;
let wargaData = [];

// ================= FETCH DATA =================
async function fetchWarga() {
    try {
        const res = await fetch(`${API_URL}/api/warga`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Unauthorized");

        const result = await res.json();
        wargaData = result.data;

        renderTable();
        renderPagination();
    } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        window.location.href = "../index.html";
    }
}

// ================= RENDER TABLE =================
function renderTable() {
    wargaTable.innerHTML = "";

    const start = (currentPage - 1) * dataPerPage;
    const end = start + dataPerPage;
    const data = wargaData.slice(start, end);

    data.forEach(w => {
        wargaTable.innerHTML += `
            <tr>
                <td>${w.nama}</td>
                <td>${w.nik}</td>
                <td class="token">
                ${w.token ? `
                    <span class="token-text" style="display:none;">${w.token}</span>
                    <button class="icon-btn" onclick="toggleToken(this)">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                ` : "-"}
            </td>
                <td class="status active">Aktif</td>
            </tr>
        `;
    });
}

function toggleToken(btn) {
    const span = btn.parentElement.querySelector(".token-text");
    const icon = btn.querySelector("i");

    if (span.style.display === "none") {
        span.style.display = "inline";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        span.style.display = "none";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// ================= PAGINATION =================
function renderPagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(wargaData.length / dataPerPage);

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <button onclick="goToPage(${i})"
                class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

// ================= GENERATE WARGA =================
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nama = document.getElementById("nama").value;
    const nik = document.getElementById("nik").value;

    try {
        const res = await fetch(`${API_URL}/api/warga/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nik, nama })
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.message);
            return;
        }

       // Tambahkan warga baru ke awal array
        wargaData.unshift({
            nama: result.data.nama,
            nik: result.data.nik,
            token: result.data.password_token,
            status: "Aktif"
        });

        // Reset ke halaman pertama
        currentPage = 1;

        renderTable();
        renderPagination();

        form.reset();
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan");
    }
});

// INIT
fetchWarga();