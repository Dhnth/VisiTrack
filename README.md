# <p align="center">VisiTrack - Modern Digital Guest Book System</p>

<p align="center">
  <img src="./visitrack_banner.png" alt="VisiTrack Banner" width="100%">
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql" alt="MySQL"></a>
</p>

---

## 🌟 Overview

**VisiTrack** is a sophisticated, multi-tenant digital guest book system designed for modern institutions. It streamlines visitor management through automated check-ins, QR code verification, and real-time monitoring. Built with a focus on security, scalability, and ease of use, VisiTrack empowers organizations to manage their visitor logs with professional precision.

> "Scan, validate, and track all in one place. Everything you need to manage visitors smartly and securely."

---

## ✨ Key Features

### 🏢 Multi-Tenant Architecture
Support multiple institutions under a single deployment. Each organization gets its own unique URL slug (e.g., `visitrack.com/my-org`), custom branding, and isolated data.

### 🔐 Robust RBAC (Role-Based Access Control)
Five distinct roles ensure secure and efficient operations:
*   **Superadmin**: Central management of all instances and system backups.
*   **Admin**: Institutional managers who configure settings, employees, and staff.
*   **PPID**: Information officers focused on reporting and data reconciliation.
*   **Petugas (Officer)**: Front-line staff for visitor validation and QR scanning.
*   **Guest**: External visitors with a seamless, mobile-friendly check-in flow.

### 📱 Smart Visitor Flow
*   **QR Code Integration**: Instant check-in via dynamic or static QR codes.
*   **Photo Validation**: Mandatory selfie capture for enhanced security.
*   **Real-Time Dashboard**: Live updates on visitor status using Pusher.
*   **Automated Notifications**: Stay informed about new registrations and approvals.

### 📊 Insights & Reporting
*   **Interactive Analytics**: Visualize visit trends with Recharts.
*   **Data Portability**: Export comprehensive reports to Excel (.xlsx).
*   **Activity Logs**: Full audit trail of system changes and user actions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 19, Tailwind CSS 4, Framer Motion, Radix UI, Shadcn/UI |
| **Backend** | Next.js API Routes, NextAuth.js (v5 Beta), Pusher (Real-time), Nodemailer (SMTP) |
| **Database** | MySQL (via `mysql2`), Local File Storage (for photos) |
| **Utilities** | Lucide React, ExcelJS, Node-cron (Backups), QRCode |

---

## 🏗️ Architecture & Flow

VisiTrack utilizes a dynamic routing system to handle multi-tenancy.

```mermaid
graph TD
    A[Visitor] -->|Scan QR| B(Guest Form)
    B -->|Submit Data + Photo| C{Validation}
    C -->|Petugas| D[Approved/Active]
    C -->|Petugas| E[Rejected]
    D -->|Visit Ends| F[Check-Out]
    
    subgraph Multi-Tenant Routing
    G[/[slug]/admin]
    H[/[slug]/petugas]
    I[/[slug]/ppid]
    end
    
    subgraph Central Management
    J[/superadmin]
    end
```

---

## 📂 Project Structure

```text
visitrack-next/
 ├── app/                 # Next.js App Router (Multi-tenant routes)
 ├── components/          # Reusable UI Components (Shadcn + Custom)
 ├── hooks/               # Custom React Hooks
 ├── lib/                 # Core Utilities (DB, Auth, Pusher, Mail)
 ├── public/              # Static Assets & Local Uploads
 ├── types/               # TypeScript Type Definitions
 ├── backups/             # Database SQL Backups
 └── middleware.ts        # RBAC & Tenant Protection Logic
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   MySQL Server 8.0+
*   Pusher Account (for real-time features)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/visitrack-next.git
    cd visitrack-next
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    # Database
    DB_HOST="localhost"
    DB_USER="root"
    DB_PASSWORD="your_password"
    DB_NAME="visitrack_next"

    # NextAuth
    NEXTAUTH_SECRET="your_secret_key"
    NEXTAUTH_URL="http://localhost:3000"

    # Pusher
    NEXT_PUBLIC_PUSHER_APP_KEY="your_key"
    PUSHER_APP_ID="your_id"
    PUSHER_SECRET="your_secret"
    NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster"

    # SMTP (Optional for password recovery)
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT="587"
    SMTP_USER="your_email"
    SMTP_PASS="your_app_password"
    ```

4.  **Database Initialization:**
    Import the latest SQL schema from `backups/db_backup_xxxx.sql` into your MySQL database.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🔒 Security & Performance
*   **CSRF Protection**: Handled by NextAuth.js.
*   **Data Isolation**: Strict tenant filtering in all database queries.
*   **Edge Middleware**: Fast role-based redirects and authentication checks.
*   **Optimized Assets**: Next/Image for efficient media loading.

---

<p align="center">
  Built with ❤️ by <b>Dhanis Fathan Gunawan</b>
</p>
