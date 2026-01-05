# 🚀 Project Owner: Git Setup Guide

> [!IMPORTANT]
> **FINAL FIX for "rejected (fetch first)"**:
> This happens because GitHub already has an empty `README.md`. Since your local code is the correct version, run this command to overwrite the remote:
> - `git push -f origin main`

> [!IMPORTANT]
> **FOOLPROOF PUSH (Run these 6 lines one by one):**
> 1. `git init`
> 2. `git config user.email "shreeprasaath002@gmail.com"`
> 3. `git config user.name "shreeprasaath"`
> 4. `git add .`
> 5. `git commit -m "First commit"`
> 6. `git branch -M main`
> 7. `git push -u origin main`

> [!CAUTION]
> If Step 7 says "src refspec main does not match any", it means Step 5 (the commit) didn't happen. Check for any error messages in your terminal after Step 5!
> This error means you likely missed a step or there is no "Commit" yet. Run these exact 3 commands first:
> 1. `git add .`
> 2. `git commit -m "initial"`
> 3. `git branch -M main`
> Then try the push command again.

### 1. Initialize Git (Start Here if you haven't)
Open your terminal in the project folder (`d:\Antigravity Roster`) and run:
```bash
git init
```

### 2. Rename Branch
```bash
git branch -M main
```

### 3. Stage Files
```bash
git add .
```

### 4. Initial Commit
```bash
git commit -m "Initial commit: SOC Shift Roster Viewer with Admin Features"
```

### 5. Add Remote
Replace `[YOUR_REPO_URL]` with the URL of your GitHub repository:
```bash
git remote add origin [YOUR_REPO_URL]
```

### 6. Push
```bash
git push -u origin main
```

### 🚀 Enabling GitHub Pages
Once pushed, go to your repository on GitHub.com:
1. Click **Settings** (top tab).
2. Click **Pages** (left sidebar).
3. Under **Branch**, select `main` and `/ (root)`.
4. Click **Save**.
5. Your site will be live at `https://[YourUsername].github.io/[your-repo-name]/` within a few minutes.
