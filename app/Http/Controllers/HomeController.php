<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerCard;
use App\Models\Customer;
use Inertia\Inertia;


class HomeController extends Controller
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
        $cards = CustomerCard::count();
        $customers = Customer::count();

        return Inertia::render('dashboard', [
            'cards' => $cards,
            'customers' => $customers
        ]);
    }
}
