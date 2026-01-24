import { useState, useCallback } from 'react';
import { maskCPF, unmaskCPF, validateCPF, isCPFComplete } from '../utils/cpf';

/**
 * Hook para gerenciar CPF com máscara e validação
 * @returns {object} - { value, maskedValue, error, isValid, onChange, onBlur, clear }
 */
export const useCPF = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const maskedValue = maskCPF(value);

  const validate = useCallback((cpf) => {
    if (!cpf || !isCPFComplete(cpf)) {
      return 'CPF incompleto';
    }
    if (!validateCPF(cpf)) {
      return 'CPF inválido';
    }
    return '';
  }, []);

  const onChange = useCallback((e) => {
    const inputValue = e.target.value;
    // Remove caracteres não numéricos e limita a 11 dígitos
    const numbers = inputValue.replace(/\D/g, '').slice(0, 11);
    setValue(numbers);
    
    // Limpa erro ao digitar
    if (error && touched) {
      const newError = validate(numbers);
      setError(newError);
    }
  }, [error, touched, validate]);

  const onBlur = useCallback(() => {
    setTouched(true);
    const validationError = validate(value);
    setError(validationError);
  }, [value, validate]);

  const clear = useCallback(() => {
    setValue('');
    setError('');
    setTouched(false);
  }, []);

  const isValid = !error && isCPFComplete(value) && validateCPF(value);

  return {
    value: unmaskCPF(value), // Retorna apenas números para envio
    maskedValue, // Retorna com máscara para exibição
    error: touched ? error : '', // Só mostra erro se o campo foi tocado
    isValid,
    onChange,
    onBlur,
    clear,
    setValue: (newValue) => {
      const numbers = newValue.replace(/\D/g, '').slice(0, 11);
      setValue(numbers);
    },
  };
};
