import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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



export default function Index({ customers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Customers</h2>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Active Cards</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">{customer.name}</td>
                                            <td className="px-4 py-4">{customer.phone}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

                        {customers.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Page {customers.current_page} of {customers.last_page}
                                </div>
                                <div className="space-x-2">
                                    {customers.links.map((link: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
