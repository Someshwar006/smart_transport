# LogiConnect — Indian Multi-Role Freight & Transport Platform (MERN)

A production-ready, full-stack multi-role Transport Management Platform tailored for the Indian freight and logistics ecosystem. LogiConnect unifies industrial cargo owners, fleet transporters, and licensed lorry drivers into a synchronized tripartite workflow with zero dead-mileage, verified permits, and privacy-shielded communications.

---

## 🎯 Architecture & Palette
- **Monorepo Layout**: `server/` (Node.js/Express REST API) and `client/` (React 18 + Vite + Tailwind CSS SPA).
- **Design Aesthetic**: Enterprise-grade, minimalist, gentle color palette:
  - **Primary / Slate Navy**: `#0F172A`
  - **Accent / Royal Blue**: `#2563EB`
  - **Background**: `#F8FAFC`
  - **Status Indicators**:
    - *Open / Pending*: Amber `#D97706` / `#FEF3C7`
    - *Live / Progressing*: Blue `#2563EB` / `#EFF6FF`
    - *Driver Pending*: Violet `#7C3AED` / `#F3E8FF`
    - *Completed / Received*: Emerald `#059669` / `#D1FAE5`

---

## 🔑 Pre-Seeded Test Credentials
The database has already been seeded with realistic Indian logistics entities (Tata Steel, Apex Auto, VRL Logistics, CJ Darcl, certified lorry drivers, and live interstate freight routes):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Load Owner** | `owner@tata-steel.in` | `password123` | Tata Steel Plant Ltd., Jamshedpur |
| **Load Owner** | `logistics@apex-auto.in` | `password123` | Apex Automotive Ancillaries, Chennai |
| **Transporter** | `operations@vrl-logistics.in` | `password123` | VRL National Logistics, Bengaluru/Hubli |
| **Transporter** | `dispatch@cj-darcl.in` | `password123` | Darcl Heavy Freightways, Delhi/NCR |
| **Lorry Driver** | `driver.ramesh@gmail.com` | `password123` | Ramesh Kumar (`TN-57-AB-1234`, 10W Container) |
| **Lorry Driver** | `driver.manpreet@gmail.com` | `password123` | Manpreet Singh (`NL-01-AIP-5678`, 14W Tarpaulin) |
| **Lorry Driver** | `driver.gurmeet@gmail.com` | `password123` | Gurmeet Singh (`PB-10-CD-9988`, 12W Flatbed) |

*(Quick-login buttons are also conveniently embedded directly on the Login page for one-click testing!)*

---

## 🔄 End-to-End Operational Lifecycle
1. **Load Creation**: Industrial Load Owner posts shipment specifications (Tonnage, route, body style, wheel count, permit type, budget rate, payment terms).
2. **Transporter Available Feed**: Loads appear exclusively to **connected** fleet operators. Transporter clicks *"Accept / Show Interest"*, triggering an automated email notification to the shipper.
3. **Owner Awards Contract**: Shipper reviews interested fleet agencies and assigns the load. Status atomically shifts to `in_progress`.
4. **Revocation / Reopen**: Shipper can click *"Delete Assigning"* at any time to return the load to open bidding.
5. **Driver Matching**: Contracted load appears on connected drivers' feeds. Driver clicks *"Accept / Willing"*.
6. **Transporter Confirms Driver**: Transporter selects a willing driver; status updates atomically from `not_approved` to **`live`**.
7. **Delivery Receipt**: Shipper acknowledges safe arrival with *"Mark Received / Recovered"*, completing the cycle across all dashboards.

---

## 🔒 Privacy-Preserving Contact Shield
- **Secure Mode (Default)**: Phone numbers are masked (`+91 ••••• ••345`) in public directories to eliminate unsolicited spam.
- **Mutual Unmasking**: As soon as a mutual connection request is accepted, full contact numbers are automatically revealed.

---

## 🚀 Running the Project Locally

### 1. Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Re-seeding Sample Data (Optional)
```bash
cd server
npm run seed
```

