import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
// import Modal from '@/components/modal';
import { formatDate } from '@/components/date';
import { type BreadcrumbItem } from '@/types';

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

export default function Index({ cards }: Props) {
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

            // Auto close after 5 seconds
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

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-800">Cards</h2>
                    <Link href={route('cards.create')} className="btn btn-primary rounded-lg px-6 py-2 shadow-sm transition-all hover:shadow-md">
                        Create New Card
                    </Link>
                </div>

                <div className="rounded-lg bg-white shadow-sm">
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Template</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Progress</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Expiry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cards.data.map((card) => (
                                        <tr key={card.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">{card.customer.name}</td>
                                            <td className="px-4 py-4">{card.customer.phone}</td>
                                            <td className="px-4 py-4">{card.template.name}</td>
                                            <td className="px-4 py-4">
                                                <div className="h-4 w-full rounded-full bg-gray-100">
                                                    <div
                                                        className="bg-primary flex h-full items-center justify-center rounded-full text-xs font-medium text-white transition-all duration-300"
                                                        style={{
                                                            width: `${Math.max((card.current_stamps / card.template.total_stamps) * 100, 5)}%`,
                                                        }}
                                                    >
                                                        {card.current_stamps} / {card.template.total_stamps}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {card.completed ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="space-x-2 px-4 py-4">
                                                {!card.completed && (
                                                    <form
                                                        onSubmit={(e) => handleStamp(e, card.current_stamps + 1, card.template.rewards)}
                                                        action={route('cards.stamp', card.id)}
                                                        className="inline-block"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                                                        >
                                                            Add Stamp
                                                        </button>
                                                    </form>
                                                )}
                                                <Link
                                                    href={route('customers.show', card.customer.id)}
                                                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4">
                                                {card.expiry_date ? (
                                                    new Date(card.expiry_date) < new Date() ? (
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                            Expires {formatDate(card.expiry_date)}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                        No Expiry
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* <Modal
                show={rewardModal.show}
                onClose={() => {
                    if (rewardModal.formToSubmit) {
                        submitStamp(rewardModal.formToSubmit);
                    }
                    setRewardModal({ show: false, message: '', formToSubmit: null });
                }}
            >
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Reward Unlocked! 🎉</h3>
                    <p className="text-gray-600">{rewardModal.message}</p>
                </div>
            </Modal> */}
        </AppLayout>
    );
}
