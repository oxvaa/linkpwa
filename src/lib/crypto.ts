const b64ToBytes = (value: string) => Uint8Array.from(atob(value.replace(/\s/g, '')), char => char.charCodeAt(0))
const bytesToB64 = (bytes: Uint8Array) => {
  let out = ''
  for (let index = 0; index < bytes.length; index += 0x8000) {
    out += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }
  return btoa(out)
}

export async function encryptMessage(content: Record<string, unknown>, keyBase64: string) {
  const raw = b64ToBytes(keyBase64)
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(JSON.stringify(content))
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, plain))
  const combined = new Uint8Array(iv.length + encrypted.length)
  combined.set(iv)
  combined.set(encrypted, iv.length)
  return bytesToB64(combined)
}

export async function decryptMessage(cipher: string, keyBase64: string) {
  const raw = b64ToBytes(keyBase64)
  const all = b64ToBytes(cipher)
  const iv = all.slice(0, 12)
  const body = all.slice(12)
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt'])
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, body)
  return JSON.parse(new TextDecoder().decode(plain)) as Record<string, unknown>
}
