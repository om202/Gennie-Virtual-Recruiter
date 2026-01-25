<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Gennie Talent') }}</title>
    <meta name="description"
        content="Gennie - AI-powered virtual recruiter for automated candidate screening, voice interviews, and intelligent hiring automation. Fair, efficient, and available 24/7.">
    <meta name="keywords"
        content="AI recruiter, AI recruitment, automated hiring, voice AI interviewing, candidate screening, AI-powered recruitment">
    <link rel="icon" type="image/x-icon" href="/favicon_gennie.ico">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>

<body class="antialiased">
    @inertia
</body>

</html>