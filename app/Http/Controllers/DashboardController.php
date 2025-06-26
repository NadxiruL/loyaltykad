<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerCard;
use App\Models\Customer;
use App\Models\CardTemplate;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $totalCards = CustomerCard::count();
        $totalCustomers = Customer::count();
        $totalTemplates = CardTemplate::count();

        // Active cards (not expired)
        $activeCards = CustomerCard::where(function ($query) {
            $query->whereNull('expiry_date')
                  ->orWhere('expiry_date', '>=', Carbon::now());
        })->count();

        // Expired cards
        $expiredCards = CustomerCard::where('expiry_date', '<', Carbon::now())->count();

        // Completed cards (cards with stamps equal to template requirement)
        $completedCards = CustomerCard::join('card_templates', 'customer_cards.card_template_id', '=', 'card_templates.id')
            ->whereRaw('customer_cards.current_stamps >= card_templates.total_stamps')
            ->count();

        // Recent cards (last 7 days)
        $recentCards = CustomerCard::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        // Cards expiring soon (next 7 days)
        $expiringSoon = CustomerCard::whereBetween('expiry_date', [
            Carbon::now(),
            Carbon::now()->addDays(7)
        ])->count();

        // Monthly stats for chart
        $monthlyStats = CustomerCard::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', Carbon::now()->subMonths(6))
        ->groupBy('year', 'month')
        ->orderBy('year', 'asc')
        ->orderBy('month', 'asc')
        ->get()
        ->map(function ($item) {
            return [
                'month' => Carbon::create($item->year, $item->month)->format('M Y'),
                'count' => $item->count
            ];
        });

        // Top templates by usage
        $topTemplates = CardTemplate::withCount(['customerCards' => function ($query) {
            $query->whereHas('customer'); // Only count cards with valid customers
        }])
        ->orderBy('customer_cards_count', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($template) {
            return [
                'name' => $template->name,
                'count' => $template->customer_cards_count,
                'total_stamps' => $template->total_stamps
            ];
        });

        // Recent activity
        $recentActivity = CustomerCard::with(['customer', 'template'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($card) {
                return [
                    'id' => $card->id,
                    'customer_name' => $card->customer->name,
                    'customer_phone' => $card->customer->phone,
                    'template_name' => $card->template->name,
                    'current_stamps' => $card->current_stamps,
                    'total_stamps' => $card->template->total_stamps,
                    'created_at' => $card->created_at->diffForHumans(),
                    'status' => $this->getCardStatus($card)
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'totalCards' => $totalCards,
                'totalCustomers' => $totalCustomers,
                'totalTemplates' => $totalTemplates,
                'activeCards' => $activeCards,
                'expiredCards' => $expiredCards,
                'completedCards' => $completedCards,
                'recentCards' => $recentCards,
                'expiringSoon' => $expiringSoon
            ],
            'monthlyStats' => $monthlyStats,
            'topTemplates' => $topTemplates,
            'recentActivity' => $recentActivity
        ]);
    }

    private function getCardStatus($card): string
    {
        if ($card->expiry_date && Carbon::parse($card->expiry_date)->isPast()) {
            return 'expired';
        }

        if ($card->current_stamps >= $card->template->total_stamps) {
            return 'completed';
        }

        if ($card->expiry_date && Carbon::parse($card->expiry_date)->diffInDays(Carbon::now()) <= 7) {
            return 'expiring_soon';
        }

        return 'active';
    }
}
