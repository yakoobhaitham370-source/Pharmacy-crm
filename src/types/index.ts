export interface User {
  id: string;
  name: string;
  username: string;
  role: 'Admin' | 'Pharmacist' | 'Staff';
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  address: string;
  conditions: string;
  doctor: string;
  notes: string;
  registrationDate: string;
  status: string;
}

export interface Medication {
  id: string;
  patientId: string;
  drugId: string;
  drugName: string;
  barcode: string;
  strength: string;
  dosageForm: string;
  quantity: number;
  frequency: string;
  daysSupply: number;
  purchaseDate: string;
  nextRefillDate: string;
  reminderDate: string;
  prescribingDoctor: string;
  refillQuantity: number;
  price: number;
  notes: string;
  status: string;
}
