

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
        document.querySelector(".profile span").innerText = data.username;

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
function logout() {
    if (confirm("Yakin ingin logout?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../index.html";
    }
}
