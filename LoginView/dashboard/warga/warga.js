const wargaTable = document.getElementById("wargaTable");
const pagination = document.getElementById("pagination");

const dataPerPage = 10;
let currentPage = 1;

// DATA DUMMY
const wargaData = [];
for(let i = 1; i <= 50; i++){
    wargaData.push({
        nama: "Warga " + i,
        nik: "7201********" + i,
        token: Math.random().toString(36).substring(2,10).toUpperCase(),
        status: "Aktif"
    });
}

function renderTable(){
    wargaTable.innerHTML = "";
    const start = (currentPage - 1) * dataPerPage;
    const end = start + dataPerPage;
    const data = wargaData.slice(start, end);

    data.forEach(w => {
        wargaTable.innerHTML += `
            <tr>
                <td>${w.nama}</td>
                <td>${w.nik}</td>
                <td class="token">${w.token}</td>
                <td class="status active">${w.status}</td>
            </tr>
        `;
    });
}

function renderPagination(){
    pagination.innerHTML = "";
    const totalPages = Math.ceil(wargaData.length / dataPerPage);

    for(let i = 1; i <= totalPages; i++){
        pagination.innerHTML += `
            <button onclick="goToPage(${i})"
                class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
}

function goToPage(page){
    currentPage = page;
    renderTable();
    renderPagination();
}

// INIT
renderTable();
renderPagination();
