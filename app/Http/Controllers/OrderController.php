<?php

namespace App\Http\Controllers;

use App\Chip;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function pay(Request $request, $reference_id, Chip $chip)
    {
        $provider = $request->input('provider', $request->query('provider'));
        if (!$provider) {
            return back()->withErrors(['error' => 'Payment provider is required.']);
        }

        $order = Order::where('reference_id', $reference_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($order->status !== 'pending') {
            return back()->withErrors(['error' => 'This order has already been processed.']);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => Auth::id(),
            'amount' => $order->total_amount,
            'status' => 'pending',
            'provider' => $provider,
        ]);

        try {
            if ($provider === 'chip') {
                $result = $this->processChipPayment($order, $payment, $chip);
                if (isset($result['checkout_url'])) {
                    return redirect()->away($result['checkout_url']);
                }
                throw new \Exception('Invalid payment response');
            }

            throw new \Exception('Invalid payment provider.');
        } catch (\Exception $e) {
            Log::error('Payment initiation failed', [
                'error' => $e->getMessage(),
                'order_id' => $order->reference_id,
                'provider' => $provider
            ]);
            $payment->update(['status' => 'failed']);
            $order->update(['status' => 'failed']);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    protected function processChipPayment($order, $payment, Chip $chip)
    {
        $purchaseData = [
            'success_callback' => route('payment.callback'),
            'success_redirect' => route('payment.return', ['id' => $order->reference_id]),
            'failure_redirect' => route('payment.return', ['id' => $order->reference_id, 'status' => 'failed']),
            'cancel_redirect' => route('payment.return', ['id' => $order->reference_id, 'status' => 'cancelled']),
            'platform' => 'web',
            'send_receipt' => true,
            'purchase' => [
                'currency' => 'MYR',
                'due' => now()->addDays(1)->timestamp,
                'products' => [
                    [
                        'name' => $order->package->name,
                        'price' => (int) ($order->total_amount * 100),
                        'quantity' => 1,
                    ],
                ],
            ],
            'client' => [
                'email' => Auth::user()->email,
                'phone' => Auth::user()->phone,
                'full_name' => Auth::user()->name,
            ],
            'brand_id' => $chip->brandId(),
        ];

        Log::info('Creating Chip purchase', ['data' => $purchaseData]);

        $purchase = $chip->createPurchase($purchaseData);
        Log::info('Chip purchase response', ['response' => $purchase]);

        if (!isset($purchase['id']) || !isset($purchase['checkout_url'])) {
            Log::error('Invalid Chip purchase response', ['response' => $purchase]);
            throw new \Exception('Invalid payment response from Chip');
        }

        $payment->update([
            'transaction_id' => $purchase['id'],
            'provider_data' => json_encode($purchase),
        ]);

        return $purchase;
    }

    // public function return(Request $request)
    // {
    //     Log::info('Payment return received', ['data' => $request->all()]);

    //     try {
    //         $order = Order::where('reference_id', $request->id)
    //             ->where('user_id', Auth::id())
    //             ->firstOrFail();

    //         $payment = $order->payments()->latest()->firstOrFail();

    //         if ($request->status === 'failed' || $request->status === 'cancelled') {
    //             $newStatus = $request->status;
    //             $payment->update(['status' => $newStatus]);
    //             $order->update(['status' => $newStatus]);

    //             return Inertia::render('Orders/Result', [
    //                 'status' => 'failed',
    //                 'message' => $newStatus === 'cancelled'
    //                     ? 'Payment was cancelled.'
    //                     : 'Payment was not successful. Please try again.'
    //             ]);
    //         }

    //         $chip = app(Chip::class);
    //         $purchaseInfo = $chip->getPurchase($payment->transaction_id);
    //         Log::info('Chip purchase verification', ['info' => $purchaseInfo]);

    //         if (isset($purchaseInfo['status']) && $purchaseInfo['status'] === 'paid') {
    //             DB::beginTransaction();
    //             try {
    //                 // Update payment status
    //                 $payment->status = 'completed';
    //                 $payment->provider_data = json_encode($purchaseInfo);
    //                 $payment->paid_at = now();
    //                 $payment->save();

    //                 // Update order status
    //                 $order->status = 'completed';
    //                 $order->save();

    //                 // Create or update subscription
    //                 $package = $order->package;
    //                 $startDate = now();
    //                 $endDate = $startDate->copy()->addDays($package->duration);

    //                 Subscription::updateOrCreate(
    //                     [
    //                         'user_id' => $order->user_id,
    //                         'package_id' => $package->id,
    //                     ],
    //                     [
    //                         'status' => 'active',
    //                         'start_date' => $startDate,
    //                         'end_date' => $endDate,
    //                     ]
    //                 );

    //                 DB::commit();

    //                 Log::info('Payment completed successfully', [
    //                     'order_id' => $order->reference_id,
    //                     'payment_id' => $payment->id,
    //                     'subscription_created' => true
    //                 ]);

    //                 return Inertia::render('Orders/Result', [
    //                     'status' => 'success',
    //                     'message' => 'Your subscription has been activated successfully!'
    //                 ]);
    //             } catch (\Exception $e) {
    //                 DB::rollBack();
    //                 Log::error('Failed to process successful payment', [
    //                     'error' => $e->getMessage(),
    //                     'trace' => $e->getTraceAsString()
    //                 ]);
    //                 throw $e;
    //             }
    //         }

    //         return Inertia::render('Orders/Result', [
    //             'status' => 'pending',
    //             'message' => 'Payment is being processed. Please wait...'
    //         ]);

    //     } catch (\Exception $e) {
    //         Log::error('Payment return processing failed', [
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString(),
    //             'request' => $request->all()
    //         ]);

    //         return Inertia::render('Orders/Result', [
    //             'status' => 'failed',
    //             'message' => 'An error occurred while processing your payment. Please contact support.'
    //         ]);
    //     }
    // }


    public function return(Request $request)
    {
        Log::info('Payment return received', ['request' => $request->all(), 'order_id' => $request->id]);

        try {
            $order = Order::where('reference_id', $request->id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $payment = $order->payments()->latest()->firstOrFail();

            if ($request->status === 'failed' || $request->status === 'cancelled') {
                $newStatus = $request->status;
                $payment->update(['status' => $newStatus]);
                $order->update(['status' => $newStatus]);

                return Inertia::render('Upgrade/ThankYou', [
                    'status' => $newStatus,
                    'message' => $newStatus === 'cancelled'
                        ? 'Payment was cancelled.'
                        : 'Payment was not successful. Please try again.',
                    'order' => [
                        'reference_id' => $order->reference_id,
                        'total_amount' => $order->total_amount,
                        'package' => [
                            'name' => $order->package->name
                        ]
                    ]
                ]);
            }

            $chip = app(Chip::class);
            $purchaseInfo = $chip->getPurchase($payment->transaction_id);
            Log::info('Chip purchase verification', ['info' => $purchaseInfo]);

            if (isset($purchaseInfo['status']) && $purchaseInfo['status'] === 'paid') {
                DB::beginTransaction();
                try {
                    // Update payment status
                    $payment->status = 'completed';
                    $payment->provider_data = json_encode($purchaseInfo);
                    $payment->paid_at = now();
                    $payment->save();

                    // Update order status
                    $order->status = 'completed';
                    $order->save();

                    // Create or update subscription
                    $package = $order->package;
                    $startDate = now();
                    $endDate = $startDate->copy()->addDays($package->duration);

                    $subscription = Subscription::updateOrCreate(
                        [
                            'user_id' => $order->user_id,
                            'package_id' => $package->id,
                        ],
                        [
                            'status' => 'active',
                            'start_date' => $startDate,
                            'end_date' => $endDate,
                        ]
                    );

                    DB::commit();

                    Log::info('Payment completed successfully', [
                        'order_id' => $order->reference_id,
                        'payment_id' => $payment->id,
                        'subscription_created' => true
                    ]);

                    return Inertia::render('Upgrade/ThankYou', [
                        'status' => 'success',
                        'message' => 'Your subscription has been activated successfully!',
                        'order' => [
                            'reference_id' => $order->reference_id,
                            'total_amount' => $order->total_amount,
                            'package' => [
                                'name' => $order->package->name
                            ]
                        ],
                        'subscription' => [
                            'start_date' => $subscription->start_date->format('Y-m-d'),
                            'end_date' => $subscription->end_date->format('Y-m-d')
                        ]
                    ]);
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Failed to process successful payment', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }

            return Inertia::render('Upgrade/ThankYou', [
                'status' => 'pending',
                'message' => 'Payment is being processed. Please wait...',
                'order' => [
                    'reference_id' => $order->reference_id,
                    'total_amount' => $order->total_amount,
                    'package' => [
                        'name' => $order->package->name
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment return processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Upgrade/ThankYou', [
                'status' => 'failed',
                'message' => 'An error occurred while processing your payment. Please contact support.'
            ]);
        }
    }

    public function callback(Request $request)
    {
        Log::info('Payment callback received', ['data' => $request->all()]);

        try {
            // The purchase_id is in the request body for callbacks
            $purchaseId = $request->input('purchase_id') ?? $request->input('id');

            if (!$purchaseId) {
                Log::error('No purchase ID in callback', ['request' => $request->all()]);
                return response()->json(['error' => 'No purchase ID provided'], 400);
            }

            $payment = Payment::where('transaction_id', $purchaseId)->first();

            if (!$payment) {
                Log::error('Payment not found for purchase ID', ['purchase_id' => $purchaseId]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            $order = $payment->order;

            if (!$order) {
                Log::error('Order not found for payment', ['payment_id' => $payment->id]);
                return response()->json(['error' => 'Order not found'], 404);
            }

            $chip = app(Chip::class);
            $purchaseInfo = $chip->getPurchase($purchaseId);

            Log::info('Chip purchase info in callback', ['info' => $purchaseInfo]);

            if (isset($purchaseInfo['status']) && $purchaseInfo['status'] === 'paid') {
                DB::beginTransaction();
                try {
                    // Update payment status
                    $payment->status = 'completed';
                    $payment->provider_data = json_encode($purchaseInfo);
                    $payment->paid_at = now();
                    $payment->save();

                    // Update order status
                    $order->status = 'completed';
                    $order->save();

                    // Create or update subscription
                    $package = $order->package;
                    $startDate = now();
                    $endDate = $startDate->copy()->addDays($package->duration);

                    Subscription::updateOrCreate(
                        [
                            'user_id' => $order->user_id,
                            'package_id' => $package->id,
                        ],
                        [
                            'status' => 'active',
                            'start_date' => $startDate,
                            'end_date' => $endDate,
                        ]
                    );

                    DB::commit();

                    Log::info('Payment completed successfully via callback', [
                        'order_id' => $order->reference_id,
                        'payment_id' => $payment->id
                    ]);

                    return response()->json(['message' => 'Payment processed successfully'], 200);
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Failed to process callback payment', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }

            return response()->json(['message' => 'Payment not completed or already processed'], 200);
        } catch (\Exception $e) {
            Log::error('Payment callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }
}
