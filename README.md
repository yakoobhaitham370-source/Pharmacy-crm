# MASAR Pharmacy Chronic Patient CRM

MASAR is a complete, production-ready CRM built for Massar Al-Dawaa Pharmacy. It manages chronic patients, medications, refill schedules, WhatsApp reminder logic, and more.

## Architecture

This application operates securely using a 3-tier architecture:
**React Frontend** ➔ **Netlify Functions (Backend)** ➔ **Google Sheets API** ➔ **Private Google Sheet**

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Lucide Icons.
- **Backend:** Express.js (dev) / Netlify Functions (production), `google-spreadsheet`, `jsonwebtoken`.
- **Database:** Google Sheets.

**Security Design:** Google credentials and private keys are NEVER exposed to the frontend. All Google Sheets API calls are performed server-side.

---

## 1. Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Google Sheets API** in the APIs & Services section.
4. Go to **Credentials** ➔ Create Credentials ➔ **Service Account**.
5. Copy the generated Service Account Email.
6. Create a new Key for the service account (JSON). Download it.
7. Open the JSON file, find `private_key`. It looks like `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`.

## 2. Google Sheet Setup

1. Create a new [Google Sheet](https://sheets.new).
2. Look at the URL to find the Sheet ID: `https://docs.google.com/spreadsheets/d/<GOOGLE_SHEET_ID>/edit`.
3. Click **Share** in the top right.
4. Share the sheet with the **Service Account Email** you copied in Step 1. Give it **Editor** permissions.
5. Do NOT make the sheet public.

## 3. Environment Variables

1. Copy `.env.example` to `.env`.
2. Fill in the variables using the information gathered above.

```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_super_secret_random_string_here
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
INITIAL_ADMIN_EMAIL=admin@masar.com
INITIAL_ADMIN_PASSWORD=securepassword
INITIAL_ADMIN_NAME=Admin
```

## 4. Run Setup Script

Once your `.env` file is ready, you must initialize the Google Sheet structure:

```bash
npm run typecheck # Ensure everything is compiled (tsx handles execution directly)
npx tsx scripts/setup-google-sheet.ts
```

This script will automatically:
- Create all required worksheets (`Patients`, `Medications`, `Refill History`, etc.)
- Set up column headers
- Create the initial Admin user
- Seed default settings and message templates

## 5. Local Development

Start the development server:

```bash
npm install
npm run dev
```

The app will be running at `http://localhost:3000`.

## 6. Testing

The project includes Vitest for business logic.

```bash
npm run test
```

## 7. Deployment to Netlify

This project is configured with a `netlify.toml` file to seamlessly deploy to Netlify as a single-page application with Serverless Functions.

1. Push your repository to GitHub.
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **Add new site** ➔ **Import an existing project**.
4. Connect your GitHub repository.
5. In the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add ALL environment variables from your `.env` file to Netlify's **Environment Variables** section.
   - *Note: Ensure your `GOOGLE_PRIVATE_KEY` handles newlines correctly in Netlify UI. You may need to paste the literal string with `\n` characters.*
7. Click **Deploy Site**.

## Known Limitations & Backup

- **Google Sheets Limits:** Google Sheets is excellent for a lightweight CRM but is not designed for thousands of concurrent requests per second.
- **Backups:** We recommend periodically going to your Google Sheet and downloading a copy (`File -> Download -> Microsoft Excel (.xlsx)`) to keep an offline backup of your data.
- **Scaling:** If the pharmacy grows beyond tens of thousands of records, you can seamlessly replace the `repositories/baseRepository.ts` implementation to connect to PostgreSQL or Supabase without changing the frontend or business logic layer.
