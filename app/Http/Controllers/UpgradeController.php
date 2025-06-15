<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Package;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class UpgradeController extends Controller
{
    public function index()
    {
        // Get all available packages
        $packages = Package::all();

        return Inertia::render('Upgrade/Index', [
            'packages' => $packages
        ]);
    }

    public function show($id)
    {
        $package = Package::findOrFail($id);

        return Inertia::render('Upgrade/Show', [
            'package' => $package
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'payment_provider' => 'required|in:chip,securepay'
        ]);

        $package = Package::findOrFail($request->package_id);
        $user = Auth::user();

        // Create new order
        $order = Order::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'total_amount' => $package->price,
            'status' => 'pending'
        ]);

        if ($request->payment_provider === 'chip') {
            return Inertia::location(route('order.pay', [
                'reference_id' => $order->reference_id,
                'provider' => $request->payment_provider,
            ]));
        }

        return back()->with('error', 'Unsupported payment provider');
    }
}
