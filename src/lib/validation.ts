/**
 * Checks if a value is provided.
 * @param value - The value to check.
 * @returns - An error message if the value is empty, otherwise an empty string.
 */
export const required = (value: string) => {
  if (!value) {
    return "This field is required";
  }
  if (value.length < 2) {
    return "Must be at least 2 characters long";
  }
  return "";
};

/**
 * Validates a phone number.
 * @param value - The phone number to validate.
 * @returns - An error message if the value is empty, otherwise an empty string.
 */
export const phone = (value: string) => {
  if (!value) {
    return "This field is required";
  }
  return "";
};


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