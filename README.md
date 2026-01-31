# 2watcharr

A YouTube "Watch Later" management application that allows you to save, organize, and manage videos you want to watch later with tags, priorities, and comprehensive metadata.

## Features

- 📝 **Save YouTube Videos**: Add videos via URL with automatic metadata extraction
- 🏷️ **Tag Organization**: Categorize videos with custom tags
- ⭐ **Favorites & Priorities**: Mark videos as favorites and set priority levels
- ✅ **Watch Status**: Track which videos you've watched
- 🔍 **Search & Filter**: Find videos by title, description, channel, or tags
- 📱 **iOS Integration**: Add videos directly from iOS via Shortcuts app
- 🎨 **Modern UI**: Beautiful, responsive interface built with shadcn/ui
- 🐳 **Docker Ready**: Production-ready Docker Compose setup

## Tech Stack

- **Framework**: Next.js v16 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite with promise-based API
- **Metadata**: yt-dlp for YouTube video information
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Python 3 (for yt-dlp)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### Docker Deployment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Launch Application in production
docker compose -f docker-compose.prod.yml up -d
```


## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── lib/
│   ├── domain/       # Domain models and business logic
│   ├── services/     # Application services
│   ├── repositories/ # Data access layer
│   ├── utils/        # Utility functions
│   └── db/          # Database configuration
└── components/       # React components
    ├── ui/          # shadcn/ui components
    └── features/    # Feature-specific components
```

## Documentation

- [Setup Guide](docs/documentation/setup.md)
- [API Documentation](docs/documentation/api.md)
- [Development Guide](docs/documentation/development.md)
- [Architecture Overview](docs/documentation/architecture.md)
- [iOS Shortcut Setup](docs/documentation/ios-shortcut-setup.md)

## License

MIT

