/**
 * Handles Excel export functionality
 */

function downloadAllExcel(rosterData, currentYear, currentMonth) {
    const wb = XLSX.utils.book_new();
    const excelData = [
        ['Date / Day', '', 'Morning Shift (6 AM - 3 PM)', 'Afternoon Shift (2 PM - 11 PM )', 'Night Shift (10 PM - 7 AM)', 'Week off']
    ];

    rosterData.forEach((day, index) => {
        const dayNum = index + 1;
        const date = new Date(currentYear, currentMonth - 1, dayNum);
        excelData.push([
            date,
            day.day,
            day.morning.join(', '),
            day.afternoon.join(', '),
            day.night.join(', '),
            day.weekOff.join(', ')
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }];

    const monthName = getMonthName(currentMonth);
    XLSX.utils.book_append_sheet(wb, ws, 'SOC SHIFT');
    XLSX.writeFile(wb, `${currentYear}-${String(currentMonth).padStart(2, '0')}_Shift_Roster.xlsx`);
}

function downloadIndividualExcel(selectedEmployee, stats, rosterData, currentYear, currentMonth) {
    if (selectedEmployee === 'all') return;

    const empStats = stats[selectedEmployee];
    const wb = XLSX.utils.book_new();
    const monthName = getMonthName(currentMonth);

    const summaryData = [
        ['Employee Shift Summary'],
        [''],
        ['Name:', selectedEmployee],
        ['Month:', `${monthName} ${currentYear}`],
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

    const rosterSheetData = [
        ['Date', 'Day', 'Morning Shift', 'Afternoon Shift', 'Night Shift', 'Week Off']
    ];

    rosterData.forEach((day, index) => {
        const dayNum = index + 1;
        const date = new Date(currentYear, currentMonth - 1, dayNum);
        rosterSheetData.push([
            date,
            day.day,
            day.morning.includes(selectedEmployee) ? selectedEmployee : '',
            day.afternoon.includes(selectedEmployee) ? selectedEmployee : '',
            day.night.includes(selectedEmployee) ? selectedEmployee : '',
            day.weekOff.includes(selectedEmployee) ? selectedEmployee : ''
        ]);
    });

    const rosterSheet = XLSX.utils.aoa_to_sheet(rosterSheetData);
    rosterSheet['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, rosterSheet, 'Roster');
    XLSX.writeFile(wb, `${selectedEmployee}_${currentYear}-${String(currentMonth).padStart(2, '0')}_Roster.xlsx`);
}
