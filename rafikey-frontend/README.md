# ![img.png](img.png) Rafikey Ai

Rafikey is an Ai powered SRHR chatbot that addresses sexual and reproductive health issues among young people. It is built with Vue3  + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + ESLint + Prettier.


## 🚀 Features
- User account creation 
- User  authentication with JWT
- Anonymous user access
- Profile management
- Chat page with real-time messaging
- Tracking user interactions and feedback
- Service workers for offline support
- Web push notification support
- Chat history feature for users to view past conversations
- Responsive design for mobile and desktop
- Share chat conversations via social media: whatsapp, facebook, twitter, linkedin
- Archival feature for conversations
- Delete feature for past chats
- Dark and light mode

<p>
  <img src="img.png" alt="App Screenshot" width="25" />
  Live link to <a href="https://chat.askrafikey.com/">Rafikey</a>
</p> 

## 🛠️ Rafikey Setup

### 1️⃣ Clone the Repository
```bash
  git clone git@github.com:mamatechafrica/RafikeyAIChatbot.git
  cd RafikeyAIChatbot/rafikey-frontend
```

### 2️⃣ Install Dependencies
```bash
  npm install
```

### 3️⃣ Compile and Hot-Reload for Development
```bash
  npm run dev
```

### 4️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
VITE_APP_RAFIKEY_CHATBOT=your_backend_api_url
VITE_APP_RAFIKEY_CHATBOT_FRONTEND=your_rafikey_frontend_url
VITE_APP_VAPID_PUBLIC=your_vapid_public_key
VITE_APP_VAPID_PRIVATE=your_vapid_private_key
VITE_APP_PUSH_NOTIFICATION_API=your_push_notification_backend_api_url
```

### 5️⃣ Type-Check, Compile and Minify for Production
```bash
  npm run build
```


### 6️⃣ Serves the production build from the dist directory locally to preview it.
```bash
npm run preview
```

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## 📜 License

Rafikey AI © 2025 — Empowering young people with accurate SRHR information through accessible, youth-friendly SRHR information and access to services.
### ⚠️ **Remember:**
The information does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.


