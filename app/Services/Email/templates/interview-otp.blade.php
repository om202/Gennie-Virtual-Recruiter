<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Access Code</title>
</head>

<body
    style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

    <!-- Wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">

                <!-- Main Card -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 40px; text-align: center;">
                            <h1
                                style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.025em;">
                                {{ $branding['product_name'] }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">

                            <!-- Greeting -->
                            <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b; line-height: 1.6;">
                                Hello <strong>{{ $candidate->name }}</strong>,
                            </p>

                            <p style="margin: 0 0 28px; font-size: 16px; color: #475569; line-height: 1.6;">
                                Here is your one-time access code to start your interview:
                            </p>

                            <!-- OTP Code Box -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; border: 2px dashed #4f46e5; margin-bottom: 28px;">
                                <tr>
                                    <td align="center" style="padding: 32px;">
                                        <p
                                            style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
                                            Your Access Code
                                        </p>
                                        <p
                                            style="margin: 0 0 12px; font-size: 42px; font-weight: 700; letter-spacing: 10px; color: #4f46e5; font-family: 'Monaco', 'Consolas', monospace;">
                                            {{ $otp_code }}
                                        </p>
                                        <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                                            This code expires in 10 minutes
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Interview Details -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <p style="margin: 0 0 4px; font-size: 14px; color: #475569;">
                                            <strong style="color: #1e293b;">{{ $interview->job_title }}</strong> at
                                            {{ $interview->company_name }}
                                        </p>
                                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                                            Scheduled: {{ $formatted_time['date'] }} at {{ $formatted_time['time'] }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                                Enter this code on the interview page to verify your identity and begin your session.
                            </p>

                            <!-- Security Note -->
                            <div
                                style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                                <p style="margin: 0; font-size: 13px; color: #991b1b;">
                                    <strong>Didn't request this?</strong> If you didn't try to access your interview,
                                    you can safely ignore this email. Never share this code with anyone.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">
                                Best regards,<br>
                                <strong style="color: #1e293b;">{{ $recruiter_company }} Hiring Team</strong>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                Powered by {{ $branding['product_name'] }} • {{ $branding['support_email'] }}
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>