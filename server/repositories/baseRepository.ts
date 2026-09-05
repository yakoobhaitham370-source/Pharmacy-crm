import { getWorksheet } from '../services/google-sheets.js';

export interface BaseRecord {
  [key: string]: any;
}

export class GoogleSheetRepository<T extends BaseRecord> {
  private sheetName: string;

  constructor(sheetName: string) {
    this.sheetName = sheetName;
  }

  async findAll(): Promise<T[]> {
    const sheet = await getWorksheet(this.sheetName);
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject() as unknown as T);
  }

  async findBy(criteria: Partial<T>): Promise<T[]> {
    const all = await this.findAll();
    return all.filter(record => {
      return Object.entries(criteria).every(([key, value]) => record[key as keyof T] === value);
    });
  }

  async findOneBy(criteria: Partial<T>): Promise<T | null> {
    const sheet = await getWorksheet(this.sheetName);
    const rows = await sheet.getRows();
    for (const row of rows) {
      const obj = row.toObject() as unknown as T;
      let matches = true;
      for (const [key, value] of Object.entries(criteria)) {
        if (obj[key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) return obj;
    }
    return null;
  }

  async insert(data: T): Promise<T> {
    const sheet = await getWorksheet(this.sheetName);
    const row = await sheet.addRow(data as any);
    return row.toObject() as unknown as T;
  }

  async update(idKey: keyof T, idValue: string, data: Partial<T>): Promise<T | null> {
    const sheet = await getWorksheet(this.sheetName);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get(idKey as string) === idValue);
    
    if (!row) return null;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        row.set(key, value);
      }
    }
    
    await row.save();
    return row.toObject() as unknown as T;
  }
}
