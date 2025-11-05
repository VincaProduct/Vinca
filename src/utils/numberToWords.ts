const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function convertHundreds(num: number): string {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' hundred';
    num %= 100;
    if (num > 0) result += ' ';
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += '-' + ones[num];
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += ones[num];
  }
  
  return result;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'zero';
  
  const crores = Math.floor(amount / 10000000);
  const lakhs = Math.floor((amount % 10000000) / 100000);
  const thousands = Math.floor((amount % 100000) / 1000);
  const hundreds = amount % 1000;
  
  let result = '';
  
  if (crores > 0) {
    result += convertHundreds(crores) + ' crore';
    if (lakhs > 0 || thousands > 0 || hundreds > 0) result += ' ';
  }
  
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + ' lakh';
    if (thousands > 0 || hundreds > 0) result += ' ';
  }
  
  if (thousands > 0) {
    result += convertHundreds(thousands) + ' thousand';
    if (hundreds > 0) result += ' ';
  }
  
  if (hundreds > 0) {
    result += convertHundreds(hundreds);
  }
  
  return result.trim();
}

export function formatAmountInWords(amount: number): string {
  const roundedAmount = Math.round(amount);
  const words = numberToWords(roundedAmount);
  return words.charAt(0).toUpperCase() + words.slice(1) + ' rupees';
}

export function formatAmountInCrores(amount: number): string {
  const crores = amount / 10000000;
  if (crores >= 1) {
    return `₹${crores.toFixed(1)} Cr`;
  }
  const lakhs = amount / 100000;
  return `₹${lakhs.toFixed(1)} L`;
}

export function formatAmountInLakhs(amount: number): string {
  const lakhs = amount / 100000;
  return `₹${lakhs.toFixed(1)} lakhs`;
}