# 🎵 Drumshanbo Music Library

A beautiful, modern web application for browsing and discovering Irish Traditional Music from the Drumshanbo Local Library collection.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔍 **Powerful Search & Filtering**
- Full-text search across titles, artists, descriptions, and publishers
- Filter by year, publisher, and genre
- Sort by title, year, or artist
- Real-time results

### 🎯 **Interactive Browsing**
- **Click on artists** → See all albums featuring that artist
- **Click on instruments** → Find albums with that instrument
- **Click on genres** → Browse albums by genre
- **Click on publishers** → Explore catalog by label
- **Click on years** → Time-travel through releases

### 📱 **Beautiful, Responsive Design**
- Elegant Tailwind CSS styling with Irish-inspired color palette
- Fully responsive (works on mobile, tablet, and desktop)
- Smooth animations and transitions
- Album detail modal with comprehensive information

### 🎵 **Streaming Integration**
- Direct links to Spotify
- Direct links to Apple Music
- Official artist/album websites

### ⚡ **Modern Tech Stack**
- Built with Vite for blazing-fast performance
- React with hooks for state management
- Tailwind CSS for utility-first styling
- Static site deployment (no server needed)
- Optimized for GitHub Pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at **http://localhost:5173/**

## 📊 Catalog

- **Total Albums**: 20 CDs
- **Data Version**: 2.0 (Standardized schema)
- **Artists**: 50+ Irish traditional musicians
- **Years**: 1991 to 2015
- **Streaming Links**: 11/20 albums (55%)

## 🔗 Interactive Features

Every piece of metadata is clickable and interactive:

- **Artist Name** → Filter by that artist
- **Instrument** → Show albums with that instrument
- **Genre** → Browse similar genres
- **Publisher** → See all albums from that label
- **Year** → Time period exploration

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for GitHub Pages deployment instructions.

## 🐛 Troubleshooting

### Dev server won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm install @rollup/rollup-win32-x64-msvc  # Windows
npm run dev
```

---

**Built with ❤️ for Irish Traditional Music**
