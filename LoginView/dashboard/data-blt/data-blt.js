// ================= DATA DUMMY =================
let bltData = [
    {
        nama: "Ahmad",
        nik: "7201010101010001",
        nominal: 300000,
        status: "Disetujui",
        lokasi: "-0.898583, 119.870700",
        berkas: "KTP, KK, Rumah, Dapur"
    },
    {
        nama: "Siti",
        nik: "7201010101010002",
        nominal: 300000,
        status: "Menunggu",
        lokasi: "-0.900120, 119.872310",
        berkas: "KTP, KK, Rumah, Dapur"
    }
];

const tableBody = document.getElementById("bltTable");

// ================= RENDER TABLE =================
function renderTable() {
    tableBody.innerHTML = "";

    bltData.forEach((item, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>${item.nik}</td>
                <td>Rp ${item.nominal.toLocaleString("id-ID")}</td>
                <td class="status ${item.status}">${item.status}</td>
                <td>${item.lokasi}</td>
                <td>${item.berkas}</td>
                <td class="actions">
                    <i class="fa fa-trash" onclick="hapusData(${index})"></i>
                </td>
            </tr>
        `;
    });
}

// ================= TAMBAH DATA =================
document.getElementById("bltForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const dataBaru = {
        nama: nama.value,
        nik: nik.value,
        nominal: Number(nominal.value),
        status: status.value,
        lokasi: `${lat.value}, ${lng.value}`,
        berkas: "KTP, KK, Rumah, Dapur"
    };

    bltData.push(dataBaru);
    renderTable();
    this.reset();
});

// ================= HAPUS =================
function hapusData(index) {
    if (confirm("Hapus data ini?")) {
        bltData.splice(index, 1);
        renderTable();
    }
}

// ================= GEOLOCATION =================
function getLocation() {
    navigator.geolocation.getCurrentPosition(
        pos => {
            lat.value = pos.coords.latitude;
            lng.value = pos.coords.longitude;
        },
        () => alert("Gagal mengambil lokasi")
    );
}

// LOAD PERTAMA
renderTable();
