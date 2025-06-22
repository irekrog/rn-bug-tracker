# Bug Tracker for React Native

A web application for checking bug reports after the release of new React Native versions. Helps developers make informed decisions about project updates by analyzing the stability of specific versions.

> 🤖 **Built with AI & Vibe Coding** - This application was crafted through the magic of AI-assisted development and vibe-driven coding sessions. ✨

## 🛠️ Technologies

- **React 19** - Latest React version
- **Vite** - Fast build tool and development server
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **React Aria Components** - Accessible UI components
- **TypeScript** - Type safety
- **GitHub REST API v3** - Data fetching

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rn-bug-tracker
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

## 🎯 How to use

1. **Select version** - Select a React Native version number (e.g. 0.73.0, 0.72.5) from the dropdown
2. **View results** - Browse through the bug reports with detailed information including title, status, author, and labels

## 📁 Project structure

```
src/
├── routes/                 # TanStack Router routes
│   ├── __root.tsx         # Root layout
│   └── index.tsx          # Homepage route
├── components/
│   ├── ui/                # React Aria Components
│   └── shared/            # Shared components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api.ts             # Client-side API functions
│   ├── github.ts          # GitHub API integration
│   └── utils.ts           # Utility functions
└── main.tsx               # Application entry point
```

## 🔧 API

The application uses client-side API calls, GitHub API requests are made directly from the browser.

### GitHub Search Function

Searches for bug reports for a given React Native version.

**Usage:**

```typescript
import { fetchBugReports } from "@/lib/api";

const result = await fetchBugReports("0.73.0", 1, 1);
```

**Response:**

```json
{
  "version": "0.73.0",
  "release": {
    "tag_name": "v0.73.0",
    "name": "v0.73.0",
    "published_at": "2023-12-06T18:42:27Z",
    "html_url": "https://github.com/facebook/react-native/releases/tag/v0.73.0"
  },
  "issues": {
    "total_count": 42,
    "items": [...]
  },
  "searchedAfterDate": "2023-12-06"
}
```

## 🚦 GitHub API Limitations

- **Rate limiting** - GitHub API has request limits (5000/hour for authenticated users, 60/hour for unauthenticated)
- **Search** - Search API has additional limitations (10 requests/minute for unauthenticated users)
- **CORS** - Requests are made directly from the browser to GitHub's API

## 🔒 Security

- GitHub API requests are made client-side
- No user data storage
- Safe API error handling
- No sensitive API keys required (uses public GitHub API)

## 🎨 User Interface

- **Modern design** - Uses React Aria Components for accessibility and consistency
- **Dark/Light mode** - Custom theme provider with system preference detection
- **Responsive** - Works on phones, tablets, and computers
- **Accessibility** - Built-in WCAG compliance with React Aria Components

## 📈 Possible extensions

- **Watched versions** - Save and monitor specific versions
- **Notifications** - Alerts about new reports for watched versions
- **Statistics** - Charts and bug trend analysis
- **Filtering** - Advanced filters by labels, status, etc.
- **Data export** - Ability to export results to CSV/JSON
- **GitHub Authentication** - Higher API limits for logged-in users
- **Offline support** - Service worker for caching results

## 🤝 Contributing

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is available under the MIT license. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- [React Native Team](https://github.com/facebook/react-native) - for the great framework
- [React Aria](https://react-spectrum.adobe.com/react-aria/) - for accessible UI components
- [TanStack Router](https://tanstack.com/router) - for type-safe routing
- [TanStack Query](https://tanstack.com/query) - for data fetching and caching
- [Vite](https://vitejs.dev/) - for fast development experience
- [GitHub](https://github.com) - for API access

---

**Note:** This application is not officially associated with React Native or Meta. It is an independent tool created by the community for the community.
