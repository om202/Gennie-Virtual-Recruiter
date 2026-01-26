<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Rescheduled</title>
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
                            style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 32px 40px; text-align: center;">
                            <h1
                                style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.025em;">
                                {{ $branding['product_name'] }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">

                            <!-- Status Badge -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td
                                        style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;">
                                        Rescheduled
                                    </td>
                                </tr>
                            </table>

                            <!-- Greeting -->
                            <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b; line-height: 1.6;">
                                Hello <strong>{{ $candidate->name }}</strong>,
                            </p>

                            <p style="margin: 0 0 28px; font-size: 16px; color: #475569; line-height: 1.6;">
                                Your interview has been rescheduled to a new time. Please see the updated details below:
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
                                                <td style="padding: 8px 0 0;">
                                                    <span
                                                        style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">New
                                                        Date & Time</span>
                                                    <p
                                                        style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #f59e0b;">
                                                        {{ $formatted_time['date'] }}<br>
                                                        {{ $formatted_time['time'] }}
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
                                        <a href="{{ $interview_url }}"
                                            style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                                            Join Interview →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                The same interview link will work at the new time. If you have any questions, please
                                contact the hiring team.
                            </p>

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