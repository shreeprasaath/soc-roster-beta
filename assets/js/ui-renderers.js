/**
 * Handles DOM manipulation and UI rendering
 */

function populateEmployeeSelect(allEmployees, selectedEmployee, onSelectChange) {
    const select = document.getElementById('employeeSelect');
    if (!select) return;

    select.innerHTML = '<option value="all">All Employees</option>';

    allEmployees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp;
        option.textContent = emp;
        select.appendChild(option);
    });

    select.value = selectedEmployee;

    // Use a persistent listener instead of cloning to avoid UI glitches
    if (!select.dataset.hasListener) {
        select.addEventListener('change', (e) => onSelectChange(e.target.value));
        select.dataset.hasListener = 'true';
    }
}

function renderSummary(selectedEmployee, allEmployees, stats) {
    const summaryContainer = document.getElementById('summary');
    if (!summaryContainer) return;

    if (selectedEmployee === 'all') {
        const totalShifts = Object.values(stats).reduce((sum, emp) => sum + emp.total, 0);
        const avgShifts = allEmployees.length > 0 ? (totalShifts / allEmployees.length).toFixed(1) : 0;
        const totalDaysOff = Object.values(stats).reduce((sum, emp) => sum + emp.daysOff, 0);
        const avgDaysOff = allEmployees.length > 0 ? (totalDaysOff / allEmployees.length).toFixed(1) : 0;
        const nightShiftWorkers = allEmployees.filter(emp => stats[emp].night > 0).length;

        summaryContainer.innerHTML = `
            <div class="stat-card">
                <h3>Total Employees</h3>
                <div class="stat-value">${allEmployees.length}</div>
                <div class="stat-label">Active team members</div>
            </div>
            <div class="stat-card">
                <h3>Total Shifts</h3>
                <div class="stat-value">${totalShifts}</div>
                <div class="stat-label">Across all employees</div>
            </div>
            <div class="stat-card">
                <h3>Average Shifts</h3>
                <div class="stat-value">${avgShifts}</div>
                <div class="stat-label">Per employee</div>
            </div>
            <div class="stat-card">
                <h3>Average Days Off</h3>
                <div class="stat-value">${avgDaysOff}</div>
                <div class="stat-label">Per employee</div>
            </div>
            <div class="stat-card">
                <h3>Night Shift Workers</h3>
                <div class="stat-value">${nightShiftWorkers}</div>
                <div class="stat-label">Out of ${allEmployees.length} total</div>
            </div>
        `;
    } else {
        // Clear summary for individual view as requested
        summaryContainer.innerHTML = '';
    }
}

function renderEmployeeStats(allEmployees, selectedEmployee, stats, onEmployeeClick) {
    const container = document.getElementById('employeeStats');
    if (!container) return;

    let html = '';
    const employeesToShow = selectedEmployee === 'all' ? allEmployees : [selectedEmployee];

    employeesToShow.forEach(empName => {
        const data = stats[empName];
        if (!data) return;
        const isSelected = empName === selectedEmployee && selectedEmployee !== 'all';

        html += `
            <div class="employee-card ${isSelected ? 'selected' : ''}" data-emp="${empName}">
                <div class="employee-name">${empName}</div>
                <div class="shift-breakdown">
                    <div class="shift-item">
                        <div class="shift-label">
                            <div class="shift-dot dot-morning"></div>
                            <span>Morning</span>
                        </div>
                        <span>${data.morning}</span>
                    </div>
                    <div class="shift-item">
                        <div class="shift-label">
                            <div class="shift-dot dot-afternoon"></div>
                            <span>Afternoon</span>
                        </div>
                        <span>${data.afternoon}</span>
                    </div>
                    <div class="shift-item">
                        <div class="shift-label">
                            <div class="shift-dot dot-night"></div>
                            <span>Night</span>
                        </div>
                        <span>${data.night}</span>
                    </div>
                    <div class="shift-item">
                        <div class="shift-label">
                            <div class="shift-dot dot-off"></div>
                            <span>Days Off</span>
                        </div>
                        <span>${data.daysOff}</span>
                    </div>
                    <div class="shift-item" style="border-left: 4px solid var(--holiday);">
                        <span>Public Holidays Worked</span>
                        <span style="font-weight: 700; color: var(--holiday);">${data.publicHolidaysWorked}</span>
                    </div>
                    <div class="shift-item" style="border-left: 4px solid var(--accent-orange);">
                        <span>Max Consecutive Shifts</span>
                        <span style="color: var(--accent-orange); font-weight: 700;">${data.maxConsecutive}</span>
                    </div>
                    <div class="shift-item" style="background: var(--accent-blue); color: white; font-weight: 600; margin-top: 0.5rem;">
                        <span>Total Shifts</span>
                        <span>${data.total}</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add click listeners to cards
    container.querySelectorAll('.employee-card').forEach(card => {
        card.addEventListener('click', () => onEmployeeClick(card.dataset.emp));
    });
}

function renderCalendar(currentYear, currentMonth, rosterData, selectedEmployee, onDayClick) {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const monthName = getMonthName(currentMonth);
    const calendarTitle = document.getElementById('calendarTitle');
    if (calendarTitle) calendarTitle.textContent = `${monthName} ${currentYear} Calendar`;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    if (rosterData.length > 0) {
        const firstDay = new Date(rosterData[0].date).getDay();
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement('div'));
        }
    }

    const filteredData = selectedEmployee === 'all'
        ? rosterData
        : rosterData.map(day => ({
            ...day,
            morning: day.morning.filter(e => e === selectedEmployee),
            afternoon: day.afternoon.filter(e => e === selectedEmployee),
            night: day.night.filter(e => e === selectedEmployee),
            weekOff: day.weekOff.filter(e => e === selectedEmployee)
        }));

    filteredData.forEach((day, index) => {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        if (selectedEmployee !== 'all' && day.weekOff.includes(selectedEmployee)) {
            cell.classList.add('has-off');
        }
        if (day.isHoliday) {
            cell.classList.add('is-holiday');
        }

        const dayNum = index + 1;
        let html = `<div class="day-number">${dayNum}</div><div class="day-name">${day.day}</div>`;

        if (day.morning.length > 0) html += `<div class="shift-section"><div class="shift-title shift-morning">☀️ Morning</div><div class="shift-names">${day.morning.join(', ')}</div></div>`;
        if (day.afternoon.length > 0) html += `<div class="shift-section"><div class="shift-title shift-afternoon">🌤️ Afternoon</div><div class="shift-names">${day.afternoon.join(', ')}</div></div>`;
        if (day.night.length > 0) html += `<div class="shift-section"><div class="shift-title shift-night">🌙 Night</div><div class="shift-names">${day.night.join(', ')}</div></div>`;
        if (day.weekOff.length > 0) html += `<div class="shift-section"><div class="shift-title shift-off">🏖️ Off</div><div class="shift-names">${day.weekOff.join(', ')}</div></div>`;

        cell.innerHTML = html;
        cell.onclick = () => onDayClick(index);
        grid.appendChild(cell);
    });
}

function renderLastModified(timestamp, isManual, reason) {
    const container = document.getElementById('dataMetaInfo');
    if (!container) return;

    if (!timestamp) {
        container.innerHTML = 'Data source: Repository (Last modified time unknown)';
        return;
    }

    const label = isManual ? 'Uploaded on' : 'Last modified';
    const source = isManual ? 'Local Override' : 'GitHub Repository';

    let html = `
        <div class="meta-main">
            ${label}: <strong>${timestamp}</strong>
            <span class="source-tag">${source}</span>
        </div>
    `;

    if (reason) {
        html += `<div class="meta-reason" style="font-size: 0.7rem; margin-top: 0.25rem; font-style: italic;">Reason: ${reason}</div>`;
    }

    // Check if backup exists to show Revert
    const hasBackup = localStorage.getItem(`roster_v1_${currentYear}_${currentMonth}`);
    const isAdmin = sessionStorage.getItem('isAdminAuthenticated') === 'true';

    if (hasBackup && isAdmin) {
        html += `
            <div class="version-info">
                <span class="version-badge v-current">Current: V2</span>
                <span class="version-badge v-backup">Backup: V1</span>
                <button class="btn btn-secondary revert-btn" onclick="revertRoster()">⏪ Revert to V1</button>
            </div>
        `;
    }

    container.innerHTML = html;
}
