// Configuration
const ROSTERS_PATH = './rosters/';
let rosterData = [];
let allEmployees = [];
let selectedEmployee = 'all';
let currentYear = 2026;
let currentMonth = 1;
let shiftChart = null;
let isManualUpload = false;
let dataLastModified = null;
let holidayDates = new Set();

// Initialize
window.onload = () => {
    initTheme((theme) => setTheme(theme, shiftChart, selectedEmployee, createShiftChart));
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    loadRosterFromRepo(currentYear, currentMonth);
    setupEventListeners();
};

function setupEventListeners() {
    // Theme buttons
    document.getElementById('darkBtn')?.addEventListener('click', () => setTheme('dark', shiftChart, selectedEmployee, createShiftChart));
    document.getElementById('lightBtn')?.addEventListener('click', () => setTheme('light', shiftChart, selectedEmployee, createShiftChart));

    // Navigation
    document.getElementById('prevBtn')?.addEventListener('click', () => navigateMonth(-1));
    document.getElementById('nextBtn')?.addEventListener('click', () => navigateMonth(1));

    // Buttons
    window.scrollToCalendar = () => document.getElementById('calendar').scrollIntoView({ behavior: 'smooth' });
    window.showChartModal = showChartModal;

    // Explicitly bind download buttons
    document.getElementById('downloadAllBtn')?.addEventListener('click', () => {
        downloadAllExcel(rosterData, currentYear, currentMonth);
    });

    document.getElementById('downloadIndividualBtn')?.addEventListener('click', () => {
        const stats = calculateStats(allEmployees, rosterData);
        downloadIndividualExcel(selectedEmployee, stats, rosterData, currentYear, currentMonth);
    });

    // Manual upload
    const uploadSection = document.getElementById('uploadSection');
    const fileInput = document.getElementById('fileInput');

    uploadSection?.addEventListener('click', () => fileInput.click());
    uploadSection?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });
    uploadSection?.addEventListener('dragleave', () => uploadSection.classList.remove('dragover'));
    uploadSection?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleManualUpload(e.dataTransfer.files[0]);
    });
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files[0]) handleManualUpload(e.target.files[0]);
    });

    // Modals
    window.closeDayModal = () => document.getElementById('dayModal').classList.remove('active');
    window.closeChartModal = () => document.getElementById('chartModal').classList.remove('active');
    window.confirmDateManual = confirmDateManual;
    window.confirmHolidays = confirmHolidays;

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        }
    });
}

async function loadRosterFromRepo(year, month) {
    showLoading();
    try {
        const { jsonData, holidaySheet, lastModified } = await fetchRoster(year, month, ROSTERS_PATH);
        const parsed = parseRosterData(jsonData, year, month, holidaySheet);
        rosterData = parsed.rosterData;
        allEmployees = parsed.allEmployees;
        isManualUpload = false;
        dataLastModified = lastModified;
        window.activeEditReason = null;

        hideLoading();
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('mainContent').classList.add('active');
        renderEverything();
    } catch (error) {
        console.error('Error loading roster:', error);
        showError(`Could not load roster for ${getMonthName(month)} ${year}`);
    }
}

function handleManualUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            window.tempUploadData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            document.getElementById('dateModal').classList.add('active');
            document.getElementById('monthInput').value = currentMonth;
            document.getElementById('yearInput').value = currentYear;
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function confirmDateManual() {
    const month = parseInt(document.getElementById('monthInput').value);
    const year = parseInt(document.getElementById('yearInput').value);
    if (!month || !year || month < 1 || month > 12) return alert('Invalid month or year');

    currentMonth = month;
    currentYear = year;
    document.getElementById('dateModal').classList.remove('active');

    // Generate holiday selection calendar
    const grid = document.getElementById('holidayGrid');
    grid.innerHTML = '';
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }

    const tempHolidays = new Set();

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const item = document.createElement('div');
        item.className = 'holiday-item';
        item.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="day-num">${d}</div>
        `;
        item.onclick = () => {
            if (tempHolidays.has(d)) {
                tempHolidays.delete(d);
                item.classList.remove('selected');
            } else {
                tempHolidays.add(d);
                item.classList.add('selected');
            }
        };
        grid.appendChild(item);
    }

    window.tempHolidays = tempHolidays;
    document.getElementById('holidayModal').classList.add('active');
}

function confirmHolidays() {
    holidayDates = window.tempHolidays || new Set();

    const parsed = parseRosterData(window.tempUploadData, currentYear, currentMonth);
    rosterData = parsed.rosterData.map(day => {
        const dayOfMonth = parseInt(day.date.split('-')[2]);
        return { ...day, isHoliday: holidayDates.has(dayOfMonth) };
    });
    allEmployees = parsed.allEmployees;
    isManualUpload = true;
    dataLastModified = new Date().toLocaleString();

    document.getElementById('holidayModal').classList.remove('active');
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('mainContent').classList.add('active');
    renderEverything();
}

function renderEverything() {
    document.getElementById('currentMonthDisplay').textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    const stats = calculateStats(allEmployees, rosterData);

    populateEmployeeSelect(allEmployees, selectedEmployee, (val) => {
        selectedEmployee = val;
        renderEverything();

        const downloadIndividualBtn = document.getElementById('downloadIndividualBtn');
        const showChartBtn = document.getElementById('showChartBtn');
        if (selectedEmployee !== 'all') {
            if (downloadIndividualBtn) {
                downloadIndividualBtn.style.display = 'block';
                downloadIndividualBtn.textContent = `👤 Download ${selectedEmployee}'s Roster`;
            }
            if (showChartBtn) showChartBtn.style.display = 'block';
        } else {
            if (downloadIndividualBtn) downloadIndividualBtn.style.display = 'none';
            if (showChartBtn) showChartBtn.style.display = 'none';
        }
    });

    renderSummary(selectedEmployee, allEmployees, stats);
    renderEmployeeStats(allEmployees, selectedEmployee, stats, (emp) => {
        selectedEmployee = emp;
        const select = document.getElementById('employeeSelect');
        if (select) {
            select.value = emp;
            select.dispatchEvent(new Event('change'));
            scrollToCalendar();
        }
    });
    renderCalendar(currentYear, currentMonth, rosterData, selectedEmployee, showDayDetails);
    renderLastModified(dataLastModified, isManualUpload, window.activeEditReason);
}

// End of state management
window.downloadAllExcel = downloadAllExcel;
window.downloadIndividualExcel = downloadIndividualExcel;

function showDayDetails(dayIndex) {
    const day = rosterData[dayIndex];
    const date = new Date(currentYear, currentMonth - 1, dayIndex + 1);
    document.getElementById('modalTitle').textContent = date.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const filteredDay = selectedEmployee === 'all' ? day : {
        morning: day.morning.filter(e => e === selectedEmployee),
        afternoon: day.afternoon.filter(e => e === selectedEmployee),
        night: day.night.filter(e => e === selectedEmployee),
        weekOff: day.weekOff.filter(e => e === selectedEmployee)
    };

    let html = '';
    const addSection = (label, people, type) => {
        if (people.length > 0) {
            html += `<div class="modal-section"><div class="modal-shift-item ${type}"><div class="modal-shift-header">${label}</div><div class="modal-shift-people">${people.join('<br>')}</div></div></div>`;
        }
    };

    addSection('☀️ Morning Shift (6 AM - 3 PM)', filteredDay.morning, 'morning');
    addSection('🌤️ Afternoon Shift (2 PM - 11 PM)', filteredDay.afternoon, 'afternoon');
    addSection('🌙 Night Shift (10 PM - 7 AM)', filteredDay.night, 'night');
    addSection('🏖️ Day Off', filteredDay.weekOff, 'off');

    document.getElementById('modalBody').innerHTML = html || '<p style="color: var(--text-secondary); text-align: center;">No shifts scheduled</p>';
    document.getElementById('dayModal').classList.add('active');
}

function showChartModal() {
    if (selectedEmployee === 'all') return;
    document.getElementById('chartModalTitle').textContent = `${selectedEmployee} - Shift Distribution`;
    document.getElementById('chartModal').classList.add('active');
    setTimeout(() => createShiftChart(selectedEmployee), 100);
}

function createShiftChart(empName) {
    const stats = calculateStats(allEmployees, rosterData)[empName];
    const ctx = document.getElementById('shiftChart');
    if (shiftChart) shiftChart.destroy();

    const styles = getComputedStyle(document.documentElement);
    const getColor = (name) => styles.getPropertyValue(name).trim();

    shiftChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Morning', 'Afternoon', 'Night'],
            datasets: [{
                data: [stats.morning, stats.afternoon, stats.night],
                backgroundColor: [getColor('--morning'), getColor('--afternoon'), getColor('--night')],
                borderWidth: 2,
                borderColor: getColor('--bg-card')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: getColor('--text-primary'), font: { size: 14, family: 'DM Sans' }, padding: 15 }
                }
            }
        }
    });
}

function navigateMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    else if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    loadRosterFromRepo(currentYear, currentMonth);
}

function showLoading() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('mainContent').classList.remove('active');
}

function hideLoading() { document.getElementById('loadingScreen').style.display = 'none'; }

function showError(message) {
    hideLoading();
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('mainContent').classList.remove('active');
}
