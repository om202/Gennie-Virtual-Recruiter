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
            'usageStats' => $this->subscriptionService->getUsageStats($user),
            'plans' => $this->subscriptionService->getAvailablePlans(),
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
     * Upgrade to a new plan (mocked payment).
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_slug' => 'required|string',
        ]);

        $user = Auth::user();
        $result = $this->subscriptionService->upgradePlan($user, $request->plan_slug);

        if (!$result['success']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }

    /**
     * Get usage history (API).
     */
    public function usageHistory()
    {
        $user = Auth::user();

        $records = $user->usageRecords()
            ->with(['interviewSession:id,candidate_id,interview_id', 'interviewSession.candidate:id,name'])
            ->orderBy('recorded_at', 'desc')
            ->paginate(20);

        return response()->json($records);
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
