let dataBLT = [];
let editIndex = null;

const table = document.getElementById("bltTable");
const form = document.getElementById("bltForm");

form.addEventListener("submit", e => {
    e.preventDefault();

    const item = {
        nama: nama.value,
        nik: nik.value,
        nominal: nominal.value,
        status: status.value
    };

    if (editIndex === null) {
        dataBLT.push(item);
    } else {
        dataBLT[editIndex] = item;
        editIndex = null;
    }

    form.reset();
    render();
});

function render() {
    table.innerHTML = "";
    dataBLT.forEach((d, i) => {
        table.innerHTML += `
            <tr>
                <td>${d.nama}</td>
                <td>${d.nik}</td>
                <td>Rp ${Number(d.nominal).toLocaleString()}</td>
                <td class="status ${d.status}">${d.status}</td>
                <td class="actions">
                    <i class="fa fa-edit" onclick="edit(${i})"></i>
                    <i class="fa fa-trash" onclick="hapus(${i})"></i>
                </td>
            </tr>
        `;
    });
}

function edit(i) {
    const d = dataBLT[i];
    nama.value = d.nama;
    nik.value = d.nik;
    nominal.value = d.nominal;
    status.value = d.status;
    editIndex = i;
}

function hapus(i) {
    if (confirm("Hapus data BLT?")) {
        dataBLT.splice(i, 1);
        render();
    }
}
