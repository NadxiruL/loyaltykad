import AppLayout from '@/layouts/app-layout';
import { Switch } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Template {
    id: number;
    name: string;
    total_stamps: number;
    has_expiration: boolean;
    validity_days: number;
}

interface Props {
    templates: Template[];
    customers: {
        id: number;
        name: string;
        phone: string;
    }[];
    card?: {
        id: number;
        customer: {
            name: string;
            phone: string;
        };
        template_id: number;
        start_date: string;
        expiry_date: string;
    };
}

export default function Create({ templates, customers, card }: Props) {
    const isEditing = !!card;
    const today = new Date().toISOString().split('T')[0];
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [query, setQuery] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        phone: card?.customer.phone ?? '',
        name: card?.customer.name ?? '',
        template_id: card?.template_id ?? '',
        start_date: card?.start_date ?? today,
        expiry_date: card?.expiry_date ?? '',
    });

    const calculateExpiryDate = (startDate: string, validityDays: number) => {
        if (!startDate || !validityDays) return '';
        const date = new Date(startDate);
        date.setDate(date.getDate() + validityDays);
        return date.toISOString().split('T')[0];
    };

    const fetchTemplate = async (templateId: string) => {
        try {
            const template = templates.find((t) => t.id === parseInt(templateId));
            if (template) {
                setSelectedTemplate(template);
                if (template.has_expiration) {
                    setData('expiry_date', calculateExpiryDate(data.start_date, template.validity_days));
                }
            }
        } catch (error) {
            console.error('Failed to load template:', error);
        }
    };

    useEffect(() => {
        if (data.template_id) {
            fetchTemplate(data.template_id);
        }
    }, [data.template_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            ...data,
            is_existing_customer: isExistingCustomer,
        };

        if (isEditing) {
            put(route('cards.update', card.id), formData);
        } else {
            post(route('cards.store'), formData);
        }
    };

    const handlePhoneChange = (phone: string) => {
        if (phone === 'new') {
            setIsExistingCustomer(true);
            setData((data) => ({
                ...data,
                phone: '',
                name: '',
            }));
        } else {
            setIsExistingCustomer(false);
            const selectedCustomer = customers.find((c) => c.phone === phone);
            setData((data) => ({
                ...data,
                phone: phone,
                name: selectedCustomer ? selectedCustomer.name : '',
            }));
        }
    };

    const handleNewPhoneInput = (value: string) => {
        setData((data) => ({
            ...data,
            phone: value,
        }));
    };

    const filteredCustomers =
        query === ''
            ? customers
            : customers.filter((customer) => {
                  const searchStr = `${customer.phone} ${customer.name}`.toLowerCase();
                  return searchStr.includes(query.toLowerCase());
              });

    const PhoneNumberInput = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <Switch.Group>
                    <div className="flex items-center">
                        <Switch.Label className="mr-3 text-sm text-gray-600">Existing Customer</Switch.Label>
                        <Switch
                            checked={isExistingCustomer}
                            onChange={(checked) => {
                                setIsExistingCustomer(checked);
                                if (!checked) {
                                    setData((data) => ({
                                        ...data,
                                        phone: '',
                                        name: '',
                                    }));
                                }
                            }}
                            className={`${
                                isExistingCustomer ? 'bg-primary' : 'bg-gray-200'
                            } focus:ring-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none`}
                        >
                            <span
                                className={`${
                                    isExistingCustomer ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>
                </Switch.Group>
            </div>

            {isExistingCustomer ? (
                <select
                    value={data.phone}
                    onChange={(e) => {
                        const selectedCustomer = customers.find((c) => c.phone === e.target.value);
                        setData((data) => ({
                            ...data,
                            phone: e.target.value,
                            name: selectedCustomer?.name || '',
                        }));
                    }}
                    className={`w-full rounded-lg border px-4 py-2 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none`}
                    required
                >
                    <option value="">Select existing customer</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.phone}>
                            {customer.phone} - {customer.name}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="space-y-4">
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) =>
                            setData((data) => ({
                                ...data,
                                phone: e.target.value,
                            }))
                        }
                        placeholder="Enter phone number"
                        className={`w-full rounded-lg border px-4 py-2 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none`}
                        required
                    />
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Customer Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) =>
                                setData((data) => ({
                                    ...data,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Enter customer name"
                            className={`w-full rounded-lg border px-4 py-2 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none`}
                            required
                        />
                    </div>
                </div>
            )}
            {errors.phone && <div className="mt-1 text-sm text-red-600">{errors.phone}</div>}
        </div>
    );

    return (
        <AppLayout>
            <Head title={`${isEditing ? 'Edit' : 'Create'} Loyalty Card`} />

            <div className="container mx-auto px-4 py-6">
                <div className="rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit' : 'Create'} Card</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <PhoneNumberInput />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Select Card Template</label>
                                <select
                                    value={data.template_id}
                                    onChange={(e) => setData('template_id', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2 ${
                                        errors.template_id ? 'border-red-500' : 'border-gray-300'
                                    } focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none`}
                                    required
                                >
                                    <option value="">Select a template</option>
                                    {templates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.template_id && <div className="mt-1 text-sm text-red-600">{errors.template_id}</div>}
                            </div>

                            {selectedTemplate?.has_expiration && (
                                <div className="rounded-lg bg-gray-50 p-6">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Card Validity Period</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => {
                                                    setData('start_date', e.target.value);
                                                    if (selectedTemplate) {
                                                        setData('expiry_date', calculateExpiryDate(e.target.value, selectedTemplate.validity_days));
                                                    }
                                                }}
                                                className="focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                                                min={today}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Expiry Date (Auto-calculated)</label>
                                            <input
                                                type="date"
                                                value={data.expiry_date}
                                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2"
                                                readOnly
                                            />
                                            <p className="mt-2 text-sm text-gray-600">Valid for {selectedTemplate.validity_days} days</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedTemplate && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <h3 className="mb-2 text-lg font-medium text-blue-900">Template Details</h3>
                                    <p className="text-blue-800">Total Stamps Required: {selectedTemplate.total_stamps}</p>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-primary-dark w-full rounded-lg px-6 py-3 text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={!data.template_id || processing}
                                >
                                    {isEditing ? 'Update' : 'Create'} Card
                                    {!isEditing && ' with First Stamp'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
