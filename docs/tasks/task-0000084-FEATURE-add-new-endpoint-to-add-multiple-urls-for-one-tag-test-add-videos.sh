#!/bin/bash

# Configuration
API_TOKEN="07ea140536f300a7238bbccae08609feeb3e94b4ee1e0a4c574e8a8f74ebce02"
BASE_URL="http://localhost:3000"
ENDPOINT="/api/shortcuts/add-videos"

# Test Data
JSON_DATA='[
  {
    "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "tag": "Test Tag"
  },
  {
    "url": "https://www.youtube.com/shorts/qL5eTo9m5pU",
    "tag": "Test Tag"
  },
  {
    "url": "https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw",
    "tag": "Test Tag"
  }
]'

echo "Testing $ENDPOINT..."
echo "Request Body: $JSON_DATA"
echo "-----------------------------------"

curl -X POST "$BASE_URL$ENDPOINT" \
     -H "Content-Type: application/json" \
     -H "X-API-Token: $API_TOKEN" \
     -d "$JSON_DATA" | jq .

echo "-----------------------------------"
echo "Test complete."
