## Production Setup

### Build & Run
- Dev: `npm run dev`
- Build: `npm run build`
- Start (compiled): `npm start`

Environment variables:
- `PORT` (default 3000)
- `ORIGIN` (allowed CORS origin; default `*`)

### Healthcheck
- `GET /health` returns `{ status: 'ok' }`

### Security & Stability
- `helmet` for secure headers
- `morgan` for request logs
- `express-rate-limit` (300 req/15m per IP)
- Graceful shutdown on SIGINT/SIGTERM (closes server and SQLite)

### Deploy to Render (recommended)
1. Push this repo to GitHub.
2. Create a new Render Web Service.
3. Build command: `npm run build`
4. Start command: `npm start`
5. Environment:
   - `PORT=3000` (Render sets this automatically)
   - `ORIGIN=https://your-domain` (or `*` during testing)
6. Add a Custom Domain in Render; Render manages TLS automatically.

### Database
- Current: SQLite (`scout.db`) stored locally; good for dev/small usage.
- For reliability: migrate to managed Postgres (Render/Railway). Create tables and indexes, then import CSVs to seed data.

### PWA Notes
- Service worker and manifest included under `public/`.
- For install prompts on mobile, serve over HTTPS.
# Prep Baseball Scout Application

## Overview
The Prep Baseball Scout Application is designed for scouts and employees to write notes and scouting reports in real time. This application integrates seamlessly with existing website content and collected data, providing a comprehensive tool for managing scouting information.

## Features
- Real-time note-taking and scouting report creation
- User management for scouts and employees
- CRUD operations for scouting reports and notes
- Data integration with existing website content

## Project Structure
```
prep-baseball-scout-app
├── src
│   ├── app.ts
│   ├── controllers
│   │   ├── scoutingReports.ts
│   │   ├── notes.ts
│   │   └── users.ts
│   ├── routes
│   │   ├── scoutingReports.ts
│   │   ├── notes.ts
│   │   └── users.ts
│   ├── middleware
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── services
│   │   ├── scoutingService.ts
│   │   ├── dataIntegrationService.ts
│   │   └── notesService.ts
│   ├── models
│   │   ├── ScoutingReport.ts
│   │   ├── Note.ts
│   │   └── User.ts
│   ├── database
│   │   └── connection.ts
│   └── types
│       └── index.ts
├── tests
│   ├── unit
│   └── integration
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd prep-baseball-scout-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
The application will be available at `http://localhost:3000`.

## Contribution
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push to your branch and create a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.