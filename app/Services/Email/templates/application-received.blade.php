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
            border-bottom: 2px solid #10b981;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #10b981;
            margin: 0;
            font-size: 24px;
        }

        .success {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
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

    <div class="success">
        <strong>✅ Application Received!</strong><br>
        Thank you for applying. We've received your application.
    </div>

    <div class="details">
        <p>💼 <strong>Position:</strong> {{ $jobDescription->title }}</p>
        <p>🏢 <strong>Company:</strong> {{ $jobDescription->company_name }}</p>
        @if($jobDescription->location)
            <p>📍 <strong>Location:</strong> {{ $jobDescription->location }}</p>
        @endif
    </div>

    <p><strong>What happens next?</strong></p>
    <p>Our team will review your application and reach out if your qualifications match our requirements. This process
        typically takes 1-2 weeks.</p>
    <p>If selected for the next stage, you'll receive an invitation for an AI-powered screening interview.</p>

    <p>We appreciate your interest and wish you the best!</p>

    <div class="footer">
        <p>Best regards,<br><strong>{{ $jobDescription->company_name }} Hiring Team</strong></p>
        <p><em>Powered by {{ $branding['product_name'] }}</em><br>📧 {{ $branding['support_email'] }}</p>
    </div>
</body>

</html>