# StreetEasyAndMe Frontend

React + TypeScript + Vite frontend for StreetEasyAndMe.

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
# Development server
npm run dev

# Access at http://localhost:5173
```

### Building

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── pages/         # Page components
│   ├── services/      # API client
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── index.html         # HTML template
```

## Features (To Be Implemented)

- [ ] Login/Signup pages
- [ ] Browse rentals with filters
- [ ] Favorite listings
- [ ] Event tracking for favorites
- [ ] Responsive design

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```
