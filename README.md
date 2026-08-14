# NetWorth Ethiopia

An offline-first Android expense tracker with automatic SMS transaction detection, cloud synchronization, and intelligent bookkeeping.

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Expo SDK 57 | Mobile application framework |
| React Native | Cross-platform mobile development |
| TypeScript | Type-safe development |
| Expo Router | File-based routing |
| SQLite | Local offline database |
| Cloud Database | Remote data storage |
| EAS | Cloud builds |
| Git | Version control |
| GitHub | Team collaboration |

---

# Prerequisites

Before running the project, install the following tools.

## 1. Install Git

Verify the installation:

```bash
git --version
```

Expected output:

```text
git version 2.x.x
```

---

## 2. Install Node.js

Recommended version:

```text
Node.js 22 LTS
```

Verify the installation:

```bash
node -v
npm -v
```

Expected output:

```text
v22.x.x
10.x.x
```

---

## 3. Install Expo CLI

Verify:

```bash
npx expo --version
```

---

## 4. Install EAS CLI

Install globally:

```bash
npm install -g eas-cli
```

Verify:

```bash
eas --version
```

---

## 5. Create an Expo Account

Create an account:

```text
https://expo.dev
```

Login:

```bash
eas login
```

Verify:

```bash
eas whoami
```

---

# Clone the Repository

Clone the repository:

```bash
git clone https://github.com/yishaq-official/Net_Worth_Ethiopia.git
```

Move into the project directory:

```bash
cd Net_Worth_Ethiopia
```

---

# Install Dependencies

Install all required packages:

```bash
npm install
```

---

# Verify the Environment

Check the Expo SDK version:

```bash
npx expo config --json | grep -o '"sdkVersion":"[^"]*"'
```

Expected output:

```text
"sdkVersion":"57.0.0"
```

---

# Project Configuration

## Expo Configuration

The project uses:

```text
Name: NetWorth
Slug: net-worth
Owner: yishaqs-team
Android Package: com.networthethiopia.app
```

---

## EAS Configuration

Verify that the project is linked:

```bash
eas whoami
```

Expected output:

```text
yishaq
```

---

# Running the Application

## Start the Development Server

```bash
npx expo start
```

---

## Create an Android Development Build

```bash
eas build --profile development --platform android
```

After the build is complete:

1. Open the generated build URL.
2. Download the APK.
3. Install it on your Android device.

---

# Git Workflow

## Update Your Local Repository

```bash
git pull origin main
```

---

## Create a New Branch

Never work directly on the `main` branch.

Create a feature branch:

```bash
git checkout -b feature/auth
```

Examples:

```text
feature/auth
feature/sms
feature/dashboard
feature/offline-sync
feature/reports
```

---

## Commit Changes

Check changes:

```bash
git status
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: implement login screen"
```

Push:

```bash
git push origin feature/auth
```

---

# Project Structure

```text
net-worth/
├── assets/
│
├── src/
│   ├── app/                 # Expo Router pages
│   │
│   ├── components/          # Reusable UI components
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── reports/
│   │   ├── dashboard/
│   │   ├── sms/
│   │   └── settings/
│   │
│   ├── database/            # SQLite
│   │
│   ├── services/            # API services
│   │
│   ├── store/               # Global state
│   │
│   ├── hooks/               # Custom hooks
│   │
│   ├── lib/                 # Third-party configurations
│   │
│   ├── types/               # TypeScript types
│   │
│   └── utils/               # Helper functions
│
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

---

# Development Workflow

```text
Developer
     ↓
Feature Branch
     ↓
Code Changes
     ↓
Commit
     ↓
Push
     ↓
Pull Request
     ↓
Code Review
     ↓
Merge Into Main
```

---

# Important Notes

- Do not modify `app.json` without team approval.
- Do not modify `eas.json` without team approval.
- Do not commit directly to `main`.
- Always pull the latest changes before starting development.
- Use feature branches for all tasks.
- Use EAS for Android builds.
- Use the development build instead of Expo Go.

---

# Useful Commands

```bash
# Install dependencies
npm install

# Start the project
npx expo start

# Check Expo configuration
npx expo config --type public

# Check Git status
git status

# Pull the latest changes
git pull origin main

# Create a branch
git checkout -b feature/your-feature

# Push a branch
git push origin feature/your-feature

# Create an Android development build
eas build --profile development --platform android
```