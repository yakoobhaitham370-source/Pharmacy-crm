import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

dotenv.config();

let doc: GoogleSpreadsheet | null = null;
let isInitialized = false;

// The structure of our Google Sheets based database
export const SHEET_NAMES = {
  PATIENTS: 'Patients',
  MEDICATIONS: 'Medications',
  REFILL_HISTORY: 'Refill History',
  MESSAGES: 'Messages',
  USERS: 'Users',
  SETTINGS: 'Settings',
  MESSAGE_TEMPLATES: 'Message Templates',
  DRUG_MASTER: 'Drug Master',
  AUDIT_LOG: 'Audit Log'
};

export async function getGoogleSheet(): Promise<GoogleSpreadsheet> {
  if (isInitialized && doc) return doc;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !sheetId) {
    throw new Error('Missing Google Sheets credentials in environment variables.');
  }

  // Handle keys that might have escaped newlines from .env parsing
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  // Handle keys wrapped in quotes
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }

  const auth = new JWT({
    email: email,
    key: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  doc = new GoogleSpreadsheet(sheetId, auth);
  
  await doc.loadInfo();
  isInitialized = true;
  
  return doc;
}

export async function getWorksheet(sheetName: string): Promise<GoogleSpreadsheetWorksheet> {
  const document = await getGoogleSheet();
  
  // Find worksheet by title
  let sheet = document.sheetsByTitle[sheetName];
  
  if (!sheet) {
    throw new Error(`Worksheet "${sheetName}" not found. Run setup script.`);
  }
  
  return sheet;
}

// Helper to safely execute sheet operations with a retry on timeout
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Unreachable");
}
