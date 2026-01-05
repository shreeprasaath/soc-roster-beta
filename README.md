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

---

## 🤝 Contributing for Collaborators

If you would like to contribute to this project, please follow these steps:

### 1. Fork the Project
Click the **Fork** button at the top right of the repository page to create a copy of the project in your own GitHub account.

### 2. Clone Your Fork
```bash
git clone https://github.com/[YOUR_USERNAME]/[REPO_NAME].git
cd [REPO_NAME]
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/AmazingFeature
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "Add some AmazingFeature"
```

### 5. Push to Your Fork
```bash
git push origin feature/AmazingFeature
```

### 6. Open a Pull Request
Go to the original repository on GitHub and click the **New Pull Request** button.

---

## ⚖️ License
This project is proprietary and intended for internal use. For modifications or redistribution, please contact the system administrator.
