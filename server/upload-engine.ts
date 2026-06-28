import path from 'path';

// Supported file formats and their corresponding expected magic bytes (file signatures)
const ALLOWED_EXTENSIONS = [
  // Images
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
  // Documents
  'pdf', 'zip', 'rar', '7z',
  // Digital Products
  'exe', 'apk', 'aab', 'ipa', 'php', 'sql', 'json', 'xml', 'docx', 'xlsx', 'pptx',
  'fig', 'psd', 'ai', 'blend', 'unitypackage', 'mp4', 'mp3'
];

// Map of file extensions to their corresponding expected magic bytes prefix (Hex string)
const FILE_SIGNATURES: Record<string, string[]> = {
  png: ['89504e47'],
  jpg: ['ffd8ff'],
  jpeg: ['ffd8ff'],
  gif: ['47494638'],
  pdf: ['25504446'],
  zip: ['504b0304', '504b0506', '504b0708'],
  rar: ['52617221'],
  '7z': ['377abcaf271c'],
  exe: ['4d5a'],
  mp3: ['494433', 'fffb', 'fffa', 'fff3'],
  mp4: ['0000001866747970', '0000002066747970', '0000001466747970'],
  psd: ['38425053'], // 8BPS
  // WebP signature at offset 8 (RIFF....WEBP) - we'll handle custom matching
  webp: ['52494646'],
  // Others have standard text structure, which we pass through or validate textually
};

// Size Limits in Bytes
export const LIMIT_IMAGE = 20 * 1024 * 1024;        // 20 MB
export const LIMIT_TEMP = 50 * 1024 * 1024 * 1024;    // 50 GB
export const LIMIT_PRODUCT = 105 * 1024 * 1024 * 1024; // 100 GB+ (105 GB limit)

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedExt?: string;
}

export class UploadEngine {
  /**
   * Scan and Validate the Uploaded File for malicious vectors and format consistency
   */
  static validateFile(
    filename: string,
    fileSize: number,
    mimeType: string,
    buffer?: Buffer,
    uploadType: 'image' | 'product' | 'temp' = 'temp'
  ): ValidationResult {
    // 1. Path Traversal scan
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return { isValid: false, error: 'OMYRA Shield Block: Potential path traversal attack detected.' };
    }

    // 2. Double Extension Scan
    const dotsCount = (filename.match(/\./g) || []).length;
    if (dotsCount > 1) {
      // Check if any of the intermediate parts contain malicious executable file types
      const lowerFile = filename.toLowerCase();
      if (
        lowerFile.includes('.exe') ||
        lowerFile.includes('.sh') ||
        lowerFile.includes('.bat') ||
        lowerFile.includes('.php') ||
        lowerFile.includes('.js')
      ) {
        return { isValid: false, error: 'OMYRA Shield Block: Multi-extension executable spoof attempt detected.' };
      }
    }

    // 3. Extract and check extension
    const ext = path.extname(filename).slice(1).toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return { isValid: false, error: `OMYRA Shield Block: Extension .${ext} is not supported for downloads or assets.` };
    }

    // 4. Validate size limits
    let limit = LIMIT_TEMP;
    if (uploadType === 'image') limit = LIMIT_IMAGE;
    if (uploadType === 'product') limit = LIMIT_PRODUCT;

    if (fileSize > limit) {
      return {
        isValid: false,
        error: `Payload Limit Exceeded: Max allowed size for ${uploadType} is ${(limit / (1024 * 1024 * 1024)).toFixed(1)} GB.`
      };
    }

    // 5. File Signature (Magic Bytes) Verification
    if (buffer && buffer.length > 0) {
      const signatureKey = ext === 'jpeg' ? 'jpg' : ext;
      const expectedSignatures = FILE_SIGNATURES[signatureKey];

      if (expectedSignatures) {
        // Read first 16 bytes for checking headers
        const fileHex = buffer.slice(0, 16).toString('hex').toLowerCase();
        const matchesAny = expectedSignatures.some((sig) => fileHex.startsWith(sig));

        if (!matchesAny) {
          // Special exception checks
          if (ext === 'webp' && fileHex.startsWith('52494646') && fileHex.includes('57454250')) {
            // Valid WebP
          } else {
            return {
              isValid: false,
              error: `OMYRA Shield Block: Mismatched file signature (Magic Bytes). File content does not match .${ext} standards.`
            };
          }
        }
      }

      // Check for raw executable signatures inside binary buffers
      const binaryHex = buffer.slice(0, 4).toString('hex').toLowerCase();
      if (ext !== 'exe' && binaryHex.startsWith('4d5a')) {
        return { isValid: false, error: 'OMYRA Shield Block: Executable code payload detected in non-exe container.' };
      }
    }

    return { isValid: true, normalizedExt: ext };
  }
}
