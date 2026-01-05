/**
 * Handles roster statistics calculations
 */

function calculateStats(allEmployees, rosterData) {
    const employeeStats = {};

    allEmployees.forEach(emp => {
        employeeStats[emp] = {
            morning: 0,
            afternoon: 0,
            night: 0,
            daysOff: 0,
            publicHolidaysWorked: 0,
            total: 0,
            maxConsecutive: 0,
            currentStreak: 0
        };
    });

    rosterData.forEach(day => {
        const workingToday = new Set();

        day.morning.forEach(emp => {
            if (employeeStats[emp]) {
                employeeStats[emp].morning++;
                employeeStats[emp].total++;
                workingToday.add(emp);
            }
        });
        day.afternoon.forEach(emp => {
            if (employeeStats[emp]) {
                employeeStats[emp].afternoon++;
                if (!workingToday.has(emp)) {
                    employeeStats[emp].total++;
                    workingToday.add(emp);
                }
            }
        });
        day.night.forEach(emp => {
            if (employeeStats[emp]) {
                employeeStats[emp].night++;
                if (!workingToday.has(emp)) {
                    employeeStats[emp].total++;
                    workingToday.add(emp);
                }
            }
        });
        day.weekOff.forEach(emp => {
            if (employeeStats[emp]) {
                employeeStats[emp].daysOff++;
            }
        });

        const isHoliday = day.isHoliday;

        allEmployees.forEach(emp => {
            if (workingToday.has(emp)) {
                employeeStats[emp].currentStreak++;
                employeeStats[emp].maxConsecutive = Math.max(
                    employeeStats[emp].maxConsecutive,
                    employeeStats[emp].currentStreak
                );
                if (isHoliday) {
                    employeeStats[emp].publicHolidaysWorked++;
                }
            } else {
                employeeStats[emp].currentStreak = 0;
            }
        });
    });

    return employeeStats;
}

function getMonthName(month) {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return names[month - 1];
}
