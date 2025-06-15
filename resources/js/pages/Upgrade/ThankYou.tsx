import React from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ThankYouProps {
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  message: string;
  order?: {
    reference_id: string;
    total_amount: number;
    package?: {
      name: string;
    }
  };
  subscription?: {
    start_date: string;
    end_date: string;
  };
}


export default function ThankYou({ status, message, order, subscription }: ThankYouProps) {
  const renderStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-16 w-16 text-orange-500" />;
      case 'pending':
      default:
        return <ClockIcon className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'cancelled':
        return 'bg-orange-50 border-orange-200';
      case 'pending':
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      case 'pending':
      default:
        return 'Payment Processing';
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  return (
    <div className="py-12">
      <Head title="Payment Result" />

      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className={`p-6 border-b ${getStatusColor()}`}>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                {renderStatusIcon()}
              </div>

              <h2 className="text-2xl font-bold mb-2">{getStatusTitle()}</h2>

              <p className="text-gray-600 mb-6">{message}</p>

              {order && (
                <div className="w-full max-w-md mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Order Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference ID:</span>
                        <span className="font-medium">{order.reference_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium">{order.package?.name || 'Basic Package'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">RM {formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {status === 'success' && subscription && (
                <div className="w-full max-w-md mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Subscription Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{subscription.start_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid Until:</span>
                        <span className="font-medium">{subscription.end_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mt-2">
                {status === 'failed' || status === 'cancelled' ? (
                  <a
                    href="/upgrade"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </a>
                ) : null}

                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
