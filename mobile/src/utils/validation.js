// Funções de validação para formulários

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

/**
 * Valida CPF (11 dígitos)
 */
export const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

/**
 * Valida telefone (10 ou 11 dígitos)
 */
export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Valida senha (mínimo 6 caracteres)
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Formata CPF para exibição (000.000.000-00)
 */
export const formatCPF = (cpf) => {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return clean;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata telefone para exibição
 */
export const formatPhone = (phone) => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return clean;
};

/**
 * Remove caracteres não numéricos
 */
export const onlyNumbers = (text) => {
  return text.replace(/\D/g, '');
};

/**
 * Valida campos obrigatórios
 */
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Valida tamanho mínimo
 */
export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

/**
 * Valida tamanho máximo
 */
export const validateMaxLength = (value, max) => {
  return value && value.length <= max;
};
