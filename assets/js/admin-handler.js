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

    // Update active nav state
    navItems.forEach(item => {
        const itemTab = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        item.classList.toggle('active', itemTab === tab);
    });

    switch (tab) {
        case 'upload':
            title.textContent = 'Upload Roster';
            renderUploadTab(content);
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
            title.textContent = 'Manage Versions';
            renderVersionsTab(content);
            break;
    }
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
            
            <div id="monthWarning" class="warning-alert" style="display: none;">
                ⚠️ This month has an existing roster. Modification details required.
            </div>

            <div id="adminReasonSection" style="display: none;">
                <div class="input-group">
                    <label>Reason for Modification</label>
                    <textarea id="adminEditReason" placeholder="Explain why this data is being updated..."></textarea>
                </div>
                <div class="input-group">
                    <label>Modification Password</label>
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
            window.popupFileData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

            const isOverwrite = !isManualUpload;
            document.getElementById('monthWarning').style.display = isOverwrite ? 'block' : 'none';
            document.getElementById('adminReasonSection').style.display = isOverwrite ? 'block' : 'none';
            confirmBtn.disabled = false;
        };
        reader.readAsArrayBuffer(file);
    };

    confirmBtn.onclick = async () => {
        const reason = document.getElementById('adminEditReason')?.value || 'New upload';
        const pass = document.getElementById('adminEditPassword')?.value;

        if (!isManualUpload) {
            if (!reason || !pass) return alert('Reason and Password are required.');
            const hash = await sha256(pass);
            if (hash !== EDIT_PASSWORD_HASH) return alert('Incorrect Modification Password.');
        }

        saveVersionBackup(currentYear, currentMonth, rosterData);
        const parsed = parseRosterData(window.popupFileData, currentYear, currentMonth);
        rosterData = parsed.rosterData;
        allEmployees = parsed.allEmployees;
        isManualUpload = true;
        dataLastModified = `${new Date().toLocaleString()} (Admin Update)`;
        saveCurrentVersion(currentYear, currentMonth, rosterData, allEmployees, reason);

        renderEverything();
        alert('Roster updated successfully.');
        switchAdminTab('upload');
    };
}

function renderVersionsTab(container) {
    const v1 = localStorage.getItem(`roster_v1_${currentYear}_${currentMonth}`);
    const v2 = getStoredVersion(currentYear, currentMonth);

    if (!v1 && !v2) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No local versions found for the current month.</p>';
        return;
    }

    let html = `
        <table class="v-history-table">
            <thead>
                <tr>
                    <th>Version</th>
                    <th>Timestamp</th>
                    <th>Reason</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (v2) {
        html += `
            <tr class="v-row">
                <td><span class="version-badge v-current">V2 (Active)</span></td>
                <td><span class="v-ts">${v2.timestamp}</span></td>
                <td><span class="v-reason">${v2.reason || 'Manual Update'}</span></td>
                <td>-</td>
            </tr>
        `;
    }

    if (v1) {
        html += `
            <tr class="v-row">
                <td><span class="version-badge v-backup">V1 (Backup)</span></td>
                <td><span class="v-ts">Prior to V2 update</span></td>
                <td>-</td>
                <td><button class="btn btn-secondary revert-btn" onclick="revertRoster()">⏪ Revert</button></td>
            </tr>
        `;
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function handleCreateRoster() {
    alert('Sorry, you are not authorized as of now contact admin.');
}

// Keep existing helper functions
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function saveVersionBackup(year, month, data) {
    if (!data || data.length === 0) return;
    const key = `roster_v1_${year}_${month}`;
    localStorage.setItem(key, JSON.stringify(data));
}

function saveCurrentVersion(year, month, data, employees, reason) {
    const key = `roster_v2_${year}_${month}`;
    const payload = {
        data,
        employees,
        reason,
        timestamp: new Date().toLocaleString()
    };
    localStorage.setItem(key, JSON.stringify(payload));
}

function getStoredVersion(year, month) {
    const v2 = localStorage.getItem(`roster_v2_${year}_${month}`);
    if (v2) return JSON.parse(v2);
    return null;
}

function revertRoster(year, month) {
    const v1Key = `roster_v1_${year}_${month}`;
    const v2Key = `roster_v2_${year}_${month}`;

    const v1Data = localStorage.getItem(v1Key);
    const v2Data = localStorage.getItem(v2Key);

    if (!v1Data) {
        alert('No backup version found for this month.');
        return;
    }

    // Swap v1 and v2
    localStorage.setItem(v2Key, v1Data); // v1 becomes the current v2 (JSON payload structure mismatch handling needed)
    // Actually, v1 is just the roster data array. v2 is a payload.
    // Let's normalize.

    const v1Parsed = JSON.parse(v1Data);
    const v2Parsed = v2Data ? JSON.parse(v2Data) : null;

    // Create new v2 from v1
    const newV2 = {
        data: Array.isArray(v1Parsed) ? v1Parsed : v1Parsed.data,
        employees: v2Parsed ? v2Parsed.employees : allEmployees, // Approximate if v1 doesn't have employees
        reason: 'Reverted to previous version',
        timestamp: new Date().toLocaleString()
    };

    localStorage.setItem(v2Key, JSON.stringify(newV2));

    if (v2Parsed) {
        localStorage.setItem(v1Key, JSON.stringify(v2Parsed.data));
    }

    // Reload
    loadRosterFromRepo(year, month);
    alert('Reverted to backup version.');
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
