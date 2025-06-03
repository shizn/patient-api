import * as crypto from 'crypto';

export interface EncryptionOptions {
  secretKey: string;
  ivLength: number;
  algorithm: string;
}

interface EncryptionResult {
  encryptedData: string;
  iv: string;
}

const DEFAULT_OPTIONS: Omit<EncryptionOptions, 'secretKey'> = {
  ivLength: 16, // 16 bytes = 128 bits
  algorithm: 'aes-256-cbc',
};

/**
 * Encrypts a string using the specified encryption options
 * 
 * @param data - The string data to encrypt
 * @param options - Encryption configuration options
 * @returns Encrypted data with initialization vector
 * @throws Error if encryption fails
 */
export function encrypt(data: string, options: EncryptionOptions): EncryptionResult {
  try {
    const { secretKey, algorithm = DEFAULT_OPTIONS.algorithm, ivLength = DEFAULT_OPTIONS.ivLength } = options;

          const iv = crypto.randomBytes(ivLength);
    
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(secretKey.padEnd(32).slice(0, 32)), // Ensure key is 32 bytes for aes-256
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${(error as Error).message}`);
  }
}

/**
 * Decrypts an encrypted string using the provided options
 * 
 * @param encryptedData - The encrypted data to decrypt
 * @param iv - Initialization vector used during encryption
 * @param options - Decryption configuration options
 * @returns Original decrypted string
 * @throws Error if decryption fails
 */
export function decrypt(
  encryptedData: string,
  iv: string,
  options: EncryptionOptions
): string {
  try {
    const { secretKey, algorithm = DEFAULT_OPTIONS.algorithm } = options;
    
    // Create decipher with same key and iv
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(secretKey.padEnd(32).slice(0, 32)), // Ensure key is 32 bytes for aes-256
      Buffer.from(iv, 'hex')
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${(error as Error).message}`);
  }
}

/**
 * Generates a random encryption key of the specified length
 * 
 * @param length - Length of the key to generate in bytes
 * @returns Hex string representation of the generated key
 */
export function generateEncryptionKey(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}