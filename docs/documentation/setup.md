# Setup Guide

## Prerequisites

- **Docker**: [Install Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Git**: [Install Git](https://git-scm.com/downloads)

## Quick Start (Recommended)

The easiest way to run **2watcharr** is using Docker Compose. This ensures all dependencies (including Python and yt-dlp) are correctly configured.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/2watcharr.git
   cd 2watcharr
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   Open your browser and visit `http://localhost:3000`.

## Local Development Setup

If you want to contribute or modify the code:

1. **Install Node.js 20+**:
   ```bash
   brew install node
   ```

2. **Install Python and yt-dlp** (required for metadata extraction):
   ```bash
   brew install python3 yt-dlp
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   # Run all tests
   npm test
   
   # Run integration tests
   npm run test:integration
   ```

## Configuration

The application uses environment variables for configuration. You can create a `.env.local` file in the root directory:

```env
# Database location (default: ./data/2watcharr.db)
DATABASE_PATH=./data/2watcharr.db

# Log level (default: info)
LOG_LEVEL=debug
```
