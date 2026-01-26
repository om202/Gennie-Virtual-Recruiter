<?php

/**
 * SMS Service Configuration
 * 
 * Central configuration for all SMS types in the application.
 * Each SMS type defines its message template with placeholder support.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | SMS System Toggle
    |--------------------------------------------------------------------------
    | Set to true to enable SMS notifications. Disabled by default until
    | Twilio A2P 10DLC registration is completed.
    */
    'enabled' => env('SMS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Twilio Credentials
    |--------------------------------------------------------------------------
    */
    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_ACCOUNT_AUTH_TOKEN'),
        'from_number' => env('TWILIO_FROM_NUMBER'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS Types Configuration
    |--------------------------------------------------------------------------
    | 
    | Message placeholders: {company}, {job}, {candidate}, {date}, {time}, {url}
    |
    */
    'types' => [
        'interview_scheduled' => [
            'template' => 'interview-scheduled',
            'description' => 'Sent to candidate when interview is scheduled',
        ],

        'interview_rescheduled' => [
            'template' => 'interview-rescheduled',
            'description' => 'Sent to candidate when interview time changes',
        ],

        'interview_cancelled' => [
            'template' => 'interview-cancelled',
            'description' => 'Sent to candidate when interview is cancelled',
        ],

        'application_received' => [
            'template' => 'application-received',
            'description' => 'Confirmation sent to candidate after applying',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Branding
    |--------------------------------------------------------------------------
    */
    'branding' => [
        'product_name' => 'Gennie Talent',
        'support_phone' => env('TWILIO_FROM_NUMBER'),
    ],
];
