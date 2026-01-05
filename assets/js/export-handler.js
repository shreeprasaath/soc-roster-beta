/**
 * Handles Excel export functionality
 */

function downloadAllExcel(data, year, month) {
    if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Please check your internet connection.');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();
        const excelData = [
            ['Date / Day', '', 'Morning Shift (6 AM - 3 PM)', 'Afternoon Shift (2 PM - 11 PM )', 'Night Shift (10 PM - 7 AM)', 'Week off']
        ];

        const holidays = [];

        data.forEach((day, index) => {
            const dayNum = index + 1;
            const date = new Date(year, month - 1, dayNum);
            excelData.push([
                date.toLocaleDateString(),
                day.day,
                (day.morning || []).join(', '),
                (day.afternoon || []).join(', '),
                (day.night || []).join(', '),
                (day.weekOff || []).join(', ')
            ]);

            if (day.isHoliday) {
                holidays.push([date.toLocaleDateString()]);
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 35 }, { wch: 35 }, { wch: 35 }, { wch: 35 }];

        XLSX.utils.book_append_sheet(wb, ws, 'SOC SHIFT');

        if (holidays.length > 0) {
            const hws = XLSX.utils.aoa_to_sheet([['Holiday Dates'], ...holidays]);
            XLSX.utils.book_append_sheet(wb, hws, 'Holidays');
        }

        const fileName = `${year}-${String(month).padStart(2, '0')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    } catch (err) {
        console.error('Export Error:', err);
        alert('Failed to generate Excel file: ' + err.message);
    }
}

function downloadIndividualExcel(emp, stats, data, year, month) {
    if (typeof XLSX === 'undefined') return alert('Excel library not loaded.');
    if (!emp || emp === 'all') return;

    try {
        const empStats = stats[emp];
        const wb = XLSX.utils.book_new();
        const monthName = getMonthName ? getMonthName(month) : `Month ${month}`;

        const summaryData = [
            ['Employee Shift Summary'],
            ['Name:', emp],
            ['Month:', `${monthName} ${year}`],
            [''],
            ['Shift Type', 'Count', 'Percentage'],
            ['Morning Shifts', empStats.morning, `${((empStats.morning / empStats.total) * 100).toFixed(1)}%`],
            ['Afternoon Shifts', empStats.afternoon, `${((empStats.afternoon / empStats.total) * 100).toFixed(1)}%`],
            ['Night Shifts', empStats.night, `${((empStats.night / empStats.total) * 100).toFixed(1)}%`],
            ['Days Off', empStats.daysOff, ''],
            ['Total Shifts', empStats.total, ''],
            ['Max Consecutive Days', empStats.maxConsecutive, '']
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

        const rosterSheetData = [['Date', 'Day', 'Morning Shift', 'Afternoon Shift', 'Night Shift', 'Week Off']];

        data.forEach((day, index) => {
            const date = new Date(year, month - 1, index + 1);
            rosterSheetData.push([
                date.toLocaleDateString(),
                day.day,
                day.morning.includes(emp) ? emp : '',
                day.afternoon.includes(emp) ? emp : '',
                day.night.includes(emp) ? emp : '',
                day.weekOff.includes(emp) ? emp : ''
            ]);
        });

        const rosterSheet = XLSX.utils.aoa_to_sheet(rosterSheetData);
        rosterSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, rosterSheet, 'Roster');
        XLSX.writeFile(wb, `${emp}_${year}-${String(month).padStart(2, '0')}.xlsx`);
    } catch (err) {
        alert('Failed to generate individual Excel: ' + err.message);
    }
}
