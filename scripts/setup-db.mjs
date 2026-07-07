import { createClient } from '@libsql/client'
import { scryptSync, randomBytes } from 'crypto'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL no configurada')
  process.exit(1)
}

// Para libsql:// con authToken en query string
const [baseUrl, query] = url.split('?')
const authToken = query?.replace('authToken=', '')

const client = createClient({ url: baseUrl, authToken })

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

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
  `CREATE TABLE IF NOT EXISTS User (
    id                TEXT PRIMARY KEY,
    email             TEXT UNIQUE NOT NULL,
    passwordHash      TEXT NOT NULL,
    name              TEXT NOT NULL,
    role              TEXT NOT NULL,
    resetToken        TEXT,
    resetTokenExpires TEXT,
    createdAt         TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt         TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS BeneficiaryLog (
    id            TEXT PRIMARY KEY,
    beneficiaryId TEXT NOT NULL,
    userId        TEXT,
    action        TEXT NOT NULL,
    createdAt     TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS DonationLog (
    id         TEXT PRIMARY KEY,
    donationId TEXT NOT NULL,
    userId     TEXT NOT NULL,
    action     TEXT NOT NULL,
    createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
]

for (const sql of tables) {
  await client.execute(sql)
  console.log('✓', sql.trim().split('\n')[0])
}

// Crear usuario administrador por defecto
const adminPassHash = hashPassword('PuenteVE2026!')
await client.execute({
  sql: `INSERT INTO User (id, email, passwordHash, name, role) 
        VALUES (?, ?, ?, ?, ?) 
        ON CONFLICT(email) DO NOTHING`,
  args: ['admin-default', 'admin@puenteve.com', adminPassHash, 'Admin Principal', 'admin'],
})

console.log('✓ Usuario admin registrado')
console.log('\n✅ Base de datos y tablas inicializadas con éxito')
