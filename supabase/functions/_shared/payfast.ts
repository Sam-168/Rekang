import md5 from 'npm:blueimp-md5@2.19.0'

export const processUrl = 'https://sandbox.payfast.co.za/eng/process'
export const validationUrl = 'https://sandbox.payfast.co.za/eng/query/validate'

function payFastEncode(value: string) {
  return encodeURIComponent(value.trim())
    .replace(/[!'()~*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+')
}

export function parameterString(entries: Iterable<[string, string]>, passphrase: string) {
  const values: string[] = []
  for (const [key, value] of entries) {
    if (key !== 'signature' && value !== '') values.push(`${key}=${payFastEncode(value)}`)
  }
  if (passphrase) values.push(`passphrase=${payFastEncode(passphrase)}`)
  return values.join('&')
}

export function signature(entries: Iterable<[string, string]>, passphrase: string) {
  return md5(parameterString(entries, passphrase))
}
