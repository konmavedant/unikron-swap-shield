import { useState, useCallback, useMemo } from 'react';
import { validateAmount, validateSlippage, validateAddress, sanitizeInput, sanitizeAmount } from '@/utils/validation';
import { AppError, ErrorType, ErrorSeverity } from '@/types/errors';
import { APP_CONFIG } from '@/constants/app';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
  sanitizedValue: string;
}

export const useInputValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    name: string,
    value: string,
    rules: ValidationRules = {}
  ): ValidationResult => {
    try {
      // Sanitize input first
      const sanitizedValue = sanitizeInput(value);
      
      // Check required
      if (rules.required && !sanitizedValue.trim()) {
        const error = `${name} is required`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue };
      }

      // Check length constraints
      if (rules.minLength && sanitizedValue.length < rules.minLength) {
        const error = `${name} must be at least ${rules.minLength} characters`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue };
      }

      if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
        const error = `${name} must not exceed ${rules.maxLength} characters`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue };
      }

      // Check pattern
      if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
        const error = `${name} format is invalid`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue };
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(sanitizedValue);
        if (customError) {
          setErrors(prev => ({ ...prev, [name]: customError }));
          return { isValid: false, error: customError, sanitizedValue };
        }
      }

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return { isValid: true, error: null, sanitizedValue };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
      return { isValid: false, error: errorMessage, sanitizedValue: value };
    }
  }, []);

  const validateAmount = useCallback((name: string, amount: string): ValidationResult => {
    try {
      const sanitizedAmount = sanitizeAmount(amount);
      
      if (!sanitizedAmount) {
        return { isValid: true, error: null, sanitizedValue: sanitizedAmount };
      }

      const numericValue = parseFloat(sanitizedAmount);
      
      if (isNaN(numericValue)) {
        const error = 'Please enter a valid number';
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: sanitizedAmount };
      }

      if (numericValue <= 0) {
        const error = 'Amount must be greater than 0';
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: sanitizedAmount };
      }

      if (numericValue < APP_CONFIG.MIN_SWAP_AMOUNT) {
        const error = `Amount must be at least ${APP_CONFIG.MIN_SWAP_AMOUNT}`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: sanitizedAmount };
      }

      // Check decimal places
      const decimalParts = sanitizedAmount.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > APP_CONFIG.MAX_DECIMAL_PLACES) {
        const error = `Maximum ${APP_CONFIG.MAX_DECIMAL_PLACES} decimal places allowed`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: sanitizedAmount };
      }

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return { isValid: true, error: null, sanitizedValue: sanitizedAmount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid amount';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
      return { isValid: false, error: errorMessage, sanitizedValue: amount };
    }
  }, []);

  const validateSlippageValue = useCallback((name: string, slippage: number): ValidationResult => {
    try {
      if (slippage < APP_CONFIG.MIN_SLIPPAGE) {
        const error = `Slippage must be at least ${APP_CONFIG.MIN_SLIPPAGE}%`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: slippage.toString() };
      }

      if (slippage > APP_CONFIG.MAX_SLIPPAGE) {
        const error = `Slippage cannot exceed ${APP_CONFIG.MAX_SLIPPAGE}%`;
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: slippage.toString() };
      }

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return { isValid: true, error: null, sanitizedValue: slippage.toString() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid slippage';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
      return { isValid: false, error: errorMessage, sanitizedValue: slippage.toString() };
    }
  }, []);

  const validateAddressValue = useCallback((name: string, address: string): ValidationResult => {
    try {
      const sanitizedAddress = sanitizeInput(address);
      
      if (!sanitizedAddress.trim()) {
        return { isValid: true, error: null, sanitizedValue: sanitizedAddress };
      }

      // Basic format validation
      const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(sanitizedAddress);
      const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(sanitizedAddress);

      if (!isEthAddress && !isSolanaAddress) {
        const error = 'Invalid wallet address format';
        setErrors(prev => ({ ...prev, [name]: error }));
        return { isValid: false, error, sanitizedValue: sanitizedAddress };
      }

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return { isValid: true, error: null, sanitizedValue: sanitizedAddress };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid address';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
      return { isValid: false, error: errorMessage, sanitizedValue: address };
    }
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  const getError = useCallback((name: string) => errors[name] || null, [errors]);

  return {
    validateField,
    validateAmount,
    validateSlippage: validateSlippageValue,
    validateAddress: validateAddressValue,
    clearError,
    clearAllErrors,
    getError,
    hasErrors,
    errors,
  };
};