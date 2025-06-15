<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function search(Request $request)
    {
        $phone = $request->get('phone');

        $customer = Customer::where('phone', $phone)->first();

        return response()->json([
            'customer' => $customer,
            'cards' => $customer ? $customer->cards()->with('template')->get() : []
        ]);
    }

    public function index()
    {
        $customers = Customer::with(['cards.template'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'cards_count' => $customer->cards->count(),
                'active_cards' => $customer->cards->where('completed', false)->count(),
                'created_at' => $customer->created_at
            ]);

        return Inertia::render('Customers/Index', [
            'customers' => $customers
        ]);
    }

    public function show(Customer $customer)
    {
        $customer->load(['cards.template', 'cards.stampHistory', 'cards.rewards']);

        return Inertia::render('Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'cards' => $customer->cards->map(fn($card) => [
                    'id' => $card->id,
                    'template' => [
                        'name' => $card->template->name,
                        'total_stamps' => $card->template->total_stamps
                    ],
                    'current_stamps' => $card->current_stamps,
                    'completed' => $card->completed,
                    'created_at' => $card->created_at->format('Y-m-d H:i:s'),
                    'expiry_date' => $card->expiry_date,
                    'rewards' => $card->rewards->map(fn($reward) => [
                        'stamp_number' => $reward->stamp_number,
                        'description' => $reward->reward_description, // Changed from description to reward_description
                        'is_final_reward' => $reward->is_final_reward
                    ])
                ])
            ]
        ]);
    }
}
