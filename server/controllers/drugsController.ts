import { Request, Response } from 'express';
import { GoogleSheetRepository } from '../repositories/baseRepository.js';
import { SHEET_NAMES } from '../services/google-sheets.js';

interface DrugRecord {
  'Drug ID': string;
  'Barcode': string;
  'Drug Name': string;
  'Generic Name': string;
  'Brand Name': string;
  'Strength': string;
  'Dosage Form': string;
  'Notes': string;
  'Status': string;
}

const drugRepository = new GoogleSheetRepository<DrugRecord>(SHEET_NAMES.DRUG_MASTER);

export const getDrugs = async (req: Request, res: Response) => {
  try {
    const drugs = await drugRepository.findAll();
    res.json({ success: true, data: { drugs } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch drugs' } });
  }
};

export const createDrug = async (req: Request, res: Response) => {
  try {
    const drugData = req.body;
    
    // Check if barcode already exists
    if (drugData['Barcode']) {
      const existing = await drugRepository.findOneBy({ 'Barcode': drugData['Barcode'] });
      if (existing) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Drug with this barcode already exists' } });
      }
    }

    const newId = `DRUG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const newDrug: DrugRecord = {
      ...drugData,
      'Drug ID': newId,
      'Status': 'Active'
    };
    
    const created = await drugRepository.insert(newDrug);
    res.json({ success: true, data: { drug: created } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create drug' } });
  }
};

export const updateDrug = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updated = await drugRepository.update('Drug ID', id, updateData);
    
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Drug not found' } });
    }
    
    res.json({ success: true, data: { drug: updated } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update drug' } });
  }
};
