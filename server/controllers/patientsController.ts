import { Request, Response } from 'express';
import { GoogleSheetRepository } from '../repositories/baseRepository.js';
import { SHEET_NAMES } from '../services/google-sheets.js';

interface PatientRecord {
  'Patient ID': string;
  'Full Name': string;
  'Phone': string;
  'WhatsApp': string;
  'Date of Birth': string;
  'Age': string;
  'Gender': string;
  'Address': string;
  'Conditions': string;
  'Doctor': string;
  'Notes': string;
  'Registration Date': string;
  'Status': string;
  'Created By': string;
  'Updated At': string;
}

const patientRepository = new GoogleSheetRepository<PatientRecord>(SHEET_NAMES.PATIENTS);

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await patientRepository.findAll();
    res.json({ success: true, data: { patients } });
  } catch (error: any) {
    console.error('getPatients error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch patients' } });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await patientRepository.findOneBy({ 'Patient ID': id });
    
    if (!patient) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patient not found' } });
    }
    
    res.json({ success: true, data: { patient } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch patient' } });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patientData = req.body;
    
    // Generate simple ID
    const newId = `PAT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const newPatient: PatientRecord = {
      ...patientData,
      'Patient ID': newId,
      'Created By': req.user?.username || 'Unknown',
      'Updated At': new Date().toISOString(),
      'Registration Date': new Date().toISOString().split('T')[0],
      'Status': 'Active'
    };
    
    const created = await patientRepository.insert(newPatient);
    res.json({ success: true, data: { patient: created } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create patient' } });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    updateData['Updated At'] = new Date().toISOString();
    
    const updated = await patientRepository.update('Patient ID', id, updateData);
    
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Patient not found' } });
    }
    
    res.json({ success: true, data: { patient: updated } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update patient' } });
  }
};
