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
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
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

        .btn {
            display: inline-block;
            background: #4f46e5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }

        .btn:hover {
            background: #4338ca;
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

    <p>Your AI screening interview has been scheduled!</p>

    <div class="details">
        <p>📅 <strong>Date:</strong> {{ $formatted_time['date'] }}</p>
        <p>⏰ <strong>Time:</strong> {{ $formatted_time['time'] }}</p>
        <p>⏱️ <strong>Duration:</strong> {{ $interview->duration_minutes }} minutes</p>
        <p>💼 <strong>Position:</strong> {{ $interview->job_title }}</p>
        <p>🏢 <strong>Company:</strong> {{ $interview->company_name }}</p>
    </div>

    <a href="{{ $interview_url }}" class="btn">Join Interview</a>

    <p><strong>What to expect:</strong></p>
    <ul>
        <li>An AI-powered screening conversation</li>
        <li>Questions tailored to the role</li>
        <li>Approximately {{ $interview->duration_minutes }} minutes</li>
    </ul>

    <p>Please join at your scheduled time using the button above.</p>

    <div class="footer">
        <p>Best regards,<br><strong>{{ $interview->company_name }} Hiring Team</strong></p>
        <p><em>Powered by {{ $branding['product_name'] }}</em><br>📧 {{ $branding['support_email'] }}</p>
    </div>
</body>

</html>