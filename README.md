# Backend Template

Production-ready Node.js/Express backend template with TypeScript, MongoDB, JWT authentication, OTP flows, admin/user modules, and AWS S3 support.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

## Using as Template (Fresh Project Start)

এই template থেকে একদম fresh project শুরু করতে:

1. Template clone করুন

```bash
git clone <TEMPLATE_REPO_URL>
cd backend-template
```

2. Folder rename করুন

PowerShell:

```powershell
cd ..
Rename-Item backend-template my-new-project
cd my-new-project
```

Bash:

```bash
cd ..
mv backend-template my-new-project
cd my-new-project
```

3. পুরানো git history মুছে fresh repo শুরু করুন

```bash
rm -rf .git
```

PowerShell alternative:

```powershell
Remove-Item -Recurse -Force .git
```

তারপর:

```bash
git init
git add .
git commit -m "Initial commit from backend template"
```

4. `.env` configure করুন (`.env.example` থেকে copy)

5. Build + seed run করুন

```bash
npm run build
npm run seed
```

6. নতুন repo তে push করুন

```bash
git remote add origin <YOUR_NEW_REPO_URL>
git branch -M main
git push -u origin main
```

### Important

- `.git` delete + `git init` করলে template এর পুরানো commit history থাকবে না।
- আপনি project name দিয়ে একদম fresh ভাবে শুরু করতে পারবেন।

## Detailed Setup Guide

আরও বিস্তারিত ধাপের জন্য দেখুন: [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md)
