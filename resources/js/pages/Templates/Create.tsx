import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Props {
    template?: {
        id: number;
        name: string;
        total_stamps: number;
        has_expiration: boolean;
        validity_days: number | null;
        rewards: {
            stamp_number: number;
            reward_description: string;
            is_final_reward: boolean;
        }[];
    };
}

export default function Create({ template }: Props) {
    const isEditing = !!template;
    const [hasExpiration, setHasExpiration] = useState(template?.has_expiration ?? false);
    const [totalStamps, setTotalStamps] = useState(template?.total_stamps ?? 5);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Templates',
            href: '/templates',
        },
        {
            title: isEditing ? 'Edit' : 'Create',
            href: isEditing ? `/templates/${template.id}/edit` : '/templates/create',
        },
    ];

    // Transform rewards array to object format for the form
    const initialRewards = template?.rewards?.reduce((acc, reward) => ({
        ...acc,
        [reward.stamp_number]: {
            description: reward.reward_description,
            is_final: reward.is_final_reward,
        },
    }), {}) ?? {};

    const { data, setData, post, put, processing, errors } = useForm({
        name: template?.name ?? '',
        total_stamps: template?.total_stamps ?? 5,
        has_expiration: template?.has_expiration ?? false,
        validity_days: template?.validity_days?.toString() ?? '',
        rewards: initialRewards,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('templates.update', template.id));
        } else {
            post(route('templates.store'));
        }
    };

    const updateProgressBar = (value: number) => {
        return (value / 15) * 100;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${isEditing ? 'Edit' : 'Create'} Template`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="card shadow-sm">
                    <div className="card-header text-xl font-semibold p-4">
                        {isEditing ? 'Edit' : 'Create'} Template
                    </div>

                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            {/* Template Name */}
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Template Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full rounded-lg border ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    } p-2`}
                                    placeholder="Template Name"
                                    required
                                />
                                {errors.name && (
                                    <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                                )}
                            </div>

                            {/* Total Stamps */}
                            <div className="mb-4">
                                <div className="flex items-center mb-2">
                                    <label htmlFor="total_stamps" className="block text-sm font-medium mr-3">
                                        Total Stamps
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            id="total_stamps"
                                            value={data.total_stamps}
                                            onChange={e => {
                                                const value = parseInt(e.target.value);
                                                setData('total_stamps', value);
                                                setTotalStamps(value);
                                            }}
                                            className="w-20 rounded-lg border border-gray-300 p-2"
                                            min="1"
                                            max="15"
                                            required
                                        />
                                        <span className="ml-2">/15</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${updateProgressBar(totalStamps)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Card Expiration */}
                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="hasExpiration"
                                        checked={data.has_expiration}
                                        onChange={e => {
                                            setData('has_expiration', e.target.checked);
                                            setHasExpiration(e.target.checked);
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="hasExpiration" className="ml-2 text-sm font-medium">
                                        Activate Card Expiration
                                    </label>
                                </div>

                                {hasExpiration && (
                                    <div className="mt-3">
                                        <label htmlFor="validity_days" className="block text-sm font-medium mb-1">
                                            Card Validity (Days)
                                        </label>
                                        <input
                                            type="number"
                                            id="validity_days"
                                            value={data.validity_days}
                                            onChange={e => setData('validity_days', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 p-2"
                                            min="1"
                                            required
                                            placeholder="Enter number of days"
                                        />
                                        <small className="text-gray-500">
                                            Cards will expire after these many days from creation date
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Rewards */}
                            <div className="mt-4 space-y-4">
                                {[...Array(totalStamps)].map((_, index) => {
                                    const stampNumber = index + 1;
                                    return (
                                        <div key={stampNumber} className="card border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h6 className="font-medium">Reward for Stamp #{stampNumber}</h6>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`finalReward${stampNumber}`}
                                                        checked={data.rewards[stampNumber]?.is_final ?? false}
                                                        onChange={e => {
                                                            setData('rewards', {
                                                                ...data.rewards,
                                                                [stampNumber]: {
                                                                    description: data.rewards[stampNumber]?.description ?? '',
                                                                    is_final: e.target.checked,
                                                                },
                                                            });
                                                        }}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <label
                                                        htmlFor={`finalReward${stampNumber}`}
                                                        className="ml-2 text-sm"
                                                    >
                                                        Mark as Final
                                                    </label>
                                                </div>
                                            </div>
                                            <textarea
                                                value={data.rewards[stampNumber]?.description ?? ''}
                                                onChange={e => {
                                                    setData('rewards', {
                                                        ...data.rewards,
                                                        [stampNumber]: {
                                                            description: e.target.value,
                                                            is_final: data.rewards[stampNumber]?.is_final ?? false,
                                                        },
                                                    });
                                                }}
                                                className="w-full rounded-lg border border-gray-300 p-2"
                                                rows={3}
                                                placeholder="Enter reward description"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Submit Button */}
                            <div className="sticky bottom-0 bg-white p-4 mt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary text-white rounded-full py-3 flex justify-center items-center hover:bg-primary/90 transition-colors"
                                >
                                    {isEditing ? 'Update' : 'Create'} Card
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}