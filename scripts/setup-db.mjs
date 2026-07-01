import { createClient } from '@libsql/client'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL no configurada')
  process.exit(1)
}

// Para libsql:// con authToken en query string
const [baseUrl, query] = url.split('?')
const authToken = query?.replace('authToken=', '')

const client = createClient({ url: baseUrl, authToken })

const tables = [
  `CREATE TABLE IF NOT EXISTS Donation (
    id          TEXT PRIMARY KEY,
    donor       TEXT,
    isAnonymous INTEGER NOT NULL DEFAULT 0,
    amount      REAL NOT NULL,
    currency    TEXT NOT NULL,
    channel     TEXT NOT NULL,
    message     TEXT,
    proofUrl    TEXT,
    status      TEXT NOT NULL DEFAULT 'pending',
    createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS Beneficiary (
    id            TEXT PRIMARY KEY,
    firstName     TEXT NOT NULL,
    lastName      TEXT NOT NULL,
    cedula        TEXT,
    state         TEXT NOT NULL,
    city          TEXT,
    situation     TEXT NOT NULL,
    householdSize TEXT NOT NULL,
    hasMinors     INTEGER NOT NULL DEFAULT 0,
    hasElders     INTEGER NOT NULL DEFAULT 0,
    details       TEXT,
    phone         TEXT NOT NULL,
    altPhone      TEXT,
    usdtWallet    TEXT,
    status        TEXT NOT NULL DEFAULT 'pending',
    createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
]

for (const sql of tables) {
  await client.execute(sql)
  console.log('✓', sql.trim().split('\n')[0])
}

console.log('\n✅ Base de datos lista en Turso')
