import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SHEET_SCHEMAS = {
  'Patients': [
    'Patient ID', 'Full Name', 'Phone', 'WhatsApp', 'Date of Birth', 
    'Age', 'Gender', 'Address', 'Conditions', 'Doctor', 
    'Notes', 'Registration Date', 'Status', 'Created By', 'Updated At'
  ],
  'Medications': [
    'Medication ID', 'Patient ID', 'Drug ID', 'Drug Name', 'Barcode', 
    'Strength', 'Dosage Form', 'Quantity', 'Frequency', 'Days Supply', 
    'Purchase Date', 'Next Refill Date', 'Reminder Date', 'Prescribing Doctor', 
    'Refill Quantity', 'Price', 'Notes', 'Status', 'Created By', 'Created At', 
    'Updated By', 'Updated At'
  ],
  'Refill History': [
    'Refill ID', 'Patient ID', 'Medication ID', 'Previous Purchase Date', 
    'Previous Next Refill Date', 'Refill Date', 'New Next Refill Date', 
    'Days Supply', 'Quantity', 'Price', 'Staff Member', 'Notes', 'Created At'
  ],
  'Messages': [
    'Message ID', 'Patient ID', 'Medication ID', 'WhatsApp Number', 
    'Message', 'Reminder Date', 'WhatsApp Opened At', 'Status', 
    'Staff Member', 'Notes', 'Created At'
  ],
  'Users': [
    'User ID', 'Name', 'Username', 'Password Hash', 'Role', 
    'Status', 'Created At', 'Last Login'
  ],
  'Settings': [
    'Setting', 'Value', 'Description', 'Updated At'
  ],
  'Message Templates': [
    'Template ID', 'Name', 'Language', 'Message', 'Active', 'Default', 'Updated At'
  ],
  'Drug Master': [
    'Drug ID', 'Barcode', 'Drug Name', 'Generic Name', 'Brand Name', 
    'Strength', 'Dosage Form', 'Notes', 'Status'
  ],
  'Audit Log': [
    'Log ID', 'User ID', 'Action', 'Entity', 'Entity ID', 'Description', 'Timestamp'
  ]
};

async function runSetup() {
  console.log('Starting Google Sheets Database Setup for MASAR CRM...');
  
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !sheetId || sheetId === 'your_google_sheet_id') {
    console.error('❌ ERROR: Missing or default Google Sheets credentials in .env file.');
    console.log('Please follow the instructions in README.md to setup Google Sheets.');
    process.exit(1);
  }

  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }

  try {
    const auth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    console.log('Connecting to Google Sheet...');
    await doc.loadInfo();
    console.log(`✅ Connected successfully to: "${doc.title}"`);

    for (const [sheetTitle, headers] of Object.entries(SHEET_SCHEMAS)) {
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        console.log(`Creating worksheet: "${sheetTitle}"...`);
        sheet = await doc.addSheet({ title: sheetTitle, headerValues: headers });
        console.log(`✅ Created "${sheetTitle}"`);
      } else {
        console.log(`Verifying headers for "${sheetTitle}"...`);
        await sheet.loadHeaderRow().catch(() => {});
        const currentHeaders = sheet.headerValues || [];
        
        // Ensure all required headers exist
        const missingHeaders = headers.filter(h => !currentHeaders.includes(h));
        if (missingHeaders.length > 0) {
          console.log(`Updating headers for "${sheetTitle}"...`);
          // Note: we just set them. It overrides the first row. 
          // If the sheet has data, resizing headers might shift things. We assume this is run on an empty sheet mostly.
          await sheet.setHeaderRow(headers);
        }
        console.log(`✅ Verified "${sheetTitle}"`);
      }
    }

    // Seed default admin user if none exists
    const usersSheet = doc.sheetsByTitle['Users'];
    const users = await usersSheet.getRows();
    if (users.length === 0) {
      console.log('Seeding initial admin user...');
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@masar.com';
      const adminPass = process.env.INITIAL_ADMIN_PASSWORD || 'change_this_in_production';
      const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPass, salt);
      
      await usersSheet.addRow({
        'User ID': 'USR-ADMIN001',
        'Name': adminName,
        'Username': adminEmail,
        'Password Hash': hash,
        'Role': 'Admin',
        'Status': 'Active',
        'Created At': new Date().toISOString()
      });
      console.log(`✅ Created initial admin (${adminEmail})`);
    }

    // Seed default settings if empty
    const settingsSheet = doc.sheetsByTitle['Settings'];
    const settings = await settingsSheet.getRows();
    if (settings.length === 0) {
      console.log('Seeding default settings...');
      const defaultSettings = [
        { Setting: 'Pharmacy Name', Value: 'Massar Al-Dawaa', Description: 'The name of the pharmacy', 'Updated At': new Date().toISOString() },
        { Setting: 'Brand', Value: 'MASAR', Description: 'Short brand name', 'Updated At': new Date().toISOString() },
        { Setting: 'Country Code', Value: '964', Description: 'Default country code for phone numbers', 'Updated At': new Date().toISOString() },
        { Setting: 'Timezone', Value: 'Asia/Baghdad', Description: 'Application timezone', 'Updated At': new Date().toISOString() },
        { Setting: 'Reminder Days', Value: '3', Description: 'Days before refill to send reminder', 'Updated At': new Date().toISOString() },
        { Setting: 'Currency', Value: 'IQD', Description: 'Default currency', 'Updated At': new Date().toISOString() },
      ];
      await settingsSheet.addRows(defaultSettings);
      console.log('✅ Seeded default settings');
    }

    // Seed default message template if empty
    const templatesSheet = doc.sheetsByTitle['Message Templates'];
    const templates = await templatesSheet.getRows();
    if (templates.length === 0) {
      console.log('Seeding default message templates...');
      await templatesSheet.addRow({
        'Template ID': 'TPL-00000001',
        'Name': 'Default English',
        'Language': 'English',
        'Message': 'Hello {{patient_name}}, this is {{pharmacy_name}}. Your medication {{drug_name}} is due for refill in {{days_remaining}} days. Please contact us or visit {{pharmacy_name}} to arrange your refill. Thank you.',
        'Active': 'Yes',
        'Default': 'Yes',
        'Updated At': new Date().toISOString()
      });
      console.log('✅ Seeded default templates');
    }

    // Delete default "Sheet1" if it exists and is not needed
    const sheet1 = doc.sheetsByTitle['Sheet1'];
    if (sheet1) {
      console.log('Deleting default "Sheet1"...');
      await sheet1.delete();
      console.log('✅ Deleted "Sheet1"');
    }

    console.log('\n🎉 Setup completed successfully!');

  } catch (error: any) {
    console.error('❌ ERROR during setup:', error.message);
    process.exit(1);
  }
}

runSetup();
