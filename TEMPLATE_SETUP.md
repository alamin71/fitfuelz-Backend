# Backend Template ব্যবহার গাইড (Step by Step)

এই ফাইলটি follow করে আপনি এই template থেকে **একদম fresh project** শুরু করতে পারবেন।

---

## 1) Template clone করুন

```bash
git clone <TEMPLATE_REPO_URL>
cd backend-template
```

> `<TEMPLATE_REPO_URL>` এর জায়গায় template repository URL দিন।

---

## 2) Project folder rename করুন (আপনার project name এ)

### Windows (PowerShell)

```powershell
cd ..
Rename-Item backend-template my-new-project
cd my-new-project
```

In cmd.exe:
cd C:\Projects
ren Backend-Template bradmarquis-backend

### macOS/Linux

```bash
cd ..
mv backend-template my-new-project
cd my-new-project
```

---

## 3) পুরানো Git history মুছে fresh repo শুরু করুন

> এই step এর পরে template এর আগের commit history থাকবে না।

### Windows / macOS / Linux (same)

```bash
rm -rf .git
```

### PowerShell alternative (যদি `rm -rf` কাজ না করে)

```powershell
Remove-Item -Recurse -Force .git
```

তারপর নতুন git init করুন:

```bash
git init
git add .
git commit -m "Initial commit from backend template"
```

---

## 4) `package.json` এ project name update করুন

`package.json` খুলে:

- `name` → আপনার project name দিন
- দরকার হলে `description`, `author` update করুন

---

## 5) Environment file setup

```bash
cp .env.example .env
```

PowerShell এ:

```powershell
Copy-Item .env.example .env
```

`.env` এ minimum update করুন:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- Email credentials (`EMAIL_*`)
- AWS S3 credentials:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `AWS_S3_BUCKET_NAME`

---

## 6) Dependency install + run

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

---

## 7) Admin seed run করুন

```bash
npm run seed
```

এতে Super Admin setup হবে (project এর seed script অনুযায়ী)।

---

## 8) Postman collection import করুন

এই project root এ collection file আছে:

- `Backend-Template.postman_collection.json`

Postman এ Import করে `baseUrl` set করুন:

- `http://localhost:5000`

---

## 9) Fresh remote repo তে push করুন

নতুন GitHub repo তৈরি করে:

```bash
git remote add origin <YOUR_NEW_REPO_URL>
git branch -M main
git push -u origin main
```

---

## Quick Fresh Start Commands (Copy-পেস্ট)

### PowerShell (Windows)

```powershell
git clone <TEMPLATE_REPO_URL>
cd backend-template
cd ..
Rename-Item backend-template my-new-project
cd my-new-project
Remove-Item -Recurse -Force .git
git init
Copy-Item .env.example .env
npm install
npm run build
git add .
git commit -m "Initial commit from backend template"
```

### Bash (macOS/Linux)

```bash
git clone <TEMPLATE_REPO_URL>
cd backend-template
cd ..
mv backend-template my-new-project
cd my-new-project
rm -rf .git
git init
cp .env.example .env
npm install
npm run build
git add .
git commit -m "Initial commit from backend template"
```

---

## Important Note

- `.git` delete + `git init` করলে এই template এর **পুরানো commit history থাকবে না**।
- আপনি নতুন project name দিয়ে একদম fresh ভাবে শুরু করতে পারবেন।
