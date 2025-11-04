# 🥗 EECS 581 – Project 3

> **Capstone Project** – Fall 2025  
> Team 26 | University of Kansas | EECS 581: Software Engineering II

---

## 📌 Project Overview
The **Munch Mates** meal application is a program designed to help users plan meals efficiently by integrating **ingredient recognition**, **recipe recommendations**, **dietary filtering**, and **grocery list generation** into a single cohesive platform.

The app leverages:
- 🔐 User authentication
- 🥘 Ingredient-based recipe suggestions (via [Spoonacular API](https://spoonacular.com/food-api))
- 🧠 Image recognition for ingredient detection
- 🛍️ Automated grocery list generation
- 🗓️ Meal planning calendar

---

## 📂 Documentation

- 📊 **Requirement Stack Spreadsheet:**  
  [➡️ Google Sheets Link](https://docs.google.com/spreadsheets/d/1tIHhPo6bOL9eVPZegeKziGUcNpKWi4lBoVX56LpTFzA/edit?usp=sharing)

- 📄 **Reference Stories Spreadsheet:**  
  [➡️ Google Sheets Link](https://docs.google.com/spreadsheets/d/1bFJEMlm_VBw6wxdow4GiaQh48IArsEXu_b9iP1G-xVg/edit?usp=sharing)

---

## 🧑‍💻 Team Members
| Name               | Role  |
|--------------------|-------|
| Aidan Ingram       | Scrum Master  / Developer   |
| Hale Coffman       | Product Owner / Developer   |
| Aryan Kevat        | Developer / Head Logic Designer|
| Olivia Blankenship | Developer / Tester   |
| Sam Suggs          | Developer / Tester  | 
| Landon Bever       | Developer / Tester   | 

---

## 🧭 Development Timeline (Planned)
| Iteration | Focus Area |
|-----------|------------|
| Iteration 1 | Authentication, UI framework |
| Iteration 2 | API integration, dietary filters |
| Iteration 3 | Image upload and recipe saving |
| Iteration 4 | Grocery planner and final UI polish |

---

## 📋 Requirements
- **Docker** with Compose
- **Node.js 20+** and **npm 10+**
- Open ports: **3000** (Next.js), **8080** (Keycloak), **8025** (Mailpit)
- Recommended: Clean working directory (no stray `.env.local` outside the project root)

---

## 🚀 Run the Application (Local Dev)

### 1) Clone & enter
**macOS/Linux**
    
    git clone <YOUR-REMOTE-URL> munchmates
    cd munchmates

**Windows (PowerShell)**
    
    git clone <YOUR-REMOTE-URL> munchmates
    Set-Location .\munchmates

### 2) Environment
Copy and review the example env file:

**macOS/Linux**
    
    cp .env.local.example .env.local

**Windows (PowerShell)**
    
    Copy-Item .env.local.example .env.local

Key variables (already set in the example):

    NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
    NEXT_PUBLIC_KEYCLOAK_REALM=dev
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=my-react-client
    NEXT_PUBLIC_MAILPIT_URL=http://localhost:8025
    JWT_AUDIENCE=my-react-client
    JWT_ISSUER=http://localhost:8080/realms/dev

### 3) Install dependencies
    
    npm ci
    # If ci fails:
    npm install

### 4) Start services + app

**Option A — One terminal (foreground)**
    
    npm run dev:all
    # Brings up Keycloak & Mailpit in the foreground, waits for :8080, then starts Next.js on :3000

**Option B — Two terminals**
- Terminal 1: start Keycloak stack
    
      npm run kc:up
- Terminal 2: start Next.js
    
      npm run dev

Open the app:  
- App: http://localhost:3000  
- Mailpit: http://localhost:8025  
- Keycloak Admin: http://localhost:8080/admin/dev/console

---

## 🧰 Useful Commands

- Stop Keycloak stack:
    
      npm run kc:down
- Wipe Keycloak volumes (fresh DB; re-imports realm on next up):
    
      npm run kc:nuke
- Tail Keycloak logs:
    
      npm run kc:logs

---

## 🆘 Troubleshooting

- **Stuck on “Checking session”** → ensure Docker is running and `http://localhost:8080` is reachable.
- **Realm didn’t import on first run** → `npm run kc:nuke` then start again (`npm run dev:all` or `npm run kc:up`).
- **Module not found: `keycloak-js`** → run `npm ci` (or `npm install`) in the project root.
- **Port conflicts** → free ports **3000/8080/8025** or adjust the compose/Next.js port bindings.

