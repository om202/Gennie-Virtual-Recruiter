<?php

namespace App\Services\Email;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;
use Illuminate\Mail\Message;
use App\Models\ScheduledInterview;
use App\Models\JobDescription;
use App\Models\Candidate;
use App\Services\Scheduling\SchedulingService;

/**
 * EmailService - Centralized email handling for the application.
 * 
 * Usage:
 *   app(EmailService::class)->sendInterviewScheduled($schedule);
 *   app(EmailService::class)->sendApplicationReceived($jobDescription, $candidate);
 */
class EmailService
{
    protected array $config;
    protected string $templatePath;

    public function __construct()
    {
        $this->config = require __DIR__ . '/config.php';
        $this->templatePath = __DIR__ . '/templates';

        // Register the custom view namespace for email templates
        View::addNamespace('email', $this->templatePath);
    }

    /**
     * Send interview scheduled notification to candidate.
     */
    public function sendInterviewScheduled(ScheduledInterview $schedule): void
    {
        $schedule->load(['candidate', 'interview.user']);
        $formatted = $this->getFormattedTime($schedule);

        $this->send(
            type: 'interview_scheduled',
            to: $schedule->candidate->email,
            data: [
                'schedule' => $schedule,
                'candidate' => $schedule->candidate,
                'interview' => $schedule->interview,
                'interview_url' => $schedule->getPublicUrl(),
                'formatted_time' => $formatted,
            ],
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
     * Send interview rescheduled notification to candidate.
     */
    public function sendInterviewRescheduled(ScheduledInterview $schedule): void
    {
        $schedule->load(['candidate', 'interview.user']);
        $formatted = $this->getFormattedTime($schedule);

        $this->send(
            type: 'interview_rescheduled',
            to: $schedule->candidate->email,
            data: [
                'schedule' => $schedule,
                'candidate' => $schedule->candidate,
                'interview' => $schedule->interview,
                'interview_url' => $schedule->getPublicUrl(),
                'formatted_time' => $formatted,
            ],
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
     * Send interview cancelled notification to candidate.
     */
    public function sendInterviewCancelled(ScheduledInterview $schedule): void
    {
        $schedule->load(['candidate', 'interview.user']);
        $formatted = $this->getFormattedTime($schedule);

        $this->send(
            type: 'interview_cancelled',
            to: $schedule->candidate->email,
            data: [
                'schedule' => $schedule,
                'candidate' => $schedule->candidate,
                'interview' => $schedule->interview,
                'formatted_time' => $formatted,
            ],
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
    public function sendApplicationReceived(JobDescription $jobDescription, Candidate $candidate): void
    {
        $this->send(
            type: 'application_received',
            to: $candidate->email,
            data: [
                'jobDescription' => $jobDescription,
                'candidate' => $candidate,
            ],
            placeholders: [
                'company' => $jobDescription->company_name,
                'job' => $jobDescription->title,
                'candidate' => $candidate->name,
            ]
        );
    }

    /**
     * Core send method - handles all email sending logic.
     */
    protected function send(string $type, string $to, array $data, array $placeholders = []): void
    {
        $typeConfig = $this->config['types'][$type] ?? null;

        if (!$typeConfig) {
            throw new \InvalidArgumentException("Unknown email type: {$type}");
        }

        // Build subject with placeholders
        $subject = $this->replacePlaceholders($typeConfig['subject'], $placeholders);

        // Add branding to template data
        $data['branding'] = $this->config['branding'];

        // Send via Laravel Mail
        Mail::send(
            "email::{$typeConfig['template']}",
            $data,
            function (Message $message) use ($to, $subject) {
                $message->to($to)
                    ->subject($subject)
                    ->from(
                        $this->config['from']['address'],
                        $this->config['from']['name']
                    );
            }
        );
    }

    /**
     * Replace placeholders in subject line.
     */
    protected function replacePlaceholders(string $template, array $placeholders): string
    {
        foreach ($placeholders as $key => $value) {
            $template = str_replace("{{$key}}", $value, $template);
        }
        return $template;
    }

    /**
     * Get all configured email types (for admin/debugging).
     */
    public function getEmailTypes(): array
    {
        return $this->config['types'];
    }
}
