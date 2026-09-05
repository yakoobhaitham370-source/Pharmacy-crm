import { normalizePhoneNumber } from './phoneLogic';

export function generateWhatsAppLink(
  phone: string, 
  messageTemplate: string, 
  variables: Record<string, string>
): string {
  const normalizedPhone = normalizePhoneNumber(phone);
  
  let finalMessage = messageTemplate;
  for (const [key, value] of Object.entries(variables)) {
    // Replace all occurrences
    finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  const encodedMessage = encodeURIComponent(finalMessage);
  
  // Use WhatsApp Web for desktop, or wa.me universally
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}
