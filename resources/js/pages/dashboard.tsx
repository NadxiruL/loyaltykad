import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    CreditCardIcon,
    UsersIcon,
    DocumentDuplicateIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ChartBarIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    totalCards: number;
    totalCustomers: number;
    totalTemplates: number;
    activeCards: number;
    expiredCards: number;
    completedCards: number;
    recentCards: number;
    expiringSoon: number;
}

interface MonthlyStats {
    month: string;
    count: number;
}

interface TopTemplate {
    name: string;
    count: number;
    total_stamps: number;
}

interface RecentActivity {
    id: number;
    customer_name: string;
    customer_phone: string;
    template_name: string;
    current_stamps: number;
    total_stamps: number;
    created_at: string;
    status: 'active' | 'completed' | 'expired' | 'expiring_soon';
}

interface Props {
    stats: DashboardStats;
    monthlyStats: MonthlyStats[];
    topTemplates: TopTemplate[];
    recentActivity: RecentActivity[];
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    color = 'blue',
    subtitle
}: {
    title: string;
    value: number;
    icon: any;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    subtitle?: string;
}) => {
    const colorClasses = {
        blue: 'border-sidebar-border/70 dark:border-sidebar-border bg-blue-50/50 dark:bg-blue-950/20',
        green: 'border-sidebar-border/70 dark:border-sidebar-border bg-green-50/50 dark:bg-green-950/20',
        yellow: 'border-sidebar-border/70 dark:border-sidebar-border bg-yellow-50/50 dark:bg-yellow-950/20',
        red: 'border-sidebar-border/70 dark:border-sidebar-border bg-red-50/50 dark:bg-red-950/20',
        purple: 'border-sidebar-border/70 dark:border-sidebar-border bg-purple-50/50 dark:bg-purple-950/20',
        indigo: 'border-sidebar-border/70 dark:border-sidebar-border bg-indigo-50/50 dark:bg-indigo-950/20'
    };

    const iconColors = {
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        yellow: 'text-yellow-600 dark:text-yellow-400',
        red: 'text-red-600 dark:text-red-400',
        purple: 'text-purple-600 dark:text-purple-400',
        indigo: 'text-indigo-600 dark:text-indigo-400'
    };

    return (
        <div className={`relative overflow-hidden rounded-xl border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value.toLocaleString()}</p>
                    {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">{subtitle}</p>}
                </div>
                <Icon className={`h-8 w-8 ${iconColors[color]}`} />
            </div>
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
        </div>
    );
};

const getStatusBadge = (status: string) => {
    const badges = {
        active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        expiring_soon: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };

    const labels = {
        active: 'Active',
        completed: 'Completed',
        expired: 'Expired',
        expiring_soon: 'Expiring Soon'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
};

export default function Dashboard({ stats, monthlyStats, topTemplates, recentActivity }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Grid */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <StatCard
                        title="Total Cards"
                        value={stats.totalCards}
                        icon={CreditCardIcon}
                        color="blue"
                        subtitle={`${stats.recentCards} new this week`}
                    />
                    <StatCard
                        title="Total Customers"
                        value={stats.totalCustomers}
                        icon={UsersIcon}
                        color="green"
                    />
                    <StatCard
                        title="Active Cards"
                        value={stats.activeCards}
                        icon={CheckCircleIcon}
                        color="indigo"
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <StatCard
                        title="Completed Cards"
                        value={stats.completedCards}
                        icon={ChartBarIcon}
                        color="purple"
                    />
                    <StatCard
                        title="Card Templates"
                        value={stats.totalTemplates}
                        icon={DocumentDuplicateIcon}
                        color="blue"
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={stats.expiringSoon}
                        icon={ExclamationTriangleIcon}
                        color="yellow"
                        subtitle="Next 7 days"
                    />
                    <StatCard
                        title="Expired Cards"
                        value={stats.expiredCards}
                        icon={ClockIcon}
                        color="red"
                    />
                </div>

                {/* Charts and Tables */}
                <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                    {/* Monthly Growth Chart */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="relative z-10 p-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Monthly Card Creation</h3>
                            <div className="space-y-3">
                                {monthlyStats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">{stat.month}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.max((stat.count / Math.max(...monthlyStats.map(s => s.count))) * 100, 5)}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 w-8 text-right">
                                                {stat.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    {/* Top Templates */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="relative z-10 p-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Popular Templates</h3>
                            <div className="space-y-4">
                                {topTemplates.map((template, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{template.name}</p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{template.total_stamps} stamps required</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{template.count}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">cards</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                    <div className="relative z-10">
                        <div className="border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recent Activity</h3>
                        </div>
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="px-6 py-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{activity.customer_name}</p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{activity.customer_phone}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                                                <span className="truncate">{activity.template_name}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="whitespace-nowrap">{activity.current_stamps}/{activity.total_stamps} stamps</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="whitespace-nowrap">{activity.created_at}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 ml-4">
                                            {getStatusBadge(activity.status)}
                                            <div className="text-right hidden sm:block">
                                                <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.min((activity.current_stamps / activity.total_stamps) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                                    {Math.round((activity.current_stamps / activity.total_stamps) * 100)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="px-6 py-8 text-center">
                                    <CalendarIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
                                    <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No recent activity</h3>
                                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                                        Start creating loyalty cards to see activity here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                </div>

                {/* Quick Actions */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            <a
                                href={route('cards.create')}
                                className="flex items-center justify-center space-x-2 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                            >
                                <CreditCardIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Create New Card</span>
                            </a>
                            <a
                                href={route('customers.create')}
                                className="flex items-center justify-center space-x-2 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 p-4 text-center hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
                            >
                                <UsersIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Add Customer</span>
                            </a>
                            <a
                                href={route('templates.create')}
                                className="flex items-center justify-center space-x-2 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 p-4 text-center hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                            >
                                <DocumentDuplicateIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Create Template</span>
                            </a>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                </div>
            </div>
        </AppLayout>
    );
}
