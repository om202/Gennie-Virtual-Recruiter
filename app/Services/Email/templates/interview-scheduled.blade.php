<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Scheduled</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        .button { padding: 14px 28px !important; }
    </style>
    <![endif]-->
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
                                Your AI screening interview has been scheduled. Here are the details:
                            </p>

                            <!-- Details Card -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span
                                                        style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Position</span>
                                                    <p
                                                        style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                                                        {{ $interview->job_title }}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span
                                                        style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Company</span>
                                                    <p
                                                        style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                                                        {{ $interview->company_name }}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span
                                                        style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Date
                                                        & Time</span>
                                                    <p
                                                        style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #4f46e5;">
                                                        {{ $formatted_time['date'] }}<br>
                                                        {{ $formatted_time['time'] }}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0 0;">
                                                    <span
                                                        style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Duration</span>
                                                    <p
                                                        style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                                                        {{ $interview->duration_minutes }} minutes
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 28px;">
                                        <a href="{{ $interview_url }}" class="button"
                                            style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                                            Join Interview →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- What to expect -->
                            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 8px;">
                                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1e293b;">What to
                                    expect:</p>
                                <ul
                                    style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>An AI-powered screening conversation</li>
                                    <li>Questions tailored to the {{ $interview->job_title }} role</li>
                                    <li>Approximately {{ $interview->duration_minutes }} minutes</li>
                                </ul>
                            </div>

                            <!-- Note -->
                            <div
                                style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-top: 24px; border-radius: 0 6px 6px 0;">
                                <p style="margin: 0; font-size: 13px; color: #92400e;">
                                    <strong>Please be on time.</strong> The interview window closes 10 minutes after the
                                    scheduled time.
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