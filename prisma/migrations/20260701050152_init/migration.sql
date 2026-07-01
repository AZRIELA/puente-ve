-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donor" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT,
    "proofUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cedula" TEXT,
    "state" TEXT NOT NULL,
    "city" TEXT,
    "situation" TEXT NOT NULL,
    "householdSize" TEXT NOT NULL,
    "hasMinors" BOOLEAN NOT NULL DEFAULT false,
    "hasElders" BOOLEAN NOT NULL DEFAULT false,
    "details" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "usdtWallet" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
