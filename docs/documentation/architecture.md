# Architecture Overview

**2watcharr** follows Clean Architecture principles to ensure modularity, testability, and separation of concerns.

## Layers

### 1. Domain Layer (`src/lib/domain`)
The core of the application. Contains enterprise logic and types.
- **Models**: `Video`, `Channel`, `Tag` interfaces.
- **DTOs**: Data Transfer Objects for creation and updates.
- **Independence**: No external dependencies.

### 2. Application/Service Layer (`src/lib/services`)
Contains application-specific business rules.
- **VideoService**: Orchestrates video operations, coordinates between repositories.
- **YouTubeMetadataService**: Handles external integration with `yt-dlp`.
- **Logic**: e.g., "When adding a video, first check availability, then extract metadata, then save to DB."

### 3. Interface Adapters (`src/lib/repositories`)
Converts data between use cases and external agencies (Database).
- **Repositories**: `VideoRepository`, `ChannelRepository`, `TagRepository`.
- **Implementation**: Uses `sqlite` (promise-based) wrapper over `sqlite3`.

### 4. Frameworks & Drivers (`src/app`, `src/lib/db`)
The outermost layer.
- **Web Framework**: Next.js v16 (App Router).
- **Database**: SQLite with WAL mode.
- **UI**: React components, shadcn/ui, Tailwind CSS.

## Data Flow

1. **User Action** (UI) or **API Call** triggers a Next.js Route Handler (`src/app/api/...`).
2. **Route Handler** validates input (Zod) and calls **Service**.
3. **Service** executes business logic and calls **Repository**.
4. **Repository** executes SQL query via **Database Driver**.
5. Data flows back up the stack.

## Key Technologies

- **Next.js v16**: Full-stack framework.
- **SQLite**: Local, embedded, serverless database.
- **yt-dlp**: Powerful command-line media downloader (used here only for metadata extraction).
- **Docker**: Containerization for consistent deployment.
- **shadcn/ui**: Component library based on Radix UI and Tailwind.
- **dnd-kit**: Accessible drag-and-drop library.

## Database Schema

```sql
Videos (N) <--> (1) Channels
Videos (N) <--> (N) Tags (via video_tags)
Users (1)  <--> (N) Videos/Tags (Future proofing)
```
## Async & Parallel Architecture

The system uses a hybrid parallel-sequential model to handle high-latency external metadata extraction while maintaining SQLite data integrity.

- **Detailed Documentation**: [Async Architecture](async-architecture.md)
