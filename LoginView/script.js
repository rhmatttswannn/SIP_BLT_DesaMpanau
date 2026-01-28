document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const user = username.value.trim();
    const pass = password.value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.style.display = "none";

    if(!user || !pass){
        errorMsg.style.display = "block";
        errorMsg.innerText = "Username dan Password wajib diisi!";
        return;
    }

    if(user === "admin" && pass === "12345"){
        window.location.href = "dashboard/dashboard.html";
    } else {
        errorMsg.style.display = "block";
        errorMsg.innerText = "Username atau password salah!";
    }
});
