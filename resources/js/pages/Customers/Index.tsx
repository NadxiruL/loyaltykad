import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { UsersIcon, PhoneIcon, CreditCardIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Customer {
    id: number;
    name: string;
    phone: string;
    cards_count: number;
    active_cards: number;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

interface Props {
    customers: {
        data: Customer[];
        links: any;
        current_page: number;
        last_page: number;
    };
}

const CustomerCard = ({ customer }: { customer: Customer }) => (
    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                    <UsersIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{customer.name}</h3>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                    <PhoneIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                    <CreditCardIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {customer.active_cards} / {customer.cards_count} active
                    </span>
                </div>
            </div>
        </div>
        <div className="flex justify-end">
            <Link
                href={route('customers.show', customer.id)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
                <EyeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">View Cards</span>
                <span className="sm:hidden">View</span>
            </Link>
        </div>
    </div>
);

export default function Index({ customers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Customers</h2>
                </div>

                {/* Mobile Card View */}
                <div className="grid gap-4 sm:hidden">
                    {customers.data.map((customer) => (
                        <CustomerCard key={customer.id} customer={customer} />
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border hidden sm:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50/50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Active Cards</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                        <td className="px-4 py-4 text-neutral-900 dark:text-neutral-100">{customer.name}</td>
                                        <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">{customer.phone}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {customer.active_cards} / {customer.cards_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                href={route('customers.show', customer.id)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                                            >
                                                View Cards
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {customers.data.length === 0 && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="px-6 py-12 text-center">
                            <UsersIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
                            <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No customers found</h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                                Start by creating your first customer.
                            </p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {customers.last_page > 1 && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-neutral-500 dark:text-neutral-500">
                                Page {customers.current_page} of {customers.last_page}
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {customers.links.map((link: any, i: number) => (
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
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
