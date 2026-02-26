# 🌍 Geopolitical Events Dashboard

A real-time dashboard tracking global geopolitical events and hotspots using the GDELT Project API.

## 🚀 Live Demo

**Production URL**: [https://geopolitical-dashboard-omega.vercel.app](https://geopolitical-dashboard-omega.vercel.app)

## ✨ Features

- **Real-time Event Tracking**: Fetches latest geopolitical events from GDELT Project
- **Regional Filtering**: Filter events by region (Americas, Europe, Middle East, Asia-Pacific, Africa)
- **Dark Theme**: Clean, modern dark interface optimized for readability
- **Auto-Refresh**: Automatically updates every 5 minutes
- **Mobile Responsive**: Fully responsive design for all screen sizes
- **Event Cards**: Each event displays headline, source, date, and region with color-coded badges

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Source**: [GDELT Project API](https://www.gdeltproject.org/) (free, no API key required)
- **Deployment**: Vercel

## 📊 Data Sources

- **Primary**: GDELT Project API - Global Database of Events, Language, and Tone
- Query includes: geopolitics, conflict, diplomacy, war, sanctions, treaty
- Updates: Real-time news from thousands of sources worldwide
- Coverage: 100+ languages, 200+ countries

## 🎨 Design

The dashboard features a dark theme inspired by modern data visualization tools:
- Background: `#0f0f13`
- Card backgrounds: `#14141e`, `#1a1a28`
- Accent colors: Region-specific (Blue, Purple, Orange, Green, Pink)
- Smooth transitions and hover effects
- Clean scrollbars and responsive grid layout

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nedpersonalassistantoc/geopolitical-dashboard.git
cd geopolitical-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
geopolitical-dashboard/
├── app/
│   ├── globals.css          # Global styles and dark theme
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main dashboard component
├── public/                  # Static assets
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.ts           # Next.js configuration
```

## 🔧 Configuration

### Auto-Refresh Interval

The dashboard auto-refreshes every 5 minutes by default. To change this, modify the interval in `app/page.tsx`:

```typescript
// Auto-refresh every 5 minutes (300000ms)
const interval = setInterval(fetchEvents, 5 * 60 * 1000)
```

### Region Classification

Events are automatically classified into regions based on keywords in the title and URL. Edit the `getRegion()` function in `app/page.tsx` to customize region detection.

## 🌐 API Details

**GDELT API Endpoint**:
```
https://api.gdeltproject.org/api/v2/doc/doc?query=geopolitics%20OR%20conflict%20OR%20diplomacy%20OR%20war%20OR%20sanctions%20OR%20treaty&mode=artlist&format=json&maxrecords=50&sort=datedesc
```

- No API key required
- Free tier includes up to 50 results per query
- Results sorted by date (most recent first)
- JSON format response

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Live Dashboard**: https://geopolitical-dashboard-omega.vercel.app
- **GitHub Repository**: https://github.com/nedpersonalassistantoc/geopolitical-dashboard
- **GDELT Project**: https://www.gdeltproject.org/

---

Built with ❤️ using Next.js and GDELT Project data
