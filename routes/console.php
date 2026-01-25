<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Retry stuck analysis jobs every 5 minutes
Schedule::command('analysis:retry-stuck --minutes=10')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();
