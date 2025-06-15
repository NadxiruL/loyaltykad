<?php

namespace App\Http\Controllers;

use App\Chip;
use App\Models\Order;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChipController extends Controller
{
    public function return(Request $request, Chip $chip)
    {
        Log::info('Chip return received', [
            'request' => $request->all(),
            'order_id' => $request->query('id')
        ]);

        try {
            $order = Order::where('reference_id', $request->query('id'))->firstOrFail();
            $payment = $order->payments()->latest()->first();

            if (!$payment) {
                throw new \Exception('Payment not found');
            }

            $purchaseInfo = $chip->getPurchase($payment->transaction_id);

            if ($purchaseInfo['status'] === 'paid') {
                $subscription = $this->processSuccessfulPayment($order, $payment, $purchaseInfo);

                return Inertia::render('Upgrade/ThankYou', [
                    'status' => 'success',
                    'message' => 'Payment successful! Your subscription has been activated.',
                    'order' => [
                        'reference_id' => $order->reference_id,
                        'total_amount' => $order->total_amount * 100, // Multiply by 100 to match Chip's format
                        'package' => [
                            'name' => $order->package->name
                        ]
                    ],
                    'subscription' => [
                        'start_date' => $subscription->start_date->format('Y-m-d'),
                        'end_date' => $subscription->end_date->format('Y-m-d')
                    ]
                ]);
            }

            if ($request->query('status') === 'cancelled') {
                return Inertia::render('Upgrade/ThankYou', [
                    'status' => 'cancelled',
                    'message' => 'Payment was cancelled.',
                    'order' => [
                        'reference_id' => $order->reference_id,
                        'total_amount' => $order->total_amount,
                        'package' => [
                            'name' => $order->package->name
                        ]
                    ]
                ]);
            }

            return Inertia::render('Upgrade/ThankYou', [
                'status' => 'failed',
                'message' => 'Payment was not successful. Please try again.',
                'order' => [
                    'reference_id' => $order->reference_id,
                    'total_amount' => $order->total_amount,
                    'package' => [
                        'name' => $order->package->name
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Chip return processing failed', [
                'error' => $e->getMessage(),
                'order_id' => $request->query('id')
            ]);

            return Inertia::render('Upgrade/ThankYou', [
                'status' => 'failed',
                'message' => 'Unable to process payment response. Please contact support.',
            ]);
        }
    }

    public function callback(Request $request, Chip $chip)
    {
        Log::info('Chip callback received', ['data' => $request->all()]);

        try {
            $payment = Payment::where('transaction_id', $request->purchase_id)->firstOrFail();
            $order = $payment->order;

            $purchaseInfo = $chip->getPurchase($request->purchase_id);

            if ($purchaseInfo['status'] === 'paid') {
                $this->processSuccessfulPayment($order, $payment, $purchaseInfo);
                return response()->json(['message' => 'Payment processed successfully']);
            }

            return response()->json(['message' => 'Payment not completed']);

        } catch (\Exception $e) {
            Log::error('Chip callback processing failed', [
                'error' => $e->getMessage(),
                'purchase_id' => $request->purchase_id ?? null
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    protected function processSuccessfulPayment(Order $order, Payment $payment, array $purchaseInfo)
    {
        $subscription = null;

        \DB::transaction(function () use ($order, $payment, $purchaseInfo, &$subscription) {
            // Update payment status
            $payment->update([
                'status' => 'completed',
                'provider_data' => json_encode($purchaseInfo),
                'paid_at' => now(),
            ]);

            // Update order status
            $order->update(['status' => 'completed']);

            // Create or update subscription
            $package = $order->package;
            $startDate = now();
            $endDate = $startDate->copy()->addDays($package->duration);

            $existingSubscription = $order->user->subscriptions()
                ->where('package_id', $package->id)
                ->first();

            if ($existingSubscription && $existingSubscription->isActive()) {
                // Extend existing subscription
                $endDate = $existingSubscription->end_date->addDays($package->duration);
            }

            $subscription = $order->user->subscriptions()->updateOrCreate(
                [
                    'package_id' => $package->id,
                ],
                [
                    'status' => 'active',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]
            );
        });

        return $subscription;
    }
}
