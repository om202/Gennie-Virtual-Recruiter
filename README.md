# Gennie - Virtual Recruiter

An AI-powered voice recruiter built with Laravel and Deepgram Voice Agent API.

## Features

- 🎙️ Real-time voice conversations with AI recruiter
- 🧠 Powered by Deepgram Voice Agent + GPT-4o-mini
- 🔊 High-quality text-to-speech with Aura
- 📝 Live transcript display
- 🛠️ Function calling for dynamic context retrieval

## Tech Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: Vanilla JS, Tailwind CSS, Vite
- **AI**: Deepgram Voice Agent API, OpenAI GPT-4o-mini
- **Audio**: Web Audio API with gapless playback

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```
   DEEPGRAM_API_KEY=your_key_here
   ```
4. Run migrations:
   ```bash
   php artisan migrate
   ```
5. Build assets and start server:
   ```bash
   npm run build
   php artisan serve
   ```

## Usage

Navigate to `/gennie` and click "Start Interview" to begin a voice conversation with Gennie.

## License

MIT
