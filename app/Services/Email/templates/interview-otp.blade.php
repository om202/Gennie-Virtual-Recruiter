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

        .otp-box {
            background: #f8fafc;
            border: 2px dashed #4f46e5;
            border-radius: 12px;
            padding: 30px;
            margin: 25px 0;
            text-align: center;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #4f46e5;
            margin: 10px 0;
            font-family: 'Monaco', 'Consolas', monospace;
        }

        .otp-label {
            font-size: 13px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .otp-expiry {
            font-size: 13px;
            color: #94a3b8;
            margin-top: 10px;
        }

        .details {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px 20px;
            margin: 20px 0;
        }

        .details p {
            margin: 6px 0;
            font-size: 14px;
        }

        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            margin-top: 30px;
            font-size: 13px;
            color: #64748b;
        }

        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $branding['product_name'] }}</h1>
    </div>

    <p>Hello <strong>{{ $candidate->name }}</strong>,</p>

    <p>Here is your access code to start your interview:</p>

    <div class="otp-box">
        <div class="otp-label">Your Access Code</div>
        <div class="otp-code">{{ $otp_code }}</div>
        <div class="otp-expiry">This code expires in 10 minutes</div>
    </div>

    <div class="details">
        <p>💼 <strong>Position:</strong> {{ $interview->job_title }}</p>
        <p>🏢 <strong>Company:</strong> {{ $interview->company_name }}</p>
        <p>⏰ <strong>Scheduled:</strong> {{ $formatted_time['date'] }} at {{ $formatted_time['time'] }}</p>
    </div>

    <p>Enter this code on the interview page to begin your session.</p>

    <div class="warning">
        <strong>Didn't request this?</strong> If you didn't try to access your interview, you can safely ignore this
        email. Do not share this code with anyone.
    </div>

    <div class="footer">
        <p>Best regards,<br><strong>{{ $interview->company_name }} Hiring Team</strong></p>
        <p><em>Powered by {{ $branding['product_name'] }}</em><br>📧 {{ $branding['support_email'] }}</p>
    </div>
</body>

</html>