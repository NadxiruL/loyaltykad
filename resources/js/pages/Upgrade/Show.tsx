import { Package } from '@/types';
import { useForm } from '@inertiajs/react';
import { ArrowPathIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface Props {
    package: Package;
}

export default function Show({ package: pkg }: Props) {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const { data, setData, post, processing, errors } = useForm({
        package_id: pkg.id,
        payment_provider: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsRedirecting(true);

        post(route('upgrade.store'), {
            onSuccess: () => {
                // The redirect to order.pay will happen via Inertia::location()
                // Keep showing loading state until redirect happens
            },
            onError: (err) => {
                console.error('Form submission error:', err);
                setIsRedirecting(false);
            },
        });
    };

    // Countdown effect for redirect message
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRedirecting && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRedirecting, countdown]);

    const breadcrumbs = [
        { title: 'Upgrade', href: '/upgrade' },
        { title: pkg.name, href: `/upgrade/${pkg.id}` },
    ];

    return (
        <div className="mx-auto max-w-3xl py-6 px-4 sm:px-6 lg:px-8">
            <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                {/* Loading Overlay */}
                {isRedirecting && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-center p-8">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CreditCardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                                Redirecting to Payment Gateway
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                Please wait while we securely redirect you to complete your payment...
                            </p>
                            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                <span>Redirecting in {countdown > 0 ? countdown : '...'} seconds</span>
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    ⚠️ Please do not close this window or navigate away from this page
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                            <CreditCardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{pkg.name}</h1>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Upgrade your account to unlock premium features</p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Package Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <p className="text-neutral-700 dark:text-neutral-300">{pkg.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Monthly Price</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">RM{pkg.price}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                                Select Payment Method
                            </label>
                            <div className="space-y-3">
                                <label className="relative flex items-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="payment_provider"
                                        value="chip"
                                        checked={data.payment_provider === 'chip'}
                                        onChange={(e) => setData('payment_provider', e.target.value)}
                                        className="sr-only"
                                        disabled={isRedirecting}
                                    />
                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                        data.payment_provider === 'chip'
                                            ? 'border-blue-600 dark:border-blue-400'
                                            : 'border-neutral-300 dark:border-neutral-600'
                                    }`}>
                                        {data.payment_provider === 'chip' && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">C</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100">Chip Payment Gateway</p>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Secure payment via Chip</p>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {errors.payment_provider && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.payment_provider}</p>
                            )}
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={processing || !data.payment_provider || isRedirecting}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                            >
                                {processing || isRedirecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>
                                            {isRedirecting ? 'Redirecting to Payment...' : 'Processing...'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCardIcon className="w-5 h-5" />
                                        <span>Proceed to Payment</span>
                                    </>
                                )}
                            </button>

                            {(processing || isRedirecting) && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 border-2 border-blue-600/30 dark:border-blue-400/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                {isRedirecting ? 'Redirecting to secure payment gateway...' : 'Processing your request...'}
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Please wait and do not refresh this page.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Secure Payment</span>
                            </div>
                            <span>•</span>
                            <span>SSL Encrypted</span>
                            <span>•</span>
                            <span>Money Back Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
