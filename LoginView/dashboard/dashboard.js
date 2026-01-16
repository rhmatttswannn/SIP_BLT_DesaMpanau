// SIDEBAR TOGGLE
const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

toggle.onclick = () => {
    sidebar.classList.toggle('active');
};

// CHART MODERN MINIMALIS
const ctx = document.getElementById('bltChart');

if (ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Penerima', 'Belum Verifikasi'],
            datasets: [{
                data: [85, 35],
                backgroundColor: ['#0EA5A4', '#E5E7EB'],
                borderRadius: 14,
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748B' }
                },
                y: {
                    display: false
                }
            }
        }
    });
}
