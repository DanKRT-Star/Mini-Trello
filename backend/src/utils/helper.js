export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatDate(date) {
  return new Date(date).toISOString();
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}