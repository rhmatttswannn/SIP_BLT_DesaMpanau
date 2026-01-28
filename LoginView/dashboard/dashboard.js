// SIDEBAR TOGGLE
const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

toggle.onclick = () => {
    sidebar.classList.toggle('active');
};

function loadPage(page, el) {
    document.getElementById("contentFrame").src = page;

    document.querySelectorAll(".menu li").forEach(li => {
        li.classList.remove("active");
    });

    el.classList.add("active");
}


function logout() {
    if (confirm("Yakin ingin logout?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../index.html";
    }
}


