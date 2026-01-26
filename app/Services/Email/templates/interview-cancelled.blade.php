<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            border-bottom: 2px solid #ef4444;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #ef4444;
            margin: 0;
            font-size: 24px;
        }

        .alert {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
        }

        .details {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .details p {
            margin: 8px 0;
        }

        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            margin-top: 30px;
            font-size: 13px;
            color: #64748b;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $branding['product_name'] }}</h1>
    </div>

    <p>Hello <strong>{{ $candidate->name }}</strong>,</p>

    <div class="alert">
        <strong>Interview Cancelled</strong><br>
        We're writing to inform you that your scheduled interview has been cancelled.
    </div>

    <div class="details">
        <p>💼 <strong>Position:</strong> {{ $interview->job_title }}</p>
        <p>🏢 <strong>Company:</strong> {{ $interview->company_name }}</p>
        <p>📅 <strong>Originally Scheduled:</strong> {{ $schedule->scheduled_at->format('l, F j, Y') }} at
            {{ $schedule->scheduled_at->format('g:i A') }} UTC</p>
    </div>

    <p>If you believe this was done in error, please reach out to the hiring team.</p>

    <p>We appreciate your interest in the position and wish you the best in your job search.</p>

    <div class="footer">
        <p>Best regards,<br><strong>{{ $interview->company_name }} Hiring Team</strong></p>
        <p><em>Powered by {{ $branding['product_name'] }}</em><br>📧 {{ $branding['support_email'] }}</p>
    </div>
</body>

</html>