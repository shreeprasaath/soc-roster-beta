/**
 * Handles theme toggling and state management
 */

function setTheme(theme, shiftChart, selectedEmployee, createShiftChart) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const darkBtn = document.getElementById('darkBtn');
    const lightBtn = document.getElementById('lightBtn');

    if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
    if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');

    if (shiftChart && selectedEmployee !== 'all' && createShiftChart) {
        createShiftChart(selectedEmployee);
    }
}

function initTheme(setThemeFn) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setThemeFn(savedTheme);
    return savedTheme;
}
