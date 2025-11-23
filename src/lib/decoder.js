// Function to decode a Base64 encoded string
export const decodeBase64 = (base64Str) => {
    return Buffer.from(base64Str, 'base64').toString('utf-8');
  };
  