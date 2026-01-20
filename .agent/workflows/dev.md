---
description: How to start the development environment for Gennie with Twilio calling
---

# Development Workflow

## Start Everything (1 Command!)
// turbo
```bash
./start-dev.sh
```

This single command:
1. Starts ngrok tunnel
2. Auto-updates `.env` with the tunnel URL
3. Runs `composer dev` (Laravel + Vite + Relay + Queue + Logs)

## Access
- **Web**: http://localhost:8000/gennie
- **Call Me**: Works automatically with Twilio
