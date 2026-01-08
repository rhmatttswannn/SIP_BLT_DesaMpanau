const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

toggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

const ctx = document.getElementById('bltChart');

if (ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Penerima', 'Belum Verifikasi'],
            datasets: [{
                label: 'Jumlah Warga',
                data: [85, 35],
                backgroundColor: [
                    '#0052D4',
                    '#FFA500'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}