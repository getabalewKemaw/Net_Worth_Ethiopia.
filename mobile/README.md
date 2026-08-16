# NetWorth Ethiopia

An offline-first Android expense tracker that automatically extracts transaction data from SMS messages, stores data locally for offline access, and synchronizes data with a cloud database.

---

## Overview

NetWorth Ethiopia is designed to help users manage their finances through:

- Expense tracking
- Automatic SMS transaction detection
- Offline bookkeeping
- Cloud synchronization
- Financial reporting
- Budget management
- Transaction categorization

---

# Technology Stack

| Technology | Purpose |
| --- | --- |
| Expo SDK 57 | Mobile development |
| React Native | Cross-platform UI |
| TypeScript | Type safety |
| Expo Router | Navigation |
| SQLite | Local offline database |
| Cloud Database | Data synchronization |
| EAS | Android builds |
| Git | Version control |
| GitHub | Team collaboration |

---

# Prerequisites

Before running the project, install the following tools.

## Git

Verify the installation:

```bash
git --version
```

---

## Node.js

Recommended version:

```text
Node.js 22 LTS or later
```

Verify:

```bash
node -v
npm -v
```

---

## EAS CLI

Install EAS globally:

```bash
npm install -g eas-cli
```

Verify:

```bash
eas --version
```

---

## Expo Account

Create an Expo account if you don't already have one.

Log in:

```bash
eas login
```

---

# Project Setup

## Clone the repository

```bash
git clone <repository-url>
```

---

## Navigate to the project directory

```bash
cd <project-folder>
```

---

## Install dependencies

```bash
npm install
```

---

## Verify the Expo SDK version

```bash
npx expo config --json | grep -o '"sdkVersion":"[^"]*"'
```

Expected output:

```text
"sdkVersion":"57.0.0"
```

---

# Running the Project

## Start the development server

```bash
npx expo start
```

---

## Create an Android development build

```bash
eas build --profile development --platform android
```

After the build is completed:

1. Open the generated build link.
2. Download the APK.
3. Install it on an Android device.

---

# Project Structure

```text
net-worth/
├── assets/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── reports/
│   │   ├── sms/
│   │   └── settings/
│   │
│   ├── database/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── assets/
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

---

# Development Workflow

## Pull the latest changes

```bash
git pull
```

---

## Create a feature branch

```bash
git checkout -b feature/<feature-name>
```

Examples:

```text
feature/auth
feature/dashboard
feature/sms
feature/offline-sync
feature/reports
```

---

## Check modified files

```bash
git status
```

---

## Stage changes

```bash
git add .
```

---

## Commit changes

```bash
git commit -m "feat: add authentication screen"
```

---

## Push the branch

```bash
git push origin <branch-name>
```

---

# Important Rules

- Never commit directly to the main branch.
- Always create a feature branch.
- Pull the latest changes before starting work.
- Keep commits small and focused.
- Test changes before pushing.
- Review code before merging.
- Do not modify project configuration files without team approval.

---

# Useful Commands

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Check Expo configuration
npx expo config --type public

# Check Git status
git status

# Pull the latest changes
git pull

# Create a new branch
git checkout -b feature/<feature-name>

# Build an Android development version
eas build --profile development --platform android
```