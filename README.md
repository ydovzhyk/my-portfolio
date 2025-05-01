
# 💻 Developer Portfolio

<p align="center" width="100%">
  <img height="400" src="https://github.com/ydovzhyk/my-portfolio/blob/main/app/assets/main.png" alt="Preview">
</p>

## 🔖 Sections

- 🧑‍💼 HERO SECTION
- 👨‍🎨 ABOUT ME
- 💼 EXPERIENCE
- 🛠️ SKILLS
- 📁 PROJECTS
- 🎓 EDUCATION
- 📝 BLOG
- 📬 CONTACTS

---

## 🎮 Usage

Create a new `.env` file based on `.env.example`.

```env
NEXT_PUBLIC_GTM=
NEXT_PUBLIC_APP_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
GMAIL_PASSKEY=
EMAIL_ADDRESS=
```

### Customize data in `utils/data` folder

Example (`personal-data.js`):

```js
export const personalData = {
  name: "Yuriy Dovzhyk",
  profile: "/profile.png",
  designation: "Full Stack Developer",
  description: "My name is Yuriy Dovzhyk...",
  email: "ydovzhyk@gmail.com",
  phone: "+380503562938",
  address: "Kyiv, Ukraine",
  github: 'https://github.com/ydovzhyk',
  facebook: 'https://www.facebook.com/ydovzhyk/',
  linkedIn: 'https://www.linkedin.com/in/yuriy-dovzhyk/',
  devUsername: "ydovzhyk",
  resume: "...",
};
```

---

## 🚀 Deployment

### 📦 Deploying to Vercel

1. Sign up at [Vercel](https://vercel.com/)
2. Click **"New Project"** and import your GitHub repo
3. Add environment variables from `.env`
4. Click **Deploy**
5. Done — live in seconds

### 🟢 Deploying to Netlify

1. Log in at [Netlify](https://www.netlify.com/)
2. Select **New Site from Git**
3. Link your GitHub repo
4. Add your environment variables
5. Click **Deploy Site**

---

## 🔧 Tutorials

### 📧 Gmail App Password Setup

1. Go to [myaccount.google.com](https://myaccount.google.com/)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Choose app: "Mail", device: "Other", name it (e.g., "Portfolio")
5. Generate password → save as `GMAIL_PASSKEY`
6. Go directly to [apppasswords](https://myaccount.google.com/apppasswords)

### 🤖 Create a Telegram Bot

1. Search **@BotFather** in Telegram
2. Use `/newbot` command
3. Set a name and username
4. Copy the token → `TELEGRAM_BOT_TOKEN`
5. Send message to the bot
6. Visit:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
7. Copy your `chat.id` → `TELEGRAM_CHAT_ID`

---

## 📦 Packages Used

| 📦 Package               |
|--------------------------|
| @emailjs/browser         |
| @next/third-parties      |
| axios                    |
| lottie-react             |
| next                     |
| nodemailer               |
| react                    |
| react-dom                |
| react-fast-marquee       |
| react-google-recaptcha   |
| react-icons              |
| react-toastify           |
| sharp                    |
| sass                     |
| tailwindcss              |

---

## ℹ️ FAQ

### ❓ `next` is not recognized...

Run:

```bash
npm install -g next
```

Then:

```bash
npm run dev
```

---

## 🙏 Credits

This project is based on the [original repository by Abu Said](https://github.com/said7388/developer-portfolio).

> Minor component changes were made for personal customization.
> All credits and appreciation go to the original author.


