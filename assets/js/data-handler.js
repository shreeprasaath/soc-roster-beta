/**
 * Handles roster data loading and parsing
 */

function parseNames(cellValue) {
    if (!cellValue) return [];
    return String(cellValue)
        .split(/,|\n/)
        .map(n => n.trim())
        .filter(n => n && n.length > 0);
}

function parseRosterData(jsonData, year, month) {
    const rosterData = [];
    const allEmployees = new Set();

    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row[2] && !row[3] && !row[4] && !row[5]) continue;

        const morning = parseNames(row[2]);
        const afternoon = parseNames(row[3]);
        const night = parseNames(row[4]);
        const weekOff = parseNames(row[5]);

        [...morning, ...afternoon, ...night, ...weekOff].forEach(name => allEmployees.add(name));

        const dayNum = i;
        const date = new Date(year, month - 1, dayNum);

        // Use local date string (YYYY-MM-DD) to avoid UTC shifts
        const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        rosterData.push({
            date: localDate,
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            morning,
            afternoon,
            night,
            weekOff
        });
    }

    return {
        rosterData,
        allEmployees: Array.from(allEmployees).sort()
    };
}

async function fetchRoster(year, month, rostersPath) {
    const filename = `${year}-${String(month).padStart(2, '0')}.xlsx`;
    const filepath = rostersPath + filename;

    const response = await fetch(filepath);
    if (!response.ok) {
        throw new Error(`Roster file not found: ${filename}`);
    }

    const lastModified = response.headers.get('Last-Modified');

    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return {
        jsonData: XLSX.utils.sheet_to_json(firstSheet, { header: 1 }),
        lastModified: lastModified ? new Date(lastModified).toLocaleString() : null
    };
}
