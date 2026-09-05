import { Request, Response } from 'express';
import { GoogleSheetRepository } from '../repositories/baseRepository.js';
import { SHEET_NAMES } from '../services/google-sheets.js';

interface MedicationRecord {
  'Medication ID': string;
  'Patient ID': string;
  'Drug ID': string;
  'Drug Name': string;
  'Barcode': string;
  'Strength': string;
  'Dosage Form': string;
  'Quantity': string | number;
  'Frequency': string;
  'Days Supply': string | number;
  'Purchase Date': string;
  'Next Refill Date': string;
  'Reminder Date': string;
  'Prescribing Doctor': string;
  'Refill Quantity': string | number;
  'Price': string | number;
  'Notes': string;
  'Status': string;
  'Created By': string;
  'Created At': string;
  'Updated By': string;
  'Updated At': string;
}

const medRepository = new GoogleSheetRepository<MedicationRecord>(SHEET_NAMES.MEDICATIONS);

export const getMedications = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let medications;
    
    if (patientId) {
      medications = await medRepository.findBy({ 'Patient ID': patientId as string });
    } else {
      medications = await medRepository.findAll();
    }
    
    res.json({ success: true, data: { medications } });
  } catch (error: any) {
    console.error('getMedications error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch medications' } });
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    const medData = req.body;
    
    const newId = `MED-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const newMed: MedicationRecord = {
      ...medData,
      'Medication ID': newId,
      'Created By': req.user?.username || 'Unknown',
      'Created At': new Date().toISOString(),
      'Updated By': req.user?.username || 'Unknown',
      'Updated At': new Date().toISOString(),
      'Status': 'Active'
    };
    
    const created = await medRepository.insert(newMed);
    res.json({ success: true, data: { medication: created } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create medication' } });
  }
};

export const updateMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    updateData['Updated By'] = req.user?.username || 'Unknown';
    updateData['Updated At'] = new Date().toISOString();
    
    const updated = await medRepository.update('Medication ID', id, updateData);
    
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Medication not found' } });
    }
    
    res.json({ success: true, data: { medication: updated } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update medication' } });
  }
};
