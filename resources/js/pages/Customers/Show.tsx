import { formatDate } from '@/components/date';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

interface Reward {
    stamp_number: number;
    description: string;
    is_final_reward?: boolean;
}

interface Card {
    id: number;
    template: {
        name: string;
        total_stamps: number;
    };
    current_stamps: number;
    completed: boolean;
    created_at: string;
    expiry_date: string | null;
    rewards: Reward[];
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    cards: Card[];
}

interface Props {
    customer: Customer;
}

export default function Show({ customer }: Props) {
    const { post, processing } = useForm();

    const handleStamp = (cardId: number) => {
        post(route('cards.stamp', cardId));
    };

    return (
        <AppLayout>
            <Head title={`Customer: ${customer.name}`} />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-xl font-semibold text-gray-800">Customer Details</h3>
                    </div>
                    <div className="space-y-3 p-6">
                        <p className="text-gray-700">
                            <span className="font-medium">Name:</span> {customer.name}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Phone:</span> {customer.phone}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="text-xl font-semibold text-gray-800">Cards</h3>
                        <Link
                            href={route('cards.create', { phone: customer.phone })}
                            className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                        >
                            Add New Card
                        </Link>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {customer.cards.map((card) => (
                                <div key={card.id} className="rounded-lg border bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b px-3 py-2">
                                        <h4 className="font-medium text-gray-800">{card.template.name}</h4>
                                        {card.completed && (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <div className="grid grid-cols-5 gap-1">
                                            {[...Array(card.template.total_stamps)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex aspect-square items-center justify-center rounded-full border text-xs font-medium ${
                                                        i < card.current_stamps
                                                            ? 'border-green-600 bg-green-500 text-white'
                                                            : 'border-gray-300 text-gray-400'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-2 text-xs text-gray-500">Created: {formatDate(card.created_at)}</div>

                                        {!card.completed && (
                                            <button
                                                onClick={() => handleStamp(card.id)}
                                                disabled={processing}
                                                className="mt-2 rounded bg-green-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                                            >
                                                Add Stamp
                                            </button>
                                        )}

                                        {card.rewards.length > 0 && (
                                            <div className="mt-3">
                                                <h5 className="mb-1 text-sm font-medium text-gray-800">Rewards:</h5>
                                                <ul className="space-y-1">
                                                    {card.rewards.map((reward, index) => (
                                                        <li key={index} className="rounded p-2 text-xs bg-gray-50" >{reward.description}</li>
                                                        // <li
                                                        //     key={index}
                                                        //     className={`rounded p-2 text-xs ${
                                                        //         reward.is_final_reward ? 'border border-yellow-200 bg-yellow-50' : 'bg-gray-50'
                                                        //     }`}
                                                        // >
                                                        //     {reward.is_final_reward && <span className="mr-1">👑</span>}
                                                        //     {reward.description}
                                                        // </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {card.expiry_date && (
                                            <div className="mt-2">
                                                {new Date(card.expiry_date) < new Date() ? (
                                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                        Expired
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                        Expires {formatDate(card.expiry_date)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
