import { useState } from "react";

// Defines the shape of the validation rules for each field.
// Each rule is a function that returns an error message string if validation fails, or an empty string if it passes.
type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K]) => string;
};

// Defines the shape of the errors object, where each key corresponds to a field and the value is the error message.
type Errors<T> = {
  [K in keyof T]?: string;
};

/**
 * A custom hook for handling form validation.
 *
 * @param initialState - The initial state of the form data.
 * @param validationRules - An object containing validation functions for each form field.
 * @returns - An object containing the form data, errors, and functions to handle changes and submission.
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialState: T,
  validationRules: ValidationRules<T>
) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Errors<T>>({});

  /**
   * Handles changes to form inputs and validates the field on change.
   *
   * @param e - The change event from the input, select, or textarea element.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate the field on change and update the error state.
    if (validationRules[name]) {
      const error = validationRules[name]!(value);
      setErrors({
        ...errors,
        [name]: error,
      });
    }
  };

  /**
   * Validates all form fields and returns true if the form is valid, otherwise false.
   *
   * @returns - A boolean indicating whether the form is valid.
   */
  const validate = (): boolean => {
    const newErrors: Errors<T> = {};
    let isValid = true;

    // Iterate over the validation rules and check each field.
    for (const key in validationRules) {
      const rule = validationRules[key];
      const value = formData[key];
      if (rule) {
        const error = rule(value);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Resets the form to its initial state.
   */
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    handleChange,
    validate,
    resetForm,
    setFormData,
  };
};
