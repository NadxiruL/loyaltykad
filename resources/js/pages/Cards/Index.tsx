import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/components/date';
import { type BreadcrumbItem } from '@/types';
import {
    CreditCardIcon,
    UserIcon,
    PhoneIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    EyeIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

interface Card {
    id: number;
    customer: {
        id: number;
        name: string;
        phone: string;
    };
    template: {
        name: string;
        total_stamps: number;
        rewards: {
            stamp_number: number;
            reward_description: string;
        }[];
    };
    current_stamps: number;
    completed: boolean;
    expiry_date: string | null;
}

interface User {
    has_active_subscription: boolean;
    has_valid_subscription: boolean;
    subscription_expiry_date: string | null;
    subscription_days_remaining: number | null;
    is_subscription_expiring_soon: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cards',
        href: '/cards',
    },
];

interface Props {
    cards: {
        data: Card[];
        links: any;
    };
}

const getStatusInfo = (card: Card) => {
    if (card.completed) {
        return {
            label: 'Completed',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            icon: CheckCircleIcon
        };
    }

    if (card.expiry_date) {
        const isExpired = new Date(card.expiry_date) < new Date();
        if (isExpired) {
            return {
                label: 'Expired',
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                icon: ExclamationTriangleIcon
            };
        }

        const daysUntilExpiry = Math.ceil((new Date(card.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7) {
            return {
                label: `Expires ${formatDate(card.expiry_date)}`,
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                icon: ClockIcon
            };
        }

        return {
            label: `Expires ${formatDate(card.expiry_date)}`,
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            icon: CalendarIcon
        };
    }

    return {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        icon: CheckCircleIcon
    };
};

const SubscriptionWarning = ({ user }: { user: User }) => {
    if (!user.has_valid_subscription) {
        return null;
    }

    if (user.is_subscription_expiring_soon && user.subscription_days_remaining !== null) {
        return (
            <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Subscription Expiring Soon
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Your subscription will expire in {user.subscription_days_remaining} day{user.subscription_days_remaining !== 1 ? 's' : ''}
                            {user.subscription_expiry_date && ` on ${formatDate(user.subscription_expiry_date)}`}.
                        </p>
                    </div>
                    <Link
                        href={route('upgrade.index')}
                        className="ml-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium transition-colors dark:bg-yellow-800 dark:hover:bg-yellow-700 dark:text-yellow-100"
                    >
                        Renew Now
                    </Link>
                </div>
            </div>
        );
    }

    return null;
};

const CardItem = ({
    card,
    onStamp
}: {
    card: Card;
    onStamp: (e: React.FormEvent<HTMLFormElement>, nextStamp: number, rewards: Card['template']['rewards']) => void;
}) => {
    const statusInfo = getStatusInfo(card);
    const StatusIcon = statusInfo.icon;
    const progressPercentage = Math.max((card.current_stamps / card.template.total_stamps) * 100, 5);

    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
            <div className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <UserIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{card.customer.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <PhoneIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">{card.customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DocumentTextIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{card.template.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                        <StatusIcon className="h-4 w-4" />
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {card.current_stamps} / {card.template.total_stamps}
                        </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300 flex items-center justify-center"
                            style={{ width: `${progressPercentage}%` }}
                        >
                            {progressPercentage > 20 && (
                                <span className="text-xs font-medium text-white px-1">
                                    {Math.round(progressPercentage)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                    {!card.completed && (
                        <form
                            onSubmit={(e) => onStamp(e, card.current_stamps + 1, card.template.rewards)}
                            action={route('cards.stamp', card.id)}
                            className="flex-1"
                        >
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center space-x-1 bg-primary hover:bg-primary-dark rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Add Stamp</span>
                            </button>
                        </form>
                    )}
                    <Link
                        href={route('customers.show', card.customer.id)}
                        className="flex-1 inline-flex items-center justify-center space-x-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                        <EyeIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function Index({ cards }: Props) {

    const { props } = usePage();
    const auth = props.auth as { user: User };
    const [rewardModal, setRewardModal] = useState<{
        show: boolean;
        message: string;
        formToSubmit: null | HTMLFormElement;
    }>({
        show: false,
        message: '',
        formToSubmit: null,
    });

    const { post } = useForm();

    if (!auth.user.has_valid_subscription) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Cards" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="text-center py-12">
                        <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            Subscription Required
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                            {auth.user.subscription_expiry_date
                                ? `Your subscription expired on ${formatDate(auth.user.subscription_expiry_date)}. Please renew to continue using this feature.`
                                : 'You need an active subscription to access loyalty cards. Please subscribe to continue.'
                            }
                        </p>
                        <Link
                            href={route('upgrade.index')}
                            className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {auth.user.subscription_expiry_date ? 'Renew Subscription' : 'Subscribe Now'}
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const checkReward = (nextStamp: number, rewards: Card['template']['rewards'], form: HTMLFormElement) => {
        if (!rewards || !Array.isArray(rewards)) {
            submitStamp(form);
            return;
        }

        const reward = rewards.find((r) => r.stamp_number === nextStamp);

        if (reward) {
            setRewardModal({
                show: true,
                message: reward.reward_description,
                formToSubmit: form,
            });


            setTimeout(() => {
                setRewardModal((prev) => {
                    if (prev.show) {
                        submitStamp(form);
                    }
                    return { show: false, message: '', formToSubmit: null };
                });
            }, 5000);
        } else {
            submitStamp(form);
        }
    };

    const submitStamp = (form: HTMLFormElement) => {
        const url = form.action;
        post(url);
    };

    const handleStamp = (e: React.FormEvent<HTMLFormElement>, nextStamp: number, rewards: Card['template']['rewards']) => {
        e.preventDefault();
        checkReward(nextStamp, rewards, e.currentTarget);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cards" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <SubscriptionWarning user={auth.user} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Cards</h2>
                    <Link
                        href={route('cards.create')}
                        className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
                    >
                        <span>Create New Card</span>
                    </Link>
                </div>


                <div className="grid gap-4 sm:hidden">
                    {cards.data.map((card) => (
                        <CardItem key={card.id} card={card} onStamp={handleStamp} />
                    ))}
                </div>


                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border hidden sm:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50/50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Template</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Progress</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {cards.data.map((card) => {
                                    const statusInfo = getStatusInfo(card);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={card.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                            <td className="px-4 py-4 text-neutral-900 dark:text-neutral-100">{card.customer.name}</td>
                                            <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">{card.customer.phone}</td>
                                            <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">{card.template.name}</td>
                                            <td className="px-4 py-4">
                                                <div className="w-full max-w-xs">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-neutral-600 dark:text-neutral-400">
                                                            {card.current_stamps} / {card.template.total_stamps}
                                                        </span>
                                                        <span className="text-neutral-600 dark:text-neutral-400">
                                                            {Math.round((card.current_stamps / card.template.total_stamps) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.max((card.current_stamps / card.template.total_stamps) * 100, 5)}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center space-x-1">
                                                    <StatusIcon className="h-4 w-4" />
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex space-x-2">
                                                    {!card.completed && (
                                                        <form
                                                            onSubmit={(e) => handleStamp(e, card.current_stamps + 1, card.template.rewards)}
                                                            action={route('cards.stamp', card.id)}
                                                            className="inline-block"
                                                        >
                                                            <button
                                                                type="submit"
                                                                className="bg-primary hover:bg-primary-dark rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
                                                            >
                                                                Add Stamp
                                                            </button>
                                                        </form>
                                                    )}
                                                    <Link
                                                        href={route('customers.show', card.customer.id)}
                                                        className="rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>


                {cards.data.length === 0 && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="px-6 py-12 text-center">
                            <CreditCardIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
                            <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No cards found</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                                Start by creating your first loyalty card.
                            </p>
                        </div>
                    </div>
                )}


                {cards.links && cards.links.length > 3 && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            {cards.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
                                            ? 'bg-primary text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {rewardModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md mx-4">
                            <div className="text-center">
                                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                                    Reward Unlocked!
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    {rewardModal.message}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                                    This will close automatically in a few seconds...
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );

}
