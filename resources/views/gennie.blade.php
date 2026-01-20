<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gennie - Virtual Recruiter</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        .speaking {
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }

            70% {
                transform: scale(1.1);
                box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
            }

            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
        }
    </style>
</head>

<body class="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">

    <div class="max-w-md w-full text-center space-y-8">
        <div class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight text-blue-400">Gennie</h1>
            <p class="text-slate-400">AI Virtual Recruiter</p>
        </div>

        <!-- Semantic Visualizer -->
        <div class="relative h-48 w-48 mx-auto flex items-center justify-center">
            <div id="visualizer-ring" class="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div id="status-orb"
                class="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300">
            </div>

            <!-- Microphone Icon inside Orb -->
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute w-12 h-12 text-white/90" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
        </div>

        <div id="status-text" class="h-8 text-blue-300 font-mono text-sm animate-pulse">
            Ready to Connect...
        </div>

        <button id="start-btn"
            class="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
            Start Interview
        </button>

        <div id="transcript-box"
            class="hidden text-left bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-sm h-32 overflow-y-auto font-mono text-slate-400">
            <!-- Transcript logs -->
        </div>
    </div>

</body>

</html>