export function normalizePhoneNumber(phone: string, defaultCountryCode: string = '964'): string {
  // Remove all non-numeric characters
  let numericPhone = phone.replace(/\D/g, '');

  if (!numericPhone) return '';

  // If it already starts with the country code
  if (numericPhone.startsWith(defaultCountryCode)) {
    return numericPhone;
  }

  // If it starts with 0 and is an Iraqi number (e.g., 0770...)
  if (numericPhone.startsWith('0') && defaultCountryCode === '964') {
    return `${defaultCountryCode}${numericPhone.substring(1)}`;
  }

  // Otherwise, just prepend the country code
  return `${defaultCountryCode}${numericPhone}`;
}
