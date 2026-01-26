<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
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
                            style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 32px 40px; text-align: center;">
                            <h1
                                style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.025em;">
                                {{ $branding['product_name'] }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">

                            <!-- Success Banner -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 8px; margin-bottom: 28px;">
                                <tr>
                                    <td align="center" style="padding: 24px;">
                                        <p style="margin: 0 0 8px; font-size: 32px;">✅</p>
                                        <p style="margin: 0; font-size: 18px; font-weight: 600; color: #065f46;">
                                            Application Received!
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Greeting -->
                            <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b; line-height: 1.6;">
                                Hello <strong>{{ $candidate->name }}</strong>,
                            </p>

                            <p style="margin: 0 0 28px; font-size: 16px; color: #475569; line-height: 1.6;">
                                Thank you for applying! We've received your application and it's now being reviewed.
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
                                                        {{ $jobDescription->title }}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style="padding: 8px 0;@if($jobDescription->location) border-bottom: 1px solid #e2e8f0;@endif">
                                                    <span
                                                        style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Company</span>
                                                    <p
                                                        style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                                                        {{ $jobDescription->company_name }}
                                                    </p>
                                                </td>
                                            </tr>
                                            @if($jobDescription->location)
                                                <tr>
                                                    <td style="padding: 8px 0 0;">
                                                        <span
                                                            style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Location</span>
                                                        <p
                                                            style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                                                            {{ $jobDescription->location }}
                                                        </p>
                                                    </td>
                                                </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            @if(isset($schedule_url) && $schedule_url)
                                <!-- Schedule Your Interview CTA -->
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
                                    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #1e293b;">Ready
                                        for your AI Screening Interview?</p>
                                    <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                                        You can schedule your interview right now and pick a time that works best for you.
                                    </p>
                                    <a href="{{ $schedule_url }}"
                                        style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);">
                                        📅 Schedule Your Interview
                                    </a>
                                    <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8;">
                                        This link is unique to your application. Don't share it with anyone.
                                    </p>
                                </div>
                            @else
                                <!-- What happens next (default) -->
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1e293b;">What
                                        happens next?</p>
                                    <ul
                                        style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                        <li>Our team will review your application</li>
                                        <li>You'll receive an email within 1-2 weeks</li>
                                        <li>If selected, you'll get an AI screening invite</li>
                                    </ul>
                                </div>
                            @endif

                            <p style="margin: 24px 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                We appreciate your interest and wish you the best!
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