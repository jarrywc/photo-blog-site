import { scrypt } from '@noble/hashes/scrypt';
import { randomBytes } from '@noble/hashes/utils';
import { SignJWT, jwtVerify } from 'jose';
import { User } from '../types';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 32 });

  // Combine salt and hash, then base64 encode
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Decode the stored hash
    const combined = Uint8Array.from(atob(hashedPassword), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    // Hash the provided password with the same salt
    const hash = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 32 });

    // Compare hashes
    if (hash.length !== storedHash.length) return false;

    let result = 0;
    for (let i = 0; i < hash.length; i++) {
      result |= hash[i] ^ storedHash[i];
    }

    return result === 0;
  } catch (error) {
    return false;
  }
}

export async function generateToken(user: User, secret: string): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);

  return await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}