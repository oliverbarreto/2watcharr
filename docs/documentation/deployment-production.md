# Production Deployment Guide

1. Stop the application:
```bash
docker-compose down
```

2. Pull the latest changes:
```bash
git pull origin main
```

Another option is to copy with sftp program like Cyber Duck the app source code to the server. Do not copy:
- data folder
- docs folder
- node_modules folder
- .env file
- .agent folder
- .gitignore file
- .gitattributes file
- .DS_Store file


3. Rebuild and restart the application:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

4. Verify the application is running:
```bash
docker-compose -f docker-compose.prod.yml ps
```

5. Check the logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

6. Access the application:
Open your browser and visit `http://2watcharr.yourdomain.com:3000`.

If running behind a reverse proxy like Nginx, you can use `https://2watcharr.yourdomain.com` or `http://2watcharr.yourdomain.com`.

