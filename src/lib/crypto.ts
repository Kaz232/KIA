// Gera um sal aleatório de 16 bytes para cada credencial
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Gera o hash SHA-256 combinando o valor original com o sal
export async function hashWithSHA256(data: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Compara uma credencial recebida com o hash guardado
export async function verifySHA256(input: string, storedHash: string, salt: string): Promise<boolean> {
  const inputHash = await hashWithSHA256(input, salt);
  return inputHash === storedHash;
}
