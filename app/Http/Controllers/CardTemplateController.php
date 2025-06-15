<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CardTemplate;
use App\Models\CardReward;
use Inertia\Inertia;

class CardTemplateController extends Controller
{
    public function index()
    {
        $templates = CardTemplate::with('rewards')->paginate(10);

        return Inertia::render('Templates/Index', [
            'templates' => $templates,
            'hasActiveSubscription' => auth()->user()->hasActiveSubscription()
        ]);
    }

    public function create()
    {
        return Inertia::render('Templates/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:card_templates|string|max:255',
            'total_stamps' => 'required|integer|min:1|max:15',
            'has_expiration' => 'boolean',
            'validity_days' => 'nullable|required_if:has_expiration,true|integer|min:1',
            'rewards' => 'array'
        ]);

        $template = CardTemplate::create([
            'name' => $validated['name'],
            'total_stamps' => $validated['total_stamps'],
            'has_expiration' => $validated['has_expiration'] ?? false,
            'validity_days' => $validated['has_expiration'] ? $validated['validity_days'] : null,
            'user_id' => auth()->id()
        ]);

        if (isset($validated['rewards'])) {
            foreach ($validated['rewards'] as $stamp => $reward) {
                if (!empty($reward['description'])) {
                    CardReward::create([
                        'card_template_id' => $template->id,
                        'stamp_number' => $stamp,
                        'reward_description' => $reward['description'],
                        'is_final_reward' => isset($reward['is_final']) && $reward['is_final'] === 'on' ? true : false
                    ]);
                }
            }
        }

        return redirect()->route('templates.index')
            ->with('success', 'Template created successfully');
    }

    public function show(CardTemplate $template)
    {
        $template->load('rewards');

        return Inertia::render('Templates/Show', [
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

    public function edit(CardTemplate $template)
    {
        $template->load('rewards');
        return Inertia::render('Templates/Create', [
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

    public function update(Request $request, CardTemplate $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'total_stamps' => 'required|integer|min:1|max:15',
            'has_expiration' => 'boolean',
            'validity_days' => 'nullable|required_if:has_expiration,true|integer|min:1',
            'rewards' => 'array'
        ]);

        $template->update([
            'name' => $validated['name'],
            'total_stamps' => $validated['total_stamps'],
            'has_expiration' => $validated['has_expiration'],
            'validity_days' => $validated['has_expiration'] ? $validated['validity_days'] : null
        ]);

        // Update rewards
        $template->rewards()->delete();

        if (isset($validated['rewards'])) {
            foreach ($validated['rewards'] as $stamp => $reward) {
                if (!empty($reward['description'])) {
                    CardReward::create([
                        'card_template_id' => $template->id,
                        'stamp_number' => $stamp,
                        'reward_description' => $reward['description'],
                        'is_final_reward' => $stamp == $validated['total_stamps']
                    ]);
                }
            }
        }

        return redirect()->route('templates.index')
            ->with('success', 'Template updated successfully');
    }

    public function destroy(CardTemplate $template)
    {
        $template->delete();
        return redirect()->route('templates.index')
            ->with('success', 'Template deleted successfully');
    }
}
