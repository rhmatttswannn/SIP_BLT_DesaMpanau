

// ================= AUTH CHECK =================
const API_URL = "http://localhost:8000";
const token = localStorage.getItem("token");

const role = localStorage.getItem("role");

if (role !== "ADMIN") {
    window.location.href = "../index.html";
}

async function validateToken() {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Invalid");

        const data = await res.json();
        document.querySelector(".profile span").innerText = data.data.username || "Admin";

    } catch (err) {
        localStorage.removeItem("token");
        window.location.href = "../index.html";
    }
}

validateToken();



// ================= SIDEBAR TOGGLE =================
const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const frame = document.getElementById('contentFrame');
const menuItems = document.querySelectorAll('.menu li');

toggle.onclick = () => {
    sidebar.classList.toggle('active');
};

// ================= LOAD PAGE =================
function loadPage(page, el) {
    frame.src = page;

    menuItems.forEach(li => li.classList.remove('active'));
    el.classList.add('active');

    // auto close sidebar di mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
}

// ================= LOGOUT =================
async function logout() {
    const result = await Swal.fire({
        title: "Yakin ingin logout?",
        text: "Anda akan keluar dari sesi saat ini.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7b1e1e",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Logout",
        cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../index.html";
    }
}
