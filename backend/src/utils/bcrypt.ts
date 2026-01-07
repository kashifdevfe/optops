import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty123', 'admin123',
    'letmein', 'welcome123', 'monkey123', '123456789', 'password1'
  ];
  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return { isValid: false, error: 'Password is too common. Please choose a stronger password' };
  }

  return { isValid: true };
};

/**
 * Hashes a password using bcrypt with salt rounds
 * @param password - Plain text password to hash
 * @param skipValidation - Skip password strength validation (for admin-generated passwords)
 * @returns Hashed password
 * @throws Error if password validation fails
 */
export const hashPassword = async (password: string, skipValidation: boolean = false): Promise<string> => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required and must be a string');
  }

  // Validate password strength before hashing (unless skipped for admin-generated passwords)
  if (!skipValidation) {
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid password');
    }
  }

  // Hash the password with bcrypt
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  if (!password || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export const generateRandomPassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one character from each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
