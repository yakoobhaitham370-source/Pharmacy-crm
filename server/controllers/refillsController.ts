import { Request, Response } from 'express';
import { GoogleSheetRepository } from '../repositories/baseRepository.js';
import { SHEET_NAMES } from '../services/google-sheets.js';
// We should import the calculation logic, but for simplicity we will do it here or assume frontend passes the correctly calculated dates.
// However, the instructions say: "Centralize all date calculations in one utility/service."
// So I will move the date logic to a shared utility that both frontend and backend can use, or just implement the calculation in backend as well.
// Wait, the date logic is in `src/utils/dateLogic.ts`. We can import it here since it's TS.

import { calculateNextRefillDate, calculateReminderDate } from '../../src/utils/dateLogic.js';

interface RefillRecord {
  'Refill ID': string;
  'Patient ID': string;
  'Medication ID': string;
  'Previous Purchase Date': string;
  'Previous Next Refill Date': string;
  'Refill Date': string;
  'New Next Refill Date': string;
  'Days Supply': string | number;
  'Quantity': string | number;
  'Price': string | number;
  'Staff Member': string;
  'Notes': string;
  'Created At': string;
}

const refillRepository = new GoogleSheetRepository<RefillRecord>(SHEET_NAMES.REFILL_HISTORY);
// Also need med repository to update current med status
const medRepository = new GoogleSheetRepository<any>(SHEET_NAMES.MEDICATIONS);

export const getRefills = async (req: Request, res: Response) => {
  try {
    const { patientId, medicationId } = req.query;
    let refills = await refillRepository.findAll();
    
    if (patientId) {
      refills = refills.filter(r => r['Patient ID'] === patientId);
    }
    if (medicationId) {
      refills = refills.filter(r => r['Medication ID'] === medicationId);
    }
    
    res.json({ success: true, data: { refills } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch refills' } });
  }
};

export const recordRefill = async (req: Request, res: Response) => {
  try {
    const { 
      medicationId, patientId, previousPurchaseDate, previousNextRefillDate, 
      refillDate, daysSupply, quantity, price, notes 
    } = req.body;
    
    // 1. Calculate new dates
    const newNextRefillDate = calculateNextRefillDate(refillDate, parseInt(daysSupply, 10));
    
    // Fetch default reminder days from settings (ideally), but we'll use default 3 for now, 
    // or frontend can pass it, or we can fetch settings.
    const newReminderDate = calculateReminderDate(newNextRefillDate, 3);
    
    // 2. Create history record
    const newRefillId = `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const newRefill: RefillRecord = {
      'Refill ID': newRefillId,
      'Patient ID': patientId,
      'Medication ID': medicationId,
      'Previous Purchase Date': previousPurchaseDate,
      'Previous Next Refill Date': previousNextRefillDate,
      'Refill Date': refillDate,
      'New Next Refill Date': newNextRefillDate,
      'Days Supply': daysSupply,
      'Quantity': quantity,
      'Price': price || 0,
      'Staff Member': req.user?.username || 'Unknown',
      'Notes': notes || '',
      'Created At': new Date().toISOString()
    };
    
    await refillRepository.insert(newRefill);
    
    // 3. Update current medication
    const updatedMed = await medRepository.update('Medication ID', medicationId, {
      'Purchase Date': refillDate,
      'Next Refill Date': newNextRefillDate,
      'Reminder Date': newReminderDate,
      'Days Supply': daysSupply,
      'Updated By': req.user?.username || 'Unknown',
      'Updated At': new Date().toISOString()
    });
    
    res.json({ success: true, data: { refill: newRefill, medication: updatedMed } });
  } catch (error: any) {
    console.error('Refill recording error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to record refill' } });
  }
};
