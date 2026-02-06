# 📊 FinBoard – Customizable Finance Dashboard

FinBoard is a customizable, real-time finance dashboard built using **Next.js**.  
It allows users to connect to financial APIs and build dynamic widgets such as **cards, tables, and charts** with live data.

This project was developed as part of a **Frontend Assignment Round**.

---

## 🚀 Features

- Connect to finance APIs (Finnhub, Alpha Vantage)
- Create dynamic widgets:
  - 📌 Card Widgets (Live prices, OHLC data)
  - 📋 Table Widgets (Market gainers, losers, earnings)
  - 📈 Chart Widgets (Daily / Weekly / Monthly trends)
- Drag & drop widget rearrangement
- Auto-refresh with configurable intervals
- Search and pagination in tables
- Dynamic field selection from API responses
- Export / Import dashboard configuration
- Persistent dashboard state (localStorage)

---

## 🧱 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit
- **API Client:** Axios
- **Deployment:** Vercel

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FINNHUB_KEY=your_finnhub_api_key
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
