const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "USER") {
    window.location.href = "../index.html";
}

const API_URL = "http://localhost:8000";

async function validateUser() {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        if (data.data.role !== "USER") {
            throw new Error();
        }

    } catch (err) {
        localStorage.clear();
        window.location.href = "../../index.html";
    }
}

validateUser();


function loadPage(page, element) {
    const iframe = document.getElementById('contentFrame');
    iframe.src = page;

    // remove active
    document.querySelectorAll('.menu li').forEach(li => {
        li.classList.remove('active');
    });

    // add active
    element.classList.add('active');
}

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
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "../../index.html";
    }
}

