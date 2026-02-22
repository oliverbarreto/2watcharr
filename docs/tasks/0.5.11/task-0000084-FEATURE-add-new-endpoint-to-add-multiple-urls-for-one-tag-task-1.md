# Task: Add new endpoint to add multiple URLs for one tag

- [x] Planning and Research
    - [x] Read task requirements
    - [x] Research existing `/api/shortcuts/add-episode` implementation
    - [x] Research CORS handling and API token verification
- [ ] Implementation [/]
    - [ ] Create implementation plan
    - [ ] Implement `POST /api/shortcuts/add-videos`
        - [ ] Handle CORS
        - [ ] Verify API token
        - [ ] Implement video metadata extraction and episode creation for multiple URLs
        - [ ] Implement tag handling (create if not exists)
        - [ ] Return batch processing status
- [ ] Verification [/]
    - [ ] Create tests for the new endpoint
    - [ ] Verify with multiple URLs (up to 3)
    - [ ] Create walkthrough
