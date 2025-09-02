/**
 * Checks if a value is provided.
 * @param value - The value to check.
 * @returns - An error message if the value is empty, otherwise an empty string.
 */
export const required = (value: string) => (value ? "" : "This field is required");

/**
 * Validates a 10-digit phone number.
 * @param phone - The phone number to validate.
 * @returns - An error message if the phone number is invalid, otherwise an empty string.
 */
export const phone = (phone: string) =>
  /^\d{10}$/.test(phone) ? "" : "Phone number must be 10 digits";

/**
 * Validates an email address.
 * @param email - The email address to validate.
 * @returns - An error message if the email is invalid, otherwise an empty string.
 */
export const email = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Invalid email address";

/**
 * Creates a validation function for minimum length.
 * @param minLength - The minimum required length.
 * @returns - A function that validates if a value meets the minimum length.
 */
export const minLength = (minLength: number) => (value: string) =>
  value.length >= minLength ? "" : `Must be at least ${minLength} characters`;
