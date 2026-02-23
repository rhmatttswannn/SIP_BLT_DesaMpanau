const API_URL = "http://localhost:8000";

document.getElementById("loginForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.style.display = "none";

    if(!username || !password){
        errorMsg.style.display = "block";
        errorMsg.innerText = "Username dan Password wajib diisi!";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMsg.style.display = "block";
            errorMsg.innerText = data.message || "Login gagal!";
            return;
        }

        // Simpan token & role
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", data.data.user.role);

        // Redirect berdasarkan role
        if (data.data.user.role === "ADMIN") {
            window.location.href = "dashboard/dashboard.html";
        } else if (data.data.user.role === "USER") {
            window.location.href = "dashboard/user/user.html";
        } else {
            errorMsg.style.display = "block";
            errorMsg.innerText = "Role tidak dikenali!";
        }

    } catch (error) {
        errorMsg.style.display = "block";
        errorMsg.innerText = "Tidak dapat terhubung ke server!";
        console.error(error);
    }
});