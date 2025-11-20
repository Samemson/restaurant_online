# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Postgres + PgAdmin (first time only):
   ```bash
   docker-compose up -d
   ```

3. Generate the Prisma client, run migrations, and seed the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. Launch the full stack (Vite frontend + Netlify Functions + Socket server):
   ```bash
   npm run dev:full
   ```

   The Vite app runs on `http://localhost:8888`, API routes are proxied to `/.netlify/functions/api`, and Socket.IO is available at `/socket.io`.

## 🗄️ Backend & Data

- **Serverless API**: Node/Express application located under `server/` and deployed through Netlify Functions (`netlify/functions/api.js`).
- **Realtime**: Socket.IO server bootstrapped from `netlify/functions/socket.js`, publishing kitchen + order events.
- **Database**: PostgreSQL (Docker) managed via Prisma ORM. PgAdmin is exposed on `http://localhost:5050` (default credentials in `docker-compose.yml`).
- **Prisma schema**: `prisma/schema.prisma` defines users, menu items, carts, orders, analytics events, etc. Use `npm run prisma:seed` to load demo content and credentials.

Environment variables (create `.env` at repo root):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tastebite"
JWT_SECRET="replace-me"
CLIENT_ORIGIN="http://localhost:8888"
SOCKET_PORT=5001
```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🔌 Key Commands

| Command | Description |
| --- | --- |
| `npm run dev:full` | Starts Vite + Netlify Functions + Socket server (Netlify CLI) |
| `npm run prisma:migrate` | Runs pending Prisma migrations against the configured Postgres instance |
| `npm run prisma:seed` | Seeds menu, users, analytics data |
| `npm run build` | Creates a production build with sourcemaps |

## 🧪 Testing

Jest/RTL scaffolding is present; add suites under `src/__tests__` or component directories. Backend logic can be tested with Vitest/jest by importing express handlers directly (`server/app.js`). (Coming soon: end-to-end flows that hit serverless functions.)

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by React and Vite
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
