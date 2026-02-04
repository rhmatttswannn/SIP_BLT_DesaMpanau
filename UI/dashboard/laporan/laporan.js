const dataBLT = [
    { nama: "Ahmad", nik: "720101", nominal: 300000, status: "Disetujui" },
    { nama: "Siti", nik: "720102", nominal: 300000, status: "Menunggu" },
    { nama: "Budi", nik: "720103", nominal: 300000, status: "Disetujui" },
    { nama: "Ani", nik: "720104", nominal: 300000, status: "Ditolak" }
];

let filteredData = [...dataBLT];
const table = document.getElementById("laporanTable");

function renderTable(data) {
    table.innerHTML = "";
    data.forEach(item => {
        table.innerHTML += `
            <tr>
                <td><input type="checkbox" class="rowCheck"></td>
                <td>${item.nama}</td>
                <td>${item.nik}</td>
                <td>Rp ${item.nominal.toLocaleString()}</td>
                <td class="status ${item.status}">${item.status}</td>
            </tr>
        `;
    });
}

renderTable(filteredData);

function applyFilter() {
    const status = document.getElementById("filterStatus").value;
    filteredData = status === "all"
        ? dataBLT
        : dataBLT.filter(d => d.status === status);

    renderTable(filteredData);
}

function toggleAll(source) {
    document.querySelectorAll(".rowCheck")
        .forEach(cb => cb.checked = source.checked);
}

function exportPDF() {
    alert("Export PDF (siap dihubungkan jsPDF)");
}

function exportExcel() {
    alert("Export Excel (siap dihubungkan SheetJS)");
}
