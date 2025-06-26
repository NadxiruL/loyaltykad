<?php

namespace App\Http\Controllers;

use App\Models\StampHistory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\CustomerCard;
use App\Models\CardTemplate;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CardController extends Controller
{
    public function index()
    {
        $cards = CustomerCard::with(['customer', 'template', 'rewards'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Cards/Index', [
            'cards' => $cards
        ]);
    }

    public function create(Request $request)
    {
        $templates = CardTemplate::with('rewards')->get();
        $customers = Customer::select('id', 'name', 'phone')->get();
        $customer = null;

        if ($request->has('phone')) {
            $customer = Customer::where('phone', $request->phone)->first();
        }

        return Inertia::render('Cards/Create', [
            'templates' => $templates,
            'customers' => $customers,
            'customer' => $customer
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'name' => 'required|string',
            'template_id' => 'required|exists:card_templates,id',
            'start_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:start_date',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Find or create customer with is_existing_customer defaulting to false
            // Now using firstOrCreate with both phone and user_id as the unique identifier
            $customer = Customer::firstOrCreate(
                [
                    'phone' => $validated['phone'],
                    'user_id' => auth()->id()
                ],
                [
                    'name' => $validated['name'],
                    'is_existing_customer' => $request->boolean('is_existing_customer', false)
                ]
            );

            // Create new card - Fix the column name from template_id to card_template_id
            $card = CustomerCard::create([
                'customer_id' => $customer->id,
                'card_template_id' => $validated['template_id'], // Changed from template_id
                'current_stamps' => 1,
                'start_date' => $validated['start_date'],
                'expiry_date' => $validated['expiry_date'],
                'user_id' => auth()->id()
            ]);

            // Create first stamp history
            StampHistory::create([
                'customer_card_id' => $card->id,
                'stamps_added' => 1,
                'user_id' => auth()->id()
            ]);

            return $card;
        });

        return redirect()->route('cards.index')->with('success', 'Card created successfully');
    }

    public function show(CardTemplate $template)
    {
        $template->load('rewards');

        return Inertia::render('Cards/Show', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'total_stamps' => (int) $template->total_stamps,
                'has_expiration' => (bool) $template->has_expiration,
                'validity_days' => $template->validity_days ? (int) $template->validity_days : null,
                'rewards' => $template->rewards->map(function ($reward) {
                    return [
                        'stamp_number' => (int) $reward->stamp_number,
                        'reward_description' => $reward->reward_description,
                        'is_final_reward' => (bool) $reward->is_final_reward
                    ];
                })
            ]
        ]);
    }

    public function addStamp(CustomerCard $card)
    {
        $card->increment('current_stamps');

        StampHistory::create([
            'customer_card_id' => $card->id,
            'stamps_added' => 1,
            'user_id' => auth()->id()
        ]);

        if ($card->current_stamps >= $card->template->total_stamps) {
            $card->update(['completed' => true]);
        }

        return redirect()->back()->with('success', 'Stamp added successfully');
    }
}
