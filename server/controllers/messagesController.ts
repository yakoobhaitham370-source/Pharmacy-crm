import { Request, Response } from 'express';
import { GoogleSheetRepository } from '../repositories/baseRepository.js';
import { SHEET_NAMES } from '../services/google-sheets.js';

interface MessageRecord {
  'Message ID': string;
  'Patient ID': string;
  'Medication ID': string;
  'WhatsApp Number': string;
  'Message': string;
  'Reminder Date': string;
  'WhatsApp Opened At': string;
  'Status': string;
  'Staff Member': string;
  'Notes': string;
  'Created At': string;
}

const messageRepository = new GoogleSheetRepository<MessageRecord>(SHEET_NAMES.MESSAGES);

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await messageRepository.findAll();
    res.json({ success: true, data: { messages } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch messages' } });
  }
};

export const recordMessageAction = async (req: Request, res: Response) => {
  try {
    const { patientId, medicationId, whatsappNumber, message, reminderDate, action, notes } = req.body;
    
    const newId = `MSG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Status can be: 'WhatsApp Opened', 'Contacted', 'Reminder Sent', 'Copy Only'
    const status = action === 'copy' ? 'Copy Only' : action === 'open' ? 'WhatsApp Opened' : action;
    
    const newMsg: MessageRecord = {
      'Message ID': newId,
      'Patient ID': patientId,
      'Medication ID': medicationId || '',
      'WhatsApp Number': whatsappNumber,
      'Message': message,
      'Reminder Date': reminderDate || '',
      'WhatsApp Opened At': new Date().toISOString(),
      'Status': status,
      'Staff Member': req.user?.username || 'Unknown',
      'Notes': notes || '',
      'Created At': new Date().toISOString()
    };
    
    const created = await messageRepository.insert(newMsg);
    res.json({ success: true, data: { message: created } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to record message action' } });
  }
};
