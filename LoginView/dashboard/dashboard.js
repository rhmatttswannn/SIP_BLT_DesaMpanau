// SIDEBAR TOGGLE
const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

toggle.onclick = () => {
    sidebar.classList.toggle('active');
};

function loadPage(page) {
    document.getElementById("contentFrame").src = page;

    document.querySelectorAll(".menu li").forEach(li => {
        li.classList.remove("active");
    });

    event.currentTarget.classList.add("active");
}
