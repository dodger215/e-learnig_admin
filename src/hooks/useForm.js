import { useState, useCallback } from 'react';
import { Form } from 'antd';

export const useForm = (initialValues = {}, options = {}) => {
  const [form] = Form.useForm();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateField = useCallback((name, value) => {
    const rules = options.rules?.[name] || [];
    const fieldErrors = [];

    for (const rule of rules) {
      if (rule.required && !value) {
        fieldErrors.push(rule.message || 'This field is required');
      } else if (rule.pattern && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || 'Invalid format');
      } else if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(rule.message || `Minimum ${rule.minLength} characters required`);
      } else if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(rule.message || `Maximum ${rule.maxLength} characters allowed`);
      } else if (rule.validator && !rule.validator(value)) {
        fieldErrors.push(rule.message || 'Validation failed');
      }
    }

    return fieldErrors;
  }, [options.rules]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(values).forEach(name => {
      const fieldErrors = validateField(name, values[name]);
      if (fieldErrors.length > 0) {
        newErrors[name] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setSubmitting(true);
    
    try {
      if (options.validateOnSubmit !== false) {
        const isValid = validateForm();
        if (!isValid) {
          throw new Error('Form validation failed');
        }
      }
      
      await onSubmit(values, form);
      return { success: true };
    } catch (error) {
      console.error('Form submission error:', error);
      return { success: false, error: error.message };
    } finally {
      setSubmitting(false);
    }
  }, [values, form, validateForm, options.validateOnSubmit]);

  const resetForm = useCallback((newValues = {}) => {
    form.resetFields();
    setValues({ ...initialValues, ...newValues });
    setErrors({});
    setTouched({});
  }, [form, initialValues]);

  const setFieldValue = useCallback((name, value) => {
    form.setFieldValue(name, value);
    handleChange(name, value);
  }, [form, handleChange]);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name],
    onChange: (e) => {
      const value = e?.target ? e.target.value : e;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name),
    error: errors[name]?.[0],
    touched: touched[name],
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    form,
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    validateForm,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldProps,
    setValues,
    setErrors,
    setTouched,
  };
};