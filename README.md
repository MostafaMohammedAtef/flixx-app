# Flixx Movie App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111)
![TMDB API](https://img.shields.io/badge/TMDB-API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
![Swiper](https://img.shields.io/badge/Swiper-6332F6?style=for-the-badge&logo=swiper&logoColor=white)
![Font Awesome](https://img.shields.io/badge/Font%20Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

## Live Demo

[flixx-app-six.vercel.app](https://flixx-app-six.vercel.app/)

Flixx is a cinematic movie and TV discovery application built with **vanilla JavaScript**, semantic HTML, and custom CSS. It uses the **TMDB API** to fetch movie, television, cast, crew, trailer, recommendation, and release data in real time.

The project focuses on a practical streaming-catalog experience: browse titles, search across movies and shows, explore detailed metadata, save titles for later, compare releases, and discover what is coming next.

## Features

### Browsing

- Now Playing movie rail with continuous movement and drag support
- Popular movies and popular TV shows
- Upcoming release calendar

### Search

- Movie and TV show search
- Debounced TMDB search suggestions while typing
- Paginated results
- Smooth return to the results section after using Next or Previous
- Empty-result, API-error, and offline states

### Details and Media

- Movie and TV detail pages
- Poster and backdrop artwork
- Embedded YouTube trailers
- Ratings, vote counts, runtime, status, dates, popularity, budget, and revenue
- Genres, languages, production countries, networks, and companies
- Movie certifications and keywords
- Collections and recommendations
- Cast links to dedicated person pages
- Actor biographies and known-for filmographies
- Official website and IMDb links
- Native sharing with clipboard fallback

### Personal Features

- Watchlist saved in `localStorage`
- Recently viewed titles saved in `localStorage`
- Three-title comparison tool
- Comparison of rating, runtime, budget, and revenue
- Persistent dark and light themes
- Keyboard shortcuts:
  - `/` focuses the search field
  - `T` toggles the theme
  - `Escape` closes the mobile menu

### Experience and Delivery

- Responsive layout for desktop, tablet, and mobile screens
- Collapsible mobile navigation menu
- Poster loading skeletons
- Accessible labels for interactive controls
- Cinema-inspired color system
- Installable PWA shell through a web manifest and service worker
- Local cached shell for repeat visits and offline navigation

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- TMDB REST API
- Swiper assets and Swiper-compatible markup for the movie rail
- Font Awesome for interface icons
- Web App Manifest
- Service Worker API
- Browser `localStorage` for watchlist, comparison, theme, and recent-view data

No React, Vue, Angular, build tool, or package manager is required.

## Project Structure

```text
.
├── index.html              # Movie homepage
├── shows.html              # Popular TV shows
├── search.html             # Search results
├── movie-details.html      # Movie details
├── tv-details.html         # TV show details
├── watchlist.html          # Saved movies and shows
├── compare.html            # Side-by-side title comparison
├── calendar.html           # Upcoming release calendar
├── person-details.html     # Actor details and filmography
├── css/
│   ├── style.css           # Application styling and responsive layout
│   └── spinner.css         # Loading spinner styling
├── js/
│   └── script.js           # API requests, rendering, and interactions
├── images/                  # Local artwork and fallback images
├── lib/
│   ├── swiper.css
│   ├── swiper.js
│   └── fontawesome.css
├── webfonts/               # Font Awesome font files
├── manifest.webmanifest     # PWA metadata
└── sw.js                    # Service worker and app-shell cache
```

## Getting Started

### Requirements

- A modern browser
- A TMDB API key
- A local static web server

Opening the HTML files directly may prevent API requests or service-worker registration because browsers restrict some features under `file://` URLs.

### Run Locally

From the project directory, start any static server. For example, with Python:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/
```

You can also use the VS Code Live Server extension or any equivalent static server.

## TMDB Configuration

The API configuration is located near the top of `js/script.js`:

```javascript
api: {
  apiKey: "YOUR_TMDB_API_KEY",
  apiUrl: "https://api.themoviedb.org/3/",
}
```

Replace the placeholder with your TMDB API key before running the project.

Because this is a static client-side application, the key is visible in browser requests. For a production deployment, move TMDB requests behind a server or serverless function and keep the API key in an environment variable.

## TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie and TV metadata, artwork, ratings, credits, trailers, and recommendations are provided by [The Movie Database](https://www.themoviedb.org/).

## Browser Storage

Flixx stores personal selections locally in the browser:

| Key               | Purpose                        |
| ----------------- | ------------------------------ |
| `flixx-watchlist` | Saved movies and TV shows      |
| `flixx-compare`   | Titles selected for comparison |
| `flixx-recent`    | Recently viewed titles         |
| `flixx-theme`     | Dark or light theme preference |

Clearing browser site data removes these selections. There is currently no account or cloud synchronization layer.

## Deployment

Flixx can be deployed to any static hosting provider, including:

- GitHub Pages
- Netlify
- Vercel static hosting
- Cloudflare Pages
- Firebase Hosting

For PWA features and service-worker behavior, deploy over HTTPS. Localhost is also treated as a secure development origin by modern browsers.

## Accessibility Notes

The interface includes semantic controls, descriptive button labels, responsive layouts, visible form controls, and keyboard shortcuts. The next improvement for a production release would be a complete accessibility audit with screen-reader testing and broader reduced-motion handling.

## License

This repository is an educational and portfolio project. Review the terms for TMDB, Font Awesome, Swiper, and any other included third-party assets before redistributing the project or deploying it commercially.
