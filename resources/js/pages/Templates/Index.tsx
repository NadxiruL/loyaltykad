import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
        // links: any;
    };
    hasActiveSubscription: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Templates',
        href: '/templates',
    },
];

export default function Index({ templates, hasActiveSubscription }: Props) {
    const handleDelete = (templateId: number) => {
        if (confirm('Are you sure?')) {
            router.delete(route('templates.destroy', templateId));
        }
    };

    if (!hasActiveSubscription) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Templates" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="text-center">
                        <h4>You have no active subscriptions. Please consider to subscribe or renew your subscription to use this feature.</h4>
                        <Link href={route('upgrade.index')} className="btn btn-primary">
                            Upgrade
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Templates" />
            {/* <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <Link href={route('templates.create')} className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white">
                        Create Template
                    </Link>
                </div> */}

                <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-800">Templates</h2>
                    <Link href={route('templates.create')} className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white">
                        Create Template
                    </Link>
                </div>

                {templates.data.length === 0 ? (
                    <div className="py-8 text-center">No templates found, please create a template.</div>
                ) : (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {templates.data.map((template) => (
                            <div
                                key={template.id}
                                className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4"
                            >
                                <h5 className="mb-2 text-lg font-medium">{template.name}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Stamps: {template.total_stamps}</p>

                                <div className="mt-4 space-y-2">
                                    {template.rewards.map((reward) => (
                                        <div key={reward.stamp_number} className="rounded bg-gray-50 p-2 text-sm dark:bg-gray-800/50">
                                            Stamp #{reward.stamp_number}: {reward.reward_description}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={route('templates.edit', template.id)}
                                        className="bg-primary/10 text-primary hover:bg-primary/20 rounded px-3 py-1.5"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="rounded bg-red-500/10 px-3 py-1.5 text-red-500 hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
