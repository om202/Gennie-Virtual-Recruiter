<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\SubscriptionService;

class SubscriptionController extends Controller
{
    protected SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Show the subscription/billing page.
     */
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Subscription', [
            'auth' => ['user' => $user],
            'activeTab' => 'subscription',
            'usageStats' => $this->subscriptionService->getUsageStats($user),
            'plans' => $this->subscriptionService->getAvailablePlans(),
        ]);
    }

    /**
     * Show the full usage history page.
     */
    public function history(Request $request): Response
    {
        $user = Auth::user();
        $page = (int) $request->get('page', 1);

        return Inertia::render('UsageHistory', [
            'auth' => ['user' => $user],
            'history' => $this->subscriptionService->getUsageHistory($user, $page, 20),
        ]);
    }

    /**
     * Get available plans (API).
     */
    public function plans()
    {
        return response()->json([
            'plans' => $this->subscriptionService->getAvailablePlans(),
        ]);
    }

    /**
     * Change plan (upgrade is immediate, downgrade is scheduled).
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_slug' => 'required|string',
        ]);

        $user = Auth::user();
        $result = $this->subscriptionService->changePlan($user, $request->plan_slug);

        if (!$result['success']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }

    /**
     * Cancel a scheduled downgrade.
     */
    public function cancelDowngrade()
    {
        $user = Auth::user();
        $result = $this->subscriptionService->cancelScheduledDowngrade($user);

        if (!$result['success']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }

    /**
     * Get full usage history with monthly summaries (API).
     */
    public function usageHistory(Request $request)
    {
        $user = Auth::user();
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 20);

        return response()->json(
            $this->subscriptionService->getUsageHistory($user, $page, $perPage)
        );
    }

    /**
     * Get current usage stats (API).
     */
    public function stats()
    {
        $user = Auth::user();
        return response()->json($this->subscriptionService->getUsageStats($user));
    }
}
