# 🛡️ SOC Shift Roster Viewer

A modern, responsive, and secure web application for visualizing and managing Security Operations Center (SOC) shift schedules. Built with a focus on data integrity, user experience, and "Soft Steel" aesthetics.

## ✨ Key Features

- **📊 Intelligent Visualization**: Dynamic calendar view showing shifts, holidays, and employee details.
- **📈 Comprehensive Stats**: Track total shifts, public holidays worked, and maximum consecutive shifts worked by each employee.
- **🔐 Full-Page Admin Dashboard**: Dedicated secure workspace with sidebar navigation.
- **📤 Protected Uploads**: Secure roster updates with mandatory reason logging and password hashing (SHA-256).
- **📜 Version Control (V1/V2)**: Automatic backup creation before roster updates with the ability to revert to previous versions.
- **🌓 Dual Themes**: High-contrast Dark Mode and a customized "Soft Steel" Light Mode (easy on the eyes).
- **📥 One-Click Export**: Save rosters and statistics to PDF or Excel formats.

---

## 🚀 Getting Started

### For Users
1. **Navigate**: Use the top bar to switch between months.
2. **Filter**: Click an employee card to focus on their specific schedule.
3. **Details**: Hover over icons in the calendar to see specific shift timings.

### For Administrators
- **Access**: Click the 🔒 icon in the header.
- **Login**:
    - **Username**: `Admin_of_chill_nadu`
    - **Password**: `Chill_Bro@chi11_nadu`
- **Modify existing data**: Use the **Upload Roster** tab. You will need the modification password: `Chillakidum@123`.

---

## 🛠️ Developer Guide

### Tech Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Libraries**: 
    - [SheetJS (XLSX)](https://sheetjs.com/) for Excel parsing.
    - [Chart.js](https://www.chartjs.org/) for analytics (if enabled).
    - [jsPDF/AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for PDF exports.
- **Storage**: `localStorage` (for versioning and overrides), `sessionStorage` (for auth).

### Local Setup
1. Clone or download the source code.
2. Open `index.html` in any modern web browser.
3. No build step or server is required (Static App).

---

## 📦 How to Push Code to GitHub

Follow these steps to push your code if you have a new, empty repository on GitHub and no local Git configuration.

### 1. Initialize Git
Open your terminal (Command Prompt, PowerShell, or Git Bash) in the project folder and run:
```bash
git init
```

### 2. Prepare for GitHub
Ensure you are on the `main` branch:
```bash
git branch -M main
```

### 3. Add Your Files
Stage all the project files for the first commit:
```bash
git add .
```

### 4. Create Initial Commit
```bash
git commit -m "Initial commit: SOC Shift Roster Viewer with Admin Features"
```

### 5. Link to GitHub
Replace `[YOUR_REPO_URL]` with the URL of your GitHub repository (e.g., `https://github.com/YourUsername/your-repo-name.git`):
```bash
git remote add origin [YOUR_REPO_URL]
```

### 6. Push to GitHub
Upload your files to the `main` branch:
```bash
git push -u origin main
```

> [!TIP]
> **GitHub Pages Deployment**: To host the app for free, go to your Repository Settings > Pages. Select the `main` branch as the source and click Save. Your site will be live at `https://[YourUsername].github.io/[your-repo-name]/`.

---

## ⚖️ License
This project is proprietary and intended for internal use. For modifications or redistribution, please contact the system administrator.
