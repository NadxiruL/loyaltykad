import { Package } from '@/types';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Props {
    packages: Package[];
}

export default function Index({ packages }: Props) {
    const breadcrumbs = [
        {
            title: 'Upgrade',
            href: '/upgrade',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upgrade" />
            <div className="mx-auto max-w-7xl py-12 sm:px-12 lg:px-12">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="rounded-lg border p-12">
                            <h2 className="text-3xl font-bold">{pkg.name}</h2>
                            <p className="mt-4 text-2xl">RM{pkg.price}/month</p>
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold">Features:</h3>
                                <ul className="mt-4 space-y-3">
                                    {Array.isArray(pkg.features)
                                        ? pkg.features.map((feature, index) => <li key={index} className="text-lg">{feature}</li>)
                                        : JSON.parse(pkg.features as unknown as string).map((feature: string, index: number) => (
                                              <li key={index} className="text-lg">{feature}</li>
                                          ))}
                                </ul>
                            </div>
                            <Link href={`/upgrade/${pkg.id}`} className="mt-12 block w-full rounded-md bg-blue-600 py-4 text-center text-lg text-white hover:bg-blue-700 transition-colors">
                                Select Plan
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
