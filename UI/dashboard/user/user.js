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

function logout() {
    if (confirm('Yakin ingin logout?')) {
        window.location.href = ".../index.html";
    }
}
