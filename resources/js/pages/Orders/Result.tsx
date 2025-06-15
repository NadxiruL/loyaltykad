import { Head, Link } from '@inertiajs/react';

interface Props {
    status: 'success' | 'failed';
    message: string;
}

export default function Result({ status, message }: Props) {
    return (
        <div>
            <Head title={`Payment ${status}`} />
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="text-center">
                    {status === 'success' ? (
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">Payment Successful!</h2>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">Payment Failed</h2>
                        </div>
                    )}
                    <p className="mt-2 text-gray-600">{message}</p>
                    <Link href={route('dashboard')} className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
