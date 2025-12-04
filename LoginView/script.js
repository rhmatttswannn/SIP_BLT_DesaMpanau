document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if(user === "" || pass === ""){
        alert("Username dan Password wajib diisi!");
        return;
    }

    if(user === "admin" && pass === "12345"){
        alert("Login berhasil!");
        window.location.href = "dashboard.html";
    } else {
        alert("Username atau password salah!");
    }
});
