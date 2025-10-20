# College Election Voting System

A full-stack **online election management system** built with **PHP**, **MySQL**, and **JavaScript**.  
It allows college students to **register, verify OTPs, and cast votes securely** while offering real-time analytics and administrative control.

---

## Key Highlights

### User Roles
- **Voter** → Register, verify OTP, and cast votes securely.
- **Candidate** → Manage campaign information and view live results.
- **Admin** → Oversee elections, manage data, and declare results.

### Functional Overview
- Secure registration and login system
- OTP-based verification (demo OTP: `123456`)
- One-vote-per-position enforcement
- Real-time **vote counting and visualization**
- Dynamic **role-based dashboards**
- Modular **PHP API** with JSON responses

---

## Technology Stack

| Layer | Technologies Used |
|-------|--------------------|
| **Frontend** | HTML5, CSS3, JavaScript, Chart.js |
| **Backend** | PHP (procedural API architecture) |
| **Database** | MySQL |
| **Server** | Apache via XAMPP |

---

## Project Structure

web_project/
│
├── index.html.html # Frontend UI (voter, admin, and candidate interfaces)
├── script.js # Frontend logic + API communication (async fetch)
├── api.php # Backend API (handles login, registration, voting, results)
├── db_config.php # Database connection configuration
├── setup_db.sql # Database schema + initial seed data
└── README.md # Documentation (this file)


## Demo Credentials
 
| Role      | Username / ID | Password | Notes              |
| --------- | ------------- | -------- | ------------------ |
| **Admin** | admin         | admin123 | Demo admin login   |
| **Voter** | CS2021001     | password | Demo OTP: `123456` |
| **Voter** | EC2020055     | password | Demo OTP: `123456` |



## Database Overview

| Table        | Description                                              |
| ------------ | -------------------------------------------------------- |
| `voters`     | Stores voter details, login credentials, and vote status |
| `candidates` | Stores candidate data, manifesto, and symbols            |
| `votes`      | Tracks votes cast per voter per position                 |


## Application Modules
# Voter Dashboard

---Displays eligibility and voting options

---View results after voting

---Track turnout stats

# Admin Dashboard

---Manage voters, candidates, and results

---View total voters, turnout %, and votes cast

---Declare official results

# Candidate Dashboard

---Display candidate details and vote counts

---Real-time updates via get_results API

# Results Page

---Interactive charts (Chart.js)

---Auto-refreshes every 10 seconds

---Highlights winners per position



## Screenshots


# Landing Page


<img width="1847" height="895" alt="Screenshot 2025-10-20 115702" src="https://github.com/user-attachments/assets/0b202aba-58ea-4d5a-8f58-ff153f38531a" />



# Login Page


<img width="601" height="548" alt="Screenshot 2025-10-20 115725" src="https://github.com/user-attachments/assets/27c4b735-ff5f-4a49-b61a-2e2d26bed84d" />


# Registration Page


<img width="816" height="749" alt="Screenshot 2025-10-20 115816" src="https://github.com/user-attachments/assets/1752ffc2-5624-46d7-bacb-ba716bbd6596" />


# OTP Verification


<img width="566" height="543" alt="Screenshot 2025-10-20 115845" src="https://github.com/user-attachments/assets/09cdb976-e412-4f42-bbbb-2ec8f8645c00" />


# Dashboard


<img width="1271" height="412" alt="Screenshot 2025-10-20 115900" src="https://github.com/user-attachments/assets/94cf5836-d32f-4a0c-be84-e0d20a42447f" />


# Vote Casting


<img width="1226" height="965" alt="Screenshot 2025-10-20 115942" src="https://github.com/user-attachments/assets/0d80725a-567e-4f0f-9c10-b32f1202358b" />


# Vote Confirmation


<img width="1238" height="645" alt="Screenshot 2025-10-20 120006" src="https://github.com/user-attachments/assets/31bc050a-5d0a-4b34-bc79-caa5d94ac133" />


# Results


<img width="1217" height="890" alt="Screenshot 2025-10-20 120306" src="https://github.com/user-attachments/assets/42282013-3228-4d9e-abb4-5131dcb1c7a1" />


# Result Chart



<img width="1209" height="541" alt="Screenshot 2025-10-20 120320" src="https://github.com/user-attachments/assets/e97b7267-7e36-4754-b7d4-1b7dbe894cb4" />
