import { Package } from '@/types';
import { useForm } from '@inertiajs/react';

interface Props {
    package: Package;
}

export default function Show({ package: pkg }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        package_id: pkg.id,
        payment_provider: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('upgrade.store'), {
            onSuccess: () => {
                // The redirect to order.pay will happen via Inertia::location()
            },
            onError: (err) => {
                console.error('Form submission error:', err);
            },
        });
    };

    const breadcrumbs = [
        { title: 'Upgrade', href: '/upgrade' },
        { title: pkg.name, href: `/upgrade/${pkg.id}` },
    ];

    return (
        <div className="mx-auto max-w-3xl py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">{pkg.name}</h1>
            <div className="mt-6">
                <h2 className="text-xl font-semibold">Package Details</h2>
                <p className="mt-2">{pkg.description}</p>
                <p className="mt-2 text-2xl">RM{pkg.price}/month</p>

                <form onSubmit={handleSubmit} className="mt-8">
                    <div className="mb-4">
                        <label className="mb-2 block">Select Payment Method</label>
                        <select
                            value={data.payment_provider}
                            onChange={(e) => setData('payment_provider', e.target.value)}
                            className="w-full rounded-md border p-2"
                        >
                            <option value="">Select a payment method</option>
                            <option value="chip">Chip</option>
                        </select>
                        {errors.payment_provider && <p className="mt-1 text-sm text-red-500">{errors.payment_provider}</p>}
                    </div>

                    <button type="submit" disabled={processing} className="w-full rounded-md bg-blue-600 py-2 text-white">
                        {processing ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
}
