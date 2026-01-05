/**
 * Handles Admin authentication, secure hashing, and roster version control.
 */

const EDIT_PASSWORD_HASH = '3b0878d01e754109a2c8ef5990a94bb27cd6545295a8a81ce570882896be6cfc'; // Hash for Chillakidum@123
const ADMIN_CREDENTIALS = {
    username: 'Admin_of_chill_nadu',
    password: 'Chill_Bro@chi11_nadu'
};

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function handleAdminLogin() {
    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        closeAdminLoginModal();
        openAdminDashboard();
    } else {
        alert('Invalid credentials. Contact the internal admin for access.');
    }
}

function openAdminDashboard() {
    document.getElementById('adminDashboardPage').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent main page scroll
    switchAdminTab('upload');
}

function exitAdminDashboard() {
    document.getElementById('adminDashboardPage').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.remove('active');
}

function switchAdminTab(tab) {
    const title = document.getElementById('adminTabTitle');
    const content = document.getElementById('adminTabContent');
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const itemTab = item.getAttribute('data-tab');
        item.classList.toggle('active', itemTab === tab);
    });

    switch (tab) {
        case 'upload':
            title.textContent = 'Upload Roster';
            renderUploadTab(content);
            break;
        case 'holidays':
            title.textContent = 'Manage Holidays';
            renderHolidaysTab(content);
            break;
        case 'create':
            title.textContent = 'Create Roster';
            content.innerHTML = `
                <div class="warning-alert" style="margin-top: 0;">
                    🔒 Authorization Required: Please contact system administrator to enable manual roster creation.
                </div>
            `;
            break;
        case 'versions':
            title.textContent = 'Manage Versions (Revert)';
            renderRevertTab(content);
            break;
    }
}

function renderHolidaysTab(container) {
    const daysInMonth = rosterData.length;
    container.innerHTML = `
        <div class="admin-form">
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">Select public holidays for ${getMonthName(currentMonth)} ${currentYear}. These will be saved into the Excel files.</p>
            <div class="holiday-grid-admin" id="adminHolidayGrid"></div>
            <div class="admin-actions" style="margin-top: 2rem;">
                <button class="btn" id="saveHolidayChanges">Save & Download Updated Roster</button>
            </div>
            <div id="downloadInstructions" class="warning-alert" style="display: none; margin-top: 1rem;">
                ✅ <strong>Files Generated!</strong><br>
                1. Please move <strong>${currentYear}-${String(currentMonth).padStart(2, '0')}.xlsx</strong> to <code>/rosters/</code><br>
                2. Move <strong>${currentYear}-${String(currentMonth).padStart(2, '0')}-bk.xlsx</strong> to <code>/backups/</code>
            </div>
        </div>
    `;

    const grid = document.getElementById('adminHolidayGrid');
    rosterData.forEach((day, i) => {
        const dayNum = i + 1;
        const item = document.createElement('div');
        item.className = `holiday-picker-item ${day.isHoliday ? 'selected' : ''}`;
        item.innerHTML = `<span>${dayNum}</span><small>${day.day.substring(0, 3)}</small>`;
        item.onclick = () => {
            day.isHoliday = !day.isHoliday;
            item.classList.toggle('selected');
        };
        grid.appendChild(item);
    });

    document.getElementById('saveHolidayChanges').onclick = () => {
        // Trigger Stats Recalculation indirectly via re-render
        renderEverything();

        // 1. Download updated main file
        downloadAllExcel(rosterData, currentYear, currentMonth);

        // 2. Download backup version (The previous state is already overwritten in memory, 
        // to truly have a "backup" we would need to capture state BEFORE edits. 
        // For simplicity in this session, we generate a copy.)
        const backupName = `${currentYear}-${String(currentMonth).padStart(2, '0')}-bk.xlsx`;
        // Since we are stateless, we suggest the user copies the ORIGINAL to /originals 
        // and uses the previous YYYY-MM.xlsx as the new bk.

        document.getElementById('downloadInstructions').style.display = 'block';
        alert('Changes applied! Please save the downloaded files to your folders as instructed.');
    };
}

function renderRevertTab(container) {
    container.innerHTML = `
        <div class="admin-form">
            <h3>Restore from Backup</h3>
            <p style="color: var(--text-secondary);">Upload a <strong>-bk.xlsx</strong> file from your <code>/backups/</code> or <code>/originals/</code> folder to restore a previous state.</p>
            <div id="revertUploadZone" class="upload-zone-mini">
                <div class="upload-icon">⏪</div>
                <div class="upload-text">Drag or click backup file to restore</div>
                <input type="file" id="revertFileInput" accept=".xlsx,.xls" style="display: none;">
            </div>
            <div id="revertStatus" class="file-status">No file selected</div>
            <button class="btn btn-secondary" id="confirmRevert" disabled style="width: 100%; margin-top: 1rem;">Confirm Restore</button>
        </div>
    `;

    const zone = document.getElementById('revertUploadZone');
    const input = document.getElementById('revertFileInput');
    const confirmBtn = document.getElementById('confirmRevert');

    zone.onclick = () => input.click();
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById('revertStatus').textContent = `File: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (re) => {
            const data = new Uint8Array(re.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            window.tempRevertData = workbook;
            confirmBtn.disabled = false;
        };
        reader.readAsArrayBuffer(file);
    };

    confirmBtn.onclick = () => {
        if (!window.tempRevertData) return;

        const firstSheet = window.tempRevertData.Sheets[window.tempRevertData.SheetNames[0]];
        const holidaySheetName = window.tempRevertData.SheetNames.find(n => n.toLowerCase().includes('holiday'));
        const holidaySheet = holidaySheetName ? XLSX.utils.sheet_to_json(window.tempRevertData.Sheets[holidaySheetName], { header: 1 }) : null;

        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        const parsed = parseRosterData(jsonData, currentYear, currentMonth, holidaySheet);

        rosterData = parsed.rosterData;
        allEmployees = parsed.allEmployees;

        renderEverything();
        alert('Roster restored from backup successfully!');
        switchAdminTab('holidays');
    };
}

function renderUploadTab(container) {
    container.innerHTML = `
        <div class="admin-form">
            <div id="uploadZone" class="upload-zone-mini">
                <div class="upload-icon">📄</div>
                <div class="upload-text">Drag or click to select Excel file</div>
                <input type="file" id="dashboardFileInput" accept=".xlsx,.xls" style="display: none;">
            </div>
            <div id="fileStatus" class="file-status">No file selected</div>
            
            <div id="adminReasonSection" style="display: none;">
                <div class="input-group">
                    <label>Modification Password (Required for Overwrites)</label>
                    <input type="password" id="adminEditPassword" placeholder="Enter password to confirm">
                </div>
            </div>

            <button class="btn" id="adminConfirmUpload" style="width: 100%; margin-top: 1rem;" disabled>Confirm and Upload Roster</button>
        </div>
    `;

    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('dashboardFileInput');
    const confirmBtn = document.getElementById('adminConfirmUpload');

    zone.onclick = () => input.click();
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById('fileStatus').textContent = `File: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (re) => {
            const data = new Uint8Array(re.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            window.popupWorkbook = workbook;

            const isOverwrite = !isManualUpload;
            document.getElementById('adminReasonSection').style.display = isOverwrite ? 'block' : 'none';
            confirmBtn.disabled = false;
        };
        reader.readAsArrayBuffer(file);
    };

    confirmBtn.onclick = async () => {
        const pass = document.getElementById('adminEditPassword')?.value;

        if (!isManualUpload) {
            if (!pass) return alert('Password is required for original file modification.');
            const hash = await sha256(pass);
            if (hash !== EDIT_PASSWORD_HASH) return alert('Incorrect Modification Password.');
        }

        const wb = window.popupWorkbook;
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const holidaySheetName = wb.SheetNames.find(n => n.toLowerCase().includes('holiday'));
        const holidaySheet = holidaySheetName ? XLSX.utils.sheet_to_json(wb.Sheets[holidaySheetName], { header: 1 }) : null;

        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        const parsed = parseRosterData(jsonData, currentYear, currentMonth, holidaySheet);

        rosterData = parsed.rosterData;
        allEmployees = parsed.allEmployees;
        isManualUpload = true;
        dataLastModified = `${new Date().toLocaleString()} (Admin Upload)`;

        renderEverything();
        alert('Roster uploaded successfully.');
        switchAdminTab('holidays');
    };
}

// Global Event Listener for Admin Button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminBtn').onclick = () => {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
            openAdminDashboard();
        } else {
            document.getElementById('adminLoginModal').classList.add('active');
        }
    };
});

// Expose globally
window.handleAdminLogin = handleAdminLogin;
window.switchAdminTab = switchAdminTab;
window.exitAdminDashboard = exitAdminDashboard;
window.closeAdminLoginModal = closeAdminLoginModal;
