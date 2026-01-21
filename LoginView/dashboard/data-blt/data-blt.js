let dataBLT = [];
const table = document.getElementById("bltTable");

document.getElementById("bltForm").addEventListener("submit", e => {
    e.preventDefault();

    dataBLT.push({
        nama: nama.value,
        nik: nik.value,
        nominal: nominal.value,
        status: status.value
    });

    e.target.reset();
    render();
});

function render() {
    table.innerHTML = "";
    dataBLT.forEach(d => {
        table.innerHTML += `
        <tr>
            <td>${d.nama}</td>
            <td>${d.nik}</td>
            <td>Rp ${Number(d.nominal).toLocaleString()}</td>
            <td class="status ${d.status}">${d.status}</td>
            <td class="actions">
                <i class="fa fa-trash"></i>
            </td>
        </tr>`;
    });
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        lat.value = pos.coords.latitude;
        lng.value = pos.coords.longitude;
    });
}
