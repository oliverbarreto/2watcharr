# Scope Extension for Articles and Social Media

Analysis and plan for extending 2watcharr to support web articles, blogposts, and social media posts (X/Twitter, LinkedIn, etc.).

## Proposed Changes

The extension requires changes across the entire stack, but maintains the current architectural patterns for consistency.

---

### [Domain and Data Model]

The current model is focused on `video` and `podcast`. We will generalize it.

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Extend [MediaType](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#4-5) to include `'article'`, `'blogpost'`, `'tweet'`, and `'linked_in_post'`.
- Update [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#31-64) to handle type-specific nuances:
    - `duration` can represent estimated reading time (in seconds) for articles.
    - `isShort` can be repurposed or a new boolean/enum added if needed, but for now, the `type` is sufficient.

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- No physical schema changes are strictly required as the existing columns are generic enough. 
- `channels` table will represent the "Source" (e.g., Domain for articles, User Profile for social media).
- `episodes` table will represent the "Item".

---

### [Metadata Extraction]

We need new services to extract metadata from non-video/non-podcast URLs.

#### [NEW] [article-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/article-metadata.service.ts)
- Use standard [fetch](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#208-219) to get the page content.
- Implement a parser (using Open Graph tags) to extract:
    - `title`: `og:title` or `<title>`
    - `description`: `og:description` or `meta[name="description"]`
    - `thumbnailUrl`: `og:image`
    - `source`: `og:site_name` or domain name.
    - `author`: `article:author` or `meta[name="author"]`
    - `readingTime`: Estimated based on word count (approx 200-250 wpm).

#### [NEW] [social-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/social-metadata.service.ts)
- Handle specific logic for X/Twitter and LinkedIn.
- Note: These platforms often require API access or sophisticated scraping. For a baseline implementation, we will use Open Graph tags which often provide the post content and author info.

#### [MODIFY] [metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts)
- Update [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#14-28) to route URLs to the appropriate service.
- Add `isArticleUrl(url)` and `isSocialMediaUrl(url)` detection.

---

### [UI Components]

The UI needs to visually distinguish between these types.

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add new icons from `lucide-react`:
    - `BookOpen` for articles.
    - `MessageSquare` or `Twitter`/`Linkedin` (if available in lucide or use generic icons) for social media.
- Update badges to show the correct type.
- Handle "Reading Time" display instead of "Duration" for articles.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Update "Type" filter to include the new options.

#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Update statistics calculation to include the new types in breakdowns.

## Verification Plan

### Automated Tests
- Create unit tests for `ArticleMetadataService` with sample HTML to verify extraction.
- Create unit tests for [MetadataService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#5-56) dispatcher logic.
- Run `npm test` to ensure no regressions in existing YouTube/Podcast logic.

### Manual Verification
1.  **Add Article**: Paste a Medium or The Verge link and verify metadata extraction and card display.
2.  **Add Social Media**: Paste a Twitter or LinkedIn link and verify representation.
3.  **Filtering**: Verify that filtering by "Article" or "Social Media" works as expected.
4.  **Stats**: Check the stats page to see the new categories.
