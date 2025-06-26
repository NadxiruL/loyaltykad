import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/components/date';

interface Template {
    id: number;
    name: string;
    total_stamps: number;
    rewards: {
        stamp_number: number;
        reward_description: string;
    }[];
}

interface Props {
    templates: {
        data: Template[];
    };
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
        title: 'Templates',
        href: '/templates',
    },
];

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

export default function Index({ templates }: Props) {
    const { auth } = usePage().props as { auth: { user: User } };

    const handleDelete = (templateId: number) => {
        if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            router.delete(route('templates.destroy', templateId));
        }
    };

    if (!auth.user.has_valid_subscription) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Templates" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="text-center py-12">
                        <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            Subscription Required
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                            {auth.user.subscription_expiry_date
                                ? `Your subscription expired on ${formatDate(auth.user.subscription_expiry_date)}. Please renew to continue using this feature.`
                                : 'You need an active subscription to access templates. Please subscribe to continue.'
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Templates" />

            <div className="container mx-auto px-4 py-6">
                <SubscriptionWarning user={auth.user} />

                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Templates</h2>
                    <Link
                        href={route('templates.create')}
                        className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-white font-medium transition-colors shadow-sm hover:shadow-md"
                    >
                        Create Template
                    </Link>
                </div>

                {templates.data.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="px-6 py-12 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
                            <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No templates found</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                                Create your first loyalty card template to get started.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('templates.create')}
                                    className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Create Template
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.data.map((template) => (
                            <div
                                key={template.id}
                                className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                                            {template.name}
                                        </h5>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Total Stamps: <span className="font-medium">{template.total_stamps}</span>
                                        </p>
                                    </div>

                                    {template.rewards && template.rewards.length > 0 && (
                                        <div className="space-y-2">
                                            <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Rewards ({template.rewards.length})
                                            </h6>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {template.rewards.map((reward) => (
                                                    <div
                                                        key={reward.stamp_number}
                                                        className="rounded bg-neutral-50 p-2 text-sm dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                                                    >
                                                        <span className="font-medium text-primary">
                                                            Stamp #{reward.stamp_number}:
                                                        </span>
                                                        <span className="ml-1 text-neutral-700 dark:text-neutral-300">
                                                            {reward.reward_description}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                        <Link
                                            href={route('templates.edit', template.id)}
                                            className="flex-1 text-center bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="flex-1 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
