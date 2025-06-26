<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('welcome');
    }

    public function searchCard(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = $request->phone;

        // Remove the UserScope to get customers from all users
        $customers = Customer::withoutGlobalScope(UserScope::class)
            ->where('phone', $phone)
            ->with([
                'cards' => function ($query) {
                    $query->with(['template' => function ($q) {
                        $q->with('rewards');
                    }]);
                },
                'user:id,name'
            ])
            ->get();

        if ($customers->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No customer found with this phone number.'
            ]);
        }

        // Format the customer data for the frontend
        $formattedCustomers = $customers->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'shop_name' => $customer->user->name ?? 'Unknown Shop',
                'customer_cards' => $customer->cards->map(function ($card) {
                    return [
                        'id' => $card->id,
                        'template' => [
                            'name' => $card->template->name,
                            'total_stamps' => $card->template->total_stamps,
                            'rewards' => $card->template->rewards->map(function ($reward) {
                                return [
                                    'stamp_number' => $reward->stamp_number,
                                    'description' => $reward->reward_description,
                                    'is_final_reward' => $reward->is_final_reward,
                                ];
                            }),
                        ],
                        'current_stamps' => $card->current_stamps,
                        'completed' => $card->completed,
                        'created_at' => $card->created_at,
                        'expiry_date' => $card->expiry_date,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'customers' => $formattedCustomers,
        ]);
    }
}
