import { describe, it, expect } from 'vitest';
import { generateWhatsAppLink } from '../../src/utils/whatsappLogic';

describe('WhatsApp Logic', () => {
  it('generates correct wa.me link with replaced variables', () => {
    const template = 'Hello {{patient_name}}, medication {{drug_name}} is due in {{days_remaining}} days.';
    const variables = {
      patient_name: 'Ahmed',
      drug_name: 'Metformin',
      days_remaining: '3'
    };
    
    const link = generateWhatsAppLink('07701234567', template, variables);
    
    expect(link).toContain('https://wa.me/9647701234567?text=');
    expect(link).toContain('Hello%20Ahmed%2C%20medication%20Metformin%20is%20due%20in%203%20days.');
  });
});
