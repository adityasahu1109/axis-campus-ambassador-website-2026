# 🎓 Campus Ambassador Portal - AXIS 2026

A modern web application to manage campus ambassadors, track their activities, and reward their contributions! Built with love ❤️ for the AXIS 2026 campus ambassador program.

## 📖 What is This Project?

This is a **Campus Ambassador Portal** where students can:
- 🚀 Register as campus ambassadors
- ✅ Complete tasks and submit them
- 🏆 Earn points and climb the leaderboard
- 📢 Stay updated with announcements
- 👤 Manage their profile

And organizers can:
- 📝 Create and manage tasks
- ✔️ Review and approve submissions
- 📊 Track ambassador performance

## ✨ Main Features

### 👨‍🎓 For Students (Ambassadors)
- **📱 Personal Dashboard** - View your points, rank, and pending tasks 
- **🎯 Task Management** - See new tasks and submit your work 
- **🏅 Leaderboard** - Check your ranking among all ambassadors 
- **👤 Profile Page** - Update your information 
- **📣 Announcements** - Stay informed about important updates 

### 👔 For Organizers
- **🎛️ Admin Dashboard** - Manage all ambassadors and their activities 
- **✅ Review Submissions** - Approve or reject ambassador submissions
- **📊 Track Performance** - Monitor points and engagement
- **📋 Task Creation** - Add new tasks for ambassadors

### 🔐 Security Features
- **Secure Login** - Separate login for students and organizers
- **Password Recovery** - Reset forgotten passwords easily 
- **Protected Routes** - Only authorized users can access admin features 

## 🛠️ Technology Stack

This project uses modern and powerful technologies:

- **⚛️ React 19** - For building the user interface 
- **⚡ Vite** - Super fast build tool and development server 
- **🎨 TailwindCSS** - For beautiful, responsive styling 
- **🗄️ Supabase** - Backend database and authentication
- **🧭 React Router** - For smooth navigation between pages 
- **🎭 React Icons** - Beautiful icons throughout the app 

## 📁 Project Structure

```
📦 axis-campus-ambassador-website-2026
├── 📂 src/
│   ├── 📂 components/      # Reusable UI components
│   ├── 📂 pages/           # Different pages of the app
│   ├── 📂 data/            # Data files
│   ├── 📄 App.jsx          # Main app component
│   ├── 📄 AuthContext.jsx  # Authentication logic
│   └── 📄 supabaseClient.js # Database connection
├── 📄 package.json         # Project dependencies
├── 📄 vite.config.js       # Vite configuration
└── 📄 tailwind.config.js   # Tailwind CSS settings
``` 

## 🚀 Getting Started

### Prerequisites

Before you start, make sure you have:
- 📦 **Node.js** installed (version 16 or higher)
- 💻 A code editor (VS Code recommended)
- 🌐 A Supabase account (free tier works!)

### Installation Steps

1. **📥 Clone the repository**
   ```bash
   git clone https://github.com/adityasahu1109/axis-campus-ambassador-website-2026.git
   cd axis-campus-ambassador-website-2026
   ```

2. **📦 Install dependencies**
   ```bash
   npm install
   ``` 

3. **🔧 Setup environment variables**
   
   Create a `.env` file in the root folder and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ``` 

4. **▶️ Start the development server**
   ```bash
   npm run dev
   ```

5. **🎉 Open your browser**
   
   Visit `http://localhost:5173` and you're ready to go!

## 📝 Available Scripts

- **`npm run dev`** - Start the development server (for coding)
- **`npm run build`** - Build the app for production (makes it fast!) 
- **`npm run preview`** - Preview the production build
- **`npm run lint`** - Check code for errors and style issues 

## 🗺️ Page Routes

The app has these main pages:

| Route | Description | Who Can Access |
|-------|-------------|----------------|
| `/` | 🏠 Home page | Everyone |
| `/login` | 🔐 Student login | Students |
| `/login/organizer` | 🔐 Organizer login | Organizers |
| `/dashboard` | 📊 Student dashboard | Logged-in students |
| `/profile` | 👤 Student profile | Logged-in students |
| `/profile/organizer` | 👤 Organizer profile | Logged-in organizers |
| `/leaderboard` | 🏆 Rankings | Everyone |
| `/announcements` | 📢 Updates | Everyone |
| `/admin` | ⚙️ Admin panel | Admin only |
| `/forgot-password` | 🔑 Reset password | Everyone |

## 🎨 Features in Detail

### 🌓 Dark Mode Support
The entire app supports both light and dark themes for comfortable viewing! 

### 📱 Mobile Responsive
Works perfectly on phones, tablets, and computers!

### 🎯 Task Submission System
- Students can see all available tasks
- Submit their work with context/proof
- Track submission status (Pending/Approved/Rejected) 

### 🏆 Points & Ranking
- Earn points for completed tasks
- Real-time leaderboard updates
- Animated counters for a cool effect!

## 🔧 Configuration Files

- **`vite.config.js`** - Vite settings
- **`tailwind.config.js`** - TailwindCSS customization
- **`postcss.config.js`** - PostCSS configuration
- **`eslint.config.js`** - Code quality rules

## 🤝 Contributing

Want to make this project better? Here's how:

1. 🍴 Fork the repository
2. 🌿 Create a new branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

## 📄 License

This project is created for the AXIS 2026 campus ambassador program.

## 💡 Need Help?

If you're stuck or have questions:
- Check if all dependencies are installed
- Make sure your `.env` file has the correct Supabase credentials
- Try deleting `node_modules` folder and running `npm install` again
- Check the browser console for error messages

## 🎊 Credits

Built with passion for AXIS 2026! 🚀

---

**Happy Coding! 💻✨**

---
