# Async and Parallel Architecture

This document describes how 2watcharr handles multiple simultaneous requests, particularly for media addition and batch processing, while ensuring data integrity and system stability.

## Overview

The 2watcharr backend is built on a "Hybrid Parallel-Sequential" execution model. This architecture is designed to handle the high latency of external metadata extraction (YouTube/Podcasts) while managing the single-threaded nature of SQLite write transactions.

## The Two-Phase Pipeline

Every request to add or sync media follows a strict two-phase process:

### 1. Asynchronous Extraction (Parallel Phase)
*   **Action:** The system spawns external processes (`yt-dlp`) or makes network requests to fetch media metadata.
*   **Concurrency:** Multiple requests can run this phase simultaneously. If 10 individual API calls arrive, 10 extraction processes will run in parallel.
*   **Benefit:** Since this phase is IO-bound and high-latency (2–5 seconds), running it in parallel ensures the server doesn't "freeze" while waiting for YouTube.

### 2. Database Persistence (Sequential Phase)
*   **Action:** Extracted metadata is saved to the SQLite database.
*   **Concurrency:** Strictly sequential for write operations.
*   **Mechanism:** A **Static Write Lock** in the `EpisodeRepository` manages access.
*   **Benefit:** Prevents `SQLITE_ERROR: cannot start a transaction within a transaction`, which occurs when multiple parallel requests attempt to use the singleton database connection for transactional operations.

---

## Technical Implementation

### Static Write Lock
In `src/lib/repositories/episode.repository.ts`, a static promise-based lock ensures that even though multiple repository instances might exist across different request contexts, they all synchronize on the same "write queue":

```typescript
private static writeLock: Promise<void> = Promise.resolve();

private async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const lock = EpisodeRepository.writeLock;
    let resolveLock: () => void;
    EpisodeRepository.writeLock = new Promise(res => resolveLock = res);

    try {
        await lock; // Wait for the previous transaction to finish
        await this.db.run('BEGIN TRANSACTION');
        try {
            const result = await work();
            await this.db.run('COMMIT');
            return result;
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    } finally {
        resolveLock!(); // Release the lock for the next caller
    }
}
```

### Batch Processing (Chunking)
The batch endpoint (`/api/shortcuts/add-videos`) further optimizes this by using "Chunked Parallelism":
1.  **Chunking:** The list of URLs is split into chunks (e.g., 5 URLs at a time).
2.  **Phase 1 (Parallel):** All 5 URLs in the chunk extract metadata at once.
3.  **Phase 2 (Sequence):** Once all 5 are ready, they are saved to the database one by one.
4.  **Repeat:** The next chunk begins.

This prevents the system from being overwhelmed by hundreds of simultaneous Python processes while still maintaining a high throughput.

---

## Behavior in Edge Cases

| Scenario | Result |
| :--- | :--- |
| **Simultaneous iOS Shortcuts** | Both will process metadata in parallel. The second one will wait for the first to finish writing to the DB, then it will save successfully. |
| **Duplicate Video Request** | The first request inserts the video. The second request, after waiting for the lock, sees the video exists and performs a "restore/update" operation instead of a duplicate insert. |
| **Server Restart during Sync** | The current chunk might fail, but because Phase 2 uses transactions, the database will remain in a consistent "pre-chunk" or "partially-completed" state without data corruption. |

---

## Recommendations for Future Scaling

As the application grows, the following enhancements are recommended:

1.  **Global Extraction Semaphore:** Currently, individual API calls can still spawn unlimited `yt-dlp` processes. A global semaphore should be added to `MetadataService` to limit total concurrent extractions to ~5-10 across all users.
2.  **Background Job Queue:** For very large playlists (>100 videos), move the processing to a background worker (e.g., using a local queue) and provide the user with a "Job ID" to track progress.
3.  **Atomic saveEpisodeFromMetadata:** Further consolidate all persistence logic into a single transaction to ensure that channel creation and episode creation never get "de-synced" in the event of a crash.
4.  **Connection Pooling (Future):** If moving away from SQLite to a networked database (like PostgreSQL), the static lock can be replaced with a proper connection pool.
