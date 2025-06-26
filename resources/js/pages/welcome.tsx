import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/components/date';

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
        rewards: Reward[];
    };
    current_stamps: number;
    completed: boolean;
    created_at: string;
    expiry_date: string | null;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    shop_name: string;
    customer_cards: Card[];
}

interface SearchResponse {
    success: boolean;
    customers?: Customer[];
    message?: string;
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [phone, setPhone] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setCustomers([]);

        try {
            // Get the CSRF token from the meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/search-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    // Add this line to ensure Laravel recognizes the request as AJAX
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ phone }),
            });

            const data: SearchResponse = await response.json();

            if (data.success && data.customers) {
                setCustomers(data.customers);
            } else {
                setError(data.message || 'No cards found');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard.index')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <div className="max-w-4xl text-center w-full">
                        <div className="mb-8">
                            <h1 className="text-6xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-4">
                                KUMPOL
                            </h1>
                            <p className="text-xl text-[#666] dark:text-[#999] mb-8">
                                Collect - Redeem - Enjoy!
                            </p>
                        </div>

                        {/* Card Search Section */}
                        <div className="mb-12 max-w-md mx-auto">
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#19140035] dark:border-[#3E3E3A] p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Check Your Loyalty Cards
                                </h3>
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="w-full px-4 py-3 border border-[#19140035] dark:border-[#3E3E3A] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC] placeholder-[#666] dark:placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#1b1b18] dark:bg-[#EDEDEC] text-white dark:text-[#1b1b18] px-6 py-3 rounded-lg font-medium hover:bg-[#333] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Searching...' : 'Search Cards'}
                                    </button>
                                </form>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Cards Display */}
                        {customers.length > 0 && (
                            <div className="mb-12">
                                {customers.map((customer, index) => (
                                    <div key={index} className="mb-6 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#19140035] dark:border-[#3E3E3A] shadow-sm">
                                        <div className="border-b border-[#19140035] dark:border-[#3E3E3A] px-6 py-4">
                                            <h3 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {customer.name} at {customer.shop_name}
                                            </h3>
                                            <p className="text-sm text-[#666] dark:text-[#999]">{customer.phone}</p>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                {customer.customer_cards.map((card) => (
                                                    <div key={card.id} className="rounded-lg border border-[#19140035] dark:border-[#3E3E3A] bg-gradient-to-br from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#0f0f0f] shadow-sm overflow-hidden">
                                                        <div className="bg-[#1b1b18] dark:bg-[#EDEDEC] px-4 py-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-semibold text-white dark:text-[#1b1b18] text-lg">
                                                                    {card.template.name}
                                                                </h4>
                                                                {card.completed && (
                                                                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                                        ✓ Complete
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="p-4">
                                                            {/* Progress Bar */}
                                                            <div className="mb-4">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                                        Progress
                                                                    </span>
                                                                    <span className="text-sm text-[#666] dark:text-[#999]">
                                                                        {card.current_stamps}/{card.template.total_stamps}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div
                                                                        className="bg-[#1b1b18] dark:bg-[#EDEDEC] h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${(card.current_stamps / card.template.total_stamps) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>

                                                            {/* Stamp Grid */}
                                                            <div className="grid grid-cols-5 gap-2 mb-4">
                                                                {[...Array(card.template.total_stamps)].map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`aspect-square flex items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                                                                            i < card.current_stamps
                                                                                ? 'border-green-500 bg-green-500 text-white shadow-md transform scale-105'
                                                                                : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                                                                        }`}
                                                                    >
                                                                        {i < card.current_stamps ? '★' : i + 1}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Rewards */}
                                                            {card.template.rewards && card.template.rewards.length > 0 && (
                                                                <div className="mb-4">
                                                                    <h5 className="text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                                                                        🎁 Available Rewards:
                                                                    </h5>
                                                                    <div className="space-y-1">
                                                                        {card.template.rewards.map((reward, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className={`text-xs p-2 rounded-md ${
                                                                                    card.current_stamps >= reward.stamp_number
                                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                                                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                                                }`}
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {reward.stamp_number} stamps:
                                                                                </span> {reward.description}
                                                                                {card.current_stamps >= reward.stamp_number && (
                                                                                    <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Card Info */}
                                                            <div className="text-xs text-[#666] dark:text-[#999] space-y-1">
                                                                <div>Created: {formatDate(card.created_at)}</div>
                                                                {card.expiry_date && (
                                                                    <div className="flex items-center gap-2">
                                                                        {new Date(card.expiry_date) < new Date() ? (
                                                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                                                                                Expired {formatDate(card.expiry_date)}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                                                                                Expires {formatDate(card.expiry_date)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {customer.customer_cards.length === 0 && (
                                                <div className="text-center py-8">
                                                    <div className="text-4xl mb-4">🎴</div>
                                                    <p className="text-[#666] dark:text-[#999]">No loyalty cards found for this customer.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Features Section */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="p-6 rounded-lg border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#1a1a1a]">
                                <div className="text-3xl mb-3">🎯</div>
                                <h3 className="font-semibold mb-2 text-[#1b1b18] dark:text-[#EDEDEC]">Mudah Digunakan</h3>
                                <p className="text-sm text-[#666] dark:text-[#999]">Cipta dan urus kad kesetiaan dengan mudah</p>
                            </div>
                            <div className="p-6 rounded-lg border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#1a1a1a]">
                                <div className="text-3xl mb-3">📱</div>
                                <h3 className="font-semibold mb-2 text-[#1b1b18] dark:text-[#EDEDEC]">Digital</h3>
                                <p className="text-sm text-[#666] dark:text-[#999]">Tiada lagi kad fizikal yang hilang</p>
                            </div>
                            <div className="p-6 rounded-lg border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#1a1a1a]">
                                <div className="text-3xl mb-3">💼</div>
                                <h3 className="font-semibold mb-2 text-[#1b1b18] dark:text-[#EDEDEC]">Untuk Bisnes</h3>
                                <p className="text-sm text-[#666] dark:text-[#999]">Tingkatkan kesetiaan pelanggan</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
