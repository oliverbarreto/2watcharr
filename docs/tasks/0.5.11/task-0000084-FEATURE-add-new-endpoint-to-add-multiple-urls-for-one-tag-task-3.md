# Task: Add new endpoint to add multiple URLs for one tag

- [x] Planning and Research
    - [x] Read task requirements
    - [x] Research existing `/api/shortcuts/add-episode` implementation
    - [x] Research CORS handling and API token verification
- [x] Implementation
    - [x] Create implementation plan
    - [x] Refactor batch logic into [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#15-499)
    - [x] Implement `POST /api/shortcuts/add-videos`
        - [x] Handle CORS
        - [x] Verify API token
        - [x] Implement video metadata extraction and episode creation for multiple URLs
        - [x] Implement tag handling (create if not exists)
        - [x] Return batch processing status
- [x] Verification
    - [x] Create tests for the new endpoint (Manual)
    - [x] Create Vitest tests for `MediaService.addVideosBatch`
    - [x] Verify with multiple URLs (up to 3)
    - [x] Create walkthrough
