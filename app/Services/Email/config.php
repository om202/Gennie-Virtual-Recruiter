<?php

/**
 * Email Service Configuration
 * 
 * Central configuration for all email types in the application.
 * Each email type defines its subject template and view template.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Default Sender
    |--------------------------------------------------------------------------
    */
    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'support@noblestack.io'),
        'name' => env('MAIL_FROM_NAME', 'Gennie Talent'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Types Configuration
    |--------------------------------------------------------------------------
    | 
    | Subject placeholders: {company}, {job}, {candidate}, {date}, {time}
    |
    */
    'types' => [
        'interview_scheduled' => [
            'subject' => 'Your Interview with {company} - {job}',
            'template' => 'interview-scheduled',
            'description' => 'Sent to candidate when interview is scheduled',
        ],

        'interview_rescheduled' => [
            'subject' => 'Interview Rescheduled: {job} at {company}',
            'template' => 'interview-rescheduled',
            'description' => 'Sent to candidate when interview time changes',
        ],

        'interview_cancelled' => [
            'subject' => 'Interview Cancelled: {job} at {company}',
            'template' => 'interview-cancelled',
            'description' => 'Sent to candidate when interview is cancelled',
        ],

        'application_received' => [
            'subject' => 'Application Received: {job} at {company}',
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
        'support_email' => 'support@noblestack.io',
        'tagline' => 'AI-Powered Recruiting',
    ],
];
