<?php

/**
 * Scheduling Service Configuration
 * 
 * Central configuration for timezone handling and date formatting.
 * Standard approach: Store UTC, Display Local.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Default Timezone
    |--------------------------------------------------------------------------
    */
    'default_timezone' => 'America/New_York',

    /*
    |--------------------------------------------------------------------------
    | Display Formats
    |--------------------------------------------------------------------------
    | 
    | Carbon format strings for different display contexts.
    | T = timezone abbreviation (EST, PST, etc.)
    |
    */
    'formats' => [
        'full' => 'l, F j, Y \a\t g:i A T',      // Monday, January 27, 2026 at 2:30 PM EST
        'email_date' => 'l, F j, Y',             // Monday, January 27, 2026
        'email_time' => 'g:i A T',               // 2:30 PM EST
        'short' => 'M j, g:i A',                 // Jan 27, 2:30 PM
        'date_only' => 'M j, Y',                 // Jan 27, 2026
        'time_only' => 'g:i A',                  // 2:30 PM
        'iso' => 'c',                            // ISO 8601 for API
    ],

    /*
    |--------------------------------------------------------------------------
    | Supported Timezones
    |--------------------------------------------------------------------------
    | 
    | List of timezones offered to users. Keyed by IANA timezone identifier.
    | Grouped by region for easier selection.
    |
    */
    'timezones' => [
        // North America
        'America/New_York' => '(UTC-05:00) Eastern Time - New York',
        'America/Chicago' => '(UTC-06:00) Central Time - Chicago',
        'America/Denver' => '(UTC-07:00) Mountain Time - Denver',
        'America/Los_Angeles' => '(UTC-08:00) Pacific Time - Los Angeles',
        'America/Anchorage' => '(UTC-09:00) Alaska',
        'Pacific/Honolulu' => '(UTC-10:00) Hawaii',

        // Canada
        'America/Toronto' => '(UTC-05:00) Eastern Time - Toronto',
        'America/Vancouver' => '(UTC-08:00) Pacific Time - Vancouver',

        // Europe
        'Europe/London' => '(UTC+00:00) London',
        'Europe/Paris' => '(UTC+01:00) Paris, Berlin, Rome',
        'Europe/Amsterdam' => '(UTC+01:00) Amsterdam',
        'Europe/Berlin' => '(UTC+01:00) Berlin',
        'Europe/Athens' => '(UTC+02:00) Athens',
        'Europe/Moscow' => '(UTC+03:00) Moscow',

        // Asia
        'Asia/Dubai' => '(UTC+04:00) Dubai',
        'Asia/Karachi' => '(UTC+05:00) Pakistan',
        'Asia/Kolkata' => '(UTC+05:30) India',
        'Asia/Kathmandu' => '(UTC+05:45) Nepal',
        'Asia/Dhaka' => '(UTC+06:00) Bangladesh',
        'Asia/Bangkok' => '(UTC+07:00) Bangkok',
        'Asia/Singapore' => '(UTC+08:00) Singapore',
        'Asia/Hong_Kong' => '(UTC+08:00) Hong Kong',
        'Asia/Tokyo' => '(UTC+09:00) Tokyo',
        'Asia/Seoul' => '(UTC+09:00) Seoul',

        // Australia/Pacific
        'Australia/Sydney' => '(UTC+11:00) Sydney',
        'Australia/Melbourne' => '(UTC+11:00) Melbourne',
        'Australia/Perth' => '(UTC+08:00) Perth',
        'Pacific/Auckland' => '(UTC+13:00) Auckland',

        // South America
        'America/Sao_Paulo' => '(UTC-03:00) São Paulo',
        'America/Buenos_Aires' => '(UTC-03:00) Buenos Aires',

        // Africa
        'Africa/Cairo' => '(UTC+02:00) Cairo',
        'Africa/Lagos' => '(UTC+01:00) Lagos',
        'Africa/Johannesburg' => '(UTC+02:00) Johannesburg',
    ],
];
