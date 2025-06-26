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
    const [activeRewardTab, setActiveRewardTab] = useState(1);
    const [showRewardsModal, setShowRewardsModal] = useState(false);

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

    const getRewardStatus = (stampNumber: number) => {
        const reward = data.rewards[stampNumber];
        if (!reward?.description) return 'empty';
        if (reward.is_final) return 'final';
        return 'filled';
    };

    const getRewardCount = () => {
        const filled = Object.keys(data.rewards).filter(key => data.rewards[key]?.description).length;
        return `${filled}/${totalStamps}`;
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
                                                setActiveRewardTab(1);
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
                            <div className="mb-6">
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

                            {/* Rewards Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium">Rewards Configuration</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">
                                            Completed: {getRewardCount()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowRewardsModal(true)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Manage All Rewards
                                        </button>
                                    </div>
                                </div>

                                {/* Rewards Grid Preview */}
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {[...Array(totalStamps)].map((_, index) => {
                                        const stampNumber = index + 1;
                                        const status = getRewardStatus(stampNumber);
                                        return (
                                            <button
                                                key={stampNumber}
                                                type="button"
                                                onClick={() => setActiveRewardTab(stampNumber)}
                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                                    activeRewardTab === stampNumber
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : status === 'final'
                                                        ? 'border-green-500 bg-green-50'
                                                        : status === 'filled'
                                                        ? 'border-gray-400 bg-gray-50'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="text-xs text-gray-500 mb-1">Stamp</div>
                                                <div className="font-bold">{stampNumber}</div>
                                                {status === 'final' && (
                                                    <div className="text-xs text-green-600 mt-1">★ Final</div>
                                                )}
                                                {status === 'filled' && (
                                                    <div className="text-xs text-gray-600 mt-1">✓</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Reward Editor */}
                                <div className="card border rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-3">
                                        <h6 className="font-medium">Reward for Stamp #{activeRewardTab}</h6>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`finalReward${activeRewardTab}`}
                                                checked={data.rewards[activeRewardTab]?.is_final ?? false}
                                                onChange={e => {
                                                    setData('rewards', {
                                                        ...data.rewards,
                                                        [activeRewardTab]: {
                                                            description: data.rewards[activeRewardTab]?.description ?? '',
                                                            is_final: e.target.checked,
                                                        },
                                                    });
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                            <label
                                                htmlFor={`finalReward${activeRewardTab}`}
                                                className="ml-2 text-sm"
                                            >
                                                Mark as Final
                                            </label>
                                        </div>
                                    </div>
                                    <textarea
                                        value={data.rewards[activeRewardTab]?.description ?? ''}
                                        onChange={e => {
                                            setData('rewards', {
                                                ...data.rewards,
                                                [activeRewardTab]: {
                                                    description: e.target.value,
                                                    is_final: data.rewards[activeRewardTab]?.is_final ?? false,
                                                },
                                            });
                                        }}
                                        className="w-full rounded-lg border border-gray-300 p-3"
                                        rows={4}
                                        placeholder="Enter reward description"
                                    />
                                    <div className="flex justify-between mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setActiveRewardTab(Math.max(1, activeRewardTab - 1))}
                                            disabled={activeRewardTab === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                                        >
                                            ← Previous
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveRewardTab(Math.min(totalStamps, activeRewardTab + 1))}
                                            disabled={activeRewardTab === totalStamps}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="sticky bottom-0 bg-white p-4 mt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary text-white rounded-full py-3 flex justify-center items-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : (isEditing ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Rewards Management Modal */}
            {showRewardsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Manage All Rewards</h3>
                            <button
                                type="button"
                                onClick={() => setShowRewardsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid md:grid-cols-2 gap-4">
                                {[...Array(totalStamps)].map((_, index) => {
                                    const stampNumber = index + 1;
                                    return (
                                        <div key={stampNumber} className="card border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h6 className="font-medium">Stamp #{stampNumber}</h6>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`modalFinalReward${stampNumber}`}
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
                                                        htmlFor={`modalFinalReward${stampNumber}`}
                                                        className="ml-2 text-sm"
                                                    >
                                                        Final
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
                        </div>
                        <div className="p-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowRewardsModal(false)}
                                className="w-full bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
