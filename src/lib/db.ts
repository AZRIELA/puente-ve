import { createClient } from '@libsql/client'

function getClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')

  if (url.startsWith('libsql://')) {
    const [base, query] = url.split('?')
    const authToken = query?.replace('authToken=', '')
    return createClient({ url: base, authToken })
  }

  // local sqlite
  return createClient({ url: url.startsWith('file:') ? url : `file:${url}` })
}

export const db = getClient()
