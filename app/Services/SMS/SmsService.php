<?php

namespace App\Services\SMS;

use Twilio\Rest\Client;
use App\Models\ScheduledInterview;
use App\Models\JobDescription;
use App\Models\Candidate;
use App\Services\Scheduling\SchedulingService;
use Illuminate\Support\Facades\Log;

/**
 * SmsService - Centralized SMS handling for the application via Twilio.
 * 
 * Usage:
 *   app(SmsService::class)->sendInterviewScheduled($schedule);
 *   app(SmsService::class)->sendApplicationReceived($jobDescription, $candidate);
 */
class SmsService
{
    protected array $config;
    protected string $templatePath;
    protected ?Client $client = null;

    public function __construct()
    {
        $this->config = require __DIR__ . '/config.php';
        $this->templatePath = __DIR__ . '/templates';
    }

    /**
     * Get or create Twilio client (lazy initialization).
     */
    protected function getClient(): ?Client
    {
        if ($this->client) {
            return $this->client;
        }

        $sid = $this->config['twilio']['account_sid'];
        $token = $this->config['twilio']['auth_token'];

        if (!$sid || !$token) {
            Log::warning('SmsService: Twilio credentials not configured');
            return null;
        }

        $this->client = new Client($sid, $token);
        return $this->client;
    }

    /**
     * Send interview scheduled notification to candidate.
     */
    public function sendInterviewScheduled(ScheduledInterview $schedule): bool
    {
        $schedule->load(['candidate', 'interview.user']);

        if (!$schedule->candidate->phone) {
            Log::info('SmsService: No phone number for candidate', [
                'candidate_id' => $schedule->candidate->id
            ]);
            return false;
        }

        $formatted = $this->getFormattedTime($schedule);

        return $this->send(
            type: 'interview_scheduled',
            to: $schedule->candidate->phone,
            placeholders: [
                'company' => $schedule->interview->company_name,
                'job' => $schedule->interview->job_title,
                'candidate' => $schedule->candidate->name,
                'date' => $formatted['date'],
                'time' => $formatted['time'],
                'url' => $schedule->getPublicUrl(),
            ]
        );
    }

    /**
     * Send interview rescheduled notification to candidate.
     */
    public function sendInterviewRescheduled(ScheduledInterview $schedule): bool
    {
        $schedule->load(['candidate', 'interview.user']);

        if (!$schedule->candidate->phone) {
            return false;
        }

        $formatted = $this->getFormattedTime($schedule);

        return $this->send(
            type: 'interview_rescheduled',
            to: $schedule->candidate->phone,
            placeholders: [
                'company' => $schedule->interview->company_name,
                'job' => $schedule->interview->job_title,
                'candidate' => $schedule->candidate->name,
                'date' => $formatted['date'],
                'time' => $formatted['time'],
                'url' => $schedule->getPublicUrl(),
            ]
        );
    }

    /**
     * Send interview cancelled notification to candidate.
     */
    public function sendInterviewCancelled(ScheduledInterview $schedule): bool
    {
        $schedule->load(['candidate', 'interview.user']);

        if (!$schedule->candidate->phone) {
            return false;
        }

        $formatted = $this->getFormattedTime($schedule);

        return $this->send(
            type: 'interview_cancelled',
            to: $schedule->candidate->phone,
            placeholders: [
                'company' => $schedule->interview->company_name,
                'job' => $schedule->interview->job_title,
                'candidate' => $schedule->candidate->name,
                'date' => $formatted['date'],
                'time' => $formatted['time'],
            ]
        );
    }

    /**
     * Get formatted time using recruiter's timezone.
     */
    protected function getFormattedTime(ScheduledInterview $schedule): array
    {
        $scheduler = app(SchedulingService::class);
        $recruiterTimezone = $schedule->interview->user?->timezone;

        return $scheduler->formatForEmail($schedule->scheduled_at, $recruiterTimezone);
    }

    /**
     * Send application received confirmation to candidate.
     */
    public function sendApplicationReceived(JobDescription $jobDescription, Candidate $candidate): bool
    {
        if (!$candidate->phone) {
            return false;
        }

        return $this->send(
            type: 'application_received',
            to: $candidate->phone,
            placeholders: [
                'company' => $jobDescription->company_name,
                'job' => $jobDescription->title,
                'candidate' => $candidate->name,
            ]
        );
    }

    /**
     * Core send method - handles all SMS sending logic.
     */
    protected function send(string $type, string $to, array $placeholders = []): bool
    {
        $typeConfig = $this->config['types'][$type] ?? null;

        if (!$typeConfig) {
            throw new \InvalidArgumentException("Unknown SMS type: {$type}");
        }

        $client = $this->getClient();
        if (!$client) {
            return false;
        }

        $from = $this->config['twilio']['from_number'];
        if (!$from) {
            Log::warning('SmsService: Twilio from number not configured');
            return false;
        }

        // Load and process template
        $message = $this->loadTemplate($typeConfig['template'], $placeholders);

        try {
            $client->messages->create(
                $to,
                [
                    'from' => $from,
                    'body' => $message,
                ]
            );

            Log::info('SMS sent successfully', [
                'type' => $type,
                'to' => substr($to, 0, -4) . '****', // Mask phone for logs
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMS sending failed', [
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Load and process a template file.
     */
    protected function loadTemplate(string $template, array $placeholders): string
    {
        $templateFile = "{$this->templatePath}/{$template}.txt";

        if (!file_exists($templateFile)) {
            throw new \InvalidArgumentException("SMS template not found: {$template}");
        }

        $content = file_get_contents($templateFile);
        return $this->replacePlaceholders($content, $placeholders);
    }

    /**
     * Replace placeholders in message template.
     */
    protected function replacePlaceholders(string $template, array $placeholders): string
    {
        foreach ($placeholders as $key => $value) {
            $template = str_replace("{{$key}}", $value, $template);
        }
        return $template;
    }

    /**
     * Get all configured SMS types (for admin/debugging).
     */
    public function getSmsTypes(): array
    {
        return $this->config['types'];
    }
}
