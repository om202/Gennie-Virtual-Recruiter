#!/bin/bash
# start-dev.sh - One command to start the entire dev environment

PORT=${1:-8080}
ENV_FILE=".env"

echo "🚀 Starting ngrok tunnel on port $PORT..."

# Start ngrok in background
ngrok http $PORT > /dev/null 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL from ngrok's local API
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Is ngrok installed?"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Tunnel active: $NGROK_URL"

# Update .env file
if [ -f "$ENV_FILE" ]; then
    # Update RELAY_SERVER_URL
    if grep -q "^RELAY_SERVER_URL=" "$ENV_FILE"; then
        sed -i '' "s|^RELAY_SERVER_URL=.*|RELAY_SERVER_URL=$NGROK_URL|" "$ENV_FILE"
    else
        echo "RELAY_SERVER_URL=$NGROK_URL" >> "$ENV_FILE"
    fi
    
    # Update APP_URL
    if grep -q "^APP_URL=" "$ENV_FILE"; then
        sed -i '' "s|^APP_URL=.*|APP_URL=$NGROK_URL|" "$ENV_FILE"
    fi
    
    echo "✅ Updated .env with new URL"
else
    echo "⚠️  .env file not found"
fi

echo ""
echo "🎯 Starting development servers..."
echo ""

# Run composer dev (this will block and show all output)
# When user presses Ctrl+C, also kill ngrok
trap "kill $NGROK_PID 2>/dev/null; exit" INT TERM
composer dev

# Cleanup
kill $NGROK_PID 2>/dev/null
