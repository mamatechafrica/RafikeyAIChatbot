# Rafikey AI Chatbot

Rafikey AI is an intelligent chatbot application built with Vue.js that provides users with interactive AI-powered conversations. The application features a modern, responsive design with user authentication, chat history management, and real-time messaging capabilities.

## ✨ Features

- **🤖 AI-Powered Conversations**: Interactive chatbot with intelligent responses
- **🔐 User Authentication**: Secure login, registration, and password recovery
- **💬 Chat History**: Persistent conversation history for logged-in users
- **🎨 Modern UI**: Beautiful, responsive design with dark/light theme support
- **📱 Mobile Responsive**: Optimized for all device sizes
- **⚡ Real-time Updates**: Live chat updates and notifications
- **🔒 Privacy & Terms**: Built-in privacy policy and terms of service
- **🎯 Guest Mode**: Try the chatbot without creating an account
- **📊 Loading Screens**: Smooth loading experiences with animated screens
- **🔄 Password Recovery**: Secure password reset functionality

## 🛠 Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Pinia** - Vue state management
- **Vue Router** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS components
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful SVG icons

### Features & Utilities
- **Marked** - Markdown parser for rich text formatting
- **Highlight.js** - Syntax highlighting for code blocks
- **JWT Decode** - JSON Web Token handling
- **VeeValidate** - Form validation
- **Moment.js** - Date and time manipulation
- **Lodash** - Utility library
- **UUID** - Unique identifier generation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/mamatechafrica/RafikeyAIChatbot.git
cd RafikeyAIChatbot
```

### 2. Navigate to the frontend directory
```bash
cd rafikey-frontend
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📝 Available Scripts

In the `rafikey-frontend` directory, you can run:

### Development
- `npm run dev` - Start development server with hot reload
- `npm run preview` - Preview production build locally

### Building
- `npm run build` - Build for production
- `npm run build-only` - Build without type checking
- `npm run type-check` - Run TypeScript type checking

### Code Quality
- `npm run lint` - Run all linters (ESLint + Oxlint)
- `npm run lint:eslint` - Run ESLint with auto-fix
- `npm run lint:oxlint` - Run Oxlint with auto-fix
- `npm run format` - Format code with Prettier

### Deployment Utilities
- `npm run clear-pub` - Clear public assets
- `npm run sync-pub` - Sync dist to public folder
- `npm run zip-pub` - Create deployment zip file

## 📁 Project Structure

```
RafikeyAIChatbot/
├── rafikey-frontend/              # Main Vue.js application
│   ├── src/
│   │   ├── components/            # Reusable Vue components
│   │   │   ├── chat/             # Chat-related components
│   │   │   └── toasts/           # Notification components
│   │   ├── views/                # Page components
│   │   │   ├── auth/             # Authentication pages
│   │   │   └── chatbot/          # Chat interface pages
│   │   ├── stores/               # Pinia state management
│   │   ├── router/               # Vue Router configuration
│   │   ├── assets/               # Static assets
│   │   └── modules/              # Feature modules
│   ├── public/                   # Public static files
│   ├── dist/                     # Production build output
│   └── package.json              # Dependencies and scripts
└── README.md                     # This file
```

## 🎯 Key Components

### Authentication System
- User registration and login
- Password recovery functionality
- JWT-based authentication
- Protected routes and user sessions

### Chat Interface
- Real-time messaging with AI
- Message history persistence
- Markdown support for rich formatting
- Code syntax highlighting
- Typing indicators and loading states

### User Experience
- Responsive design for all devices
- Dark/light theme toggle
- Toast notifications for feedback
- Error handling and loading states

## 🔧 Configuration

### Environment Setup
Create environment configuration files as needed for:
- API endpoints
- Authentication settings
- Theme preferences
- Feature flags

### Customization
The application supports extensive customization through:
- Tailwind CSS configuration
- Component theming
- Route configuration
- Store modules

## 🤝 Contributing

We welcome contributions to Rafikey AI! Here's how you can help:

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use Prettier for code formatting
- Follow Vue 3 Composition API patterns
- Write meaningful commit messages
- Add comments for complex logic

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include browser and environment information
- Add screenshots for UI issues

## 📄 License

This project is open source. Please check with the repository maintainers regarding the specific license terms.

## 🏢 About Mama Tech Africa

Rafikey AI is developed by [Mama Tech Africa](https://github.com/mamatechafrica), an organization dedicated to advancing technology solutions across Africa.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ by Mama Tech Africa**