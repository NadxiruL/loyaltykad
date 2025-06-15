<?php

namespace App;

use Exception;
use Illuminate\Support\Facades\Http;

class Chip
{
    public const BASE_URL = 'https://gate.chip-in.asia/api/v1/';

    protected string $baseUrl;
    protected string $brandId;
    protected string $secretKey;
    protected array $paymentMethodWhitelist;

    /**
     * Create a new instance.
     */
    public function __construct(string $brandId, string $secretKey, array $paymentMethodWhitelist)
    {
        $this->baseUrl = self::BASE_URL;
        $this->brandId = $brandId;
        $this->secretKey = $secretKey;
        $this->paymentMethodWhitelist = $paymentMethodWhitelist;
    }

    /**
     * Create a new purchase.
     */
    public function createPurchase(array $data): mixed
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])
                ->timeout(30)
                ->post($this->baseUrl . 'purchases/', $data);

            return $response->json();
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get purchase data.
     */
    public function getPurchase(string $purchaseId): mixed
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])
                ->timeout(30)
                ->get($this->baseUrl . 'purchases/' . $purchaseId . '/');

            return $response->json();
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get checkout URL.
     */
    public function checkoutUrl(string $purchaseId): string
    {
        return 'https://gate.chip-in.asia/p/' . $purchaseId . '/';
    }

    /**
     * Get brand ID.
     */
    public function brandId(): string
    {
        return $this->brandId;
    }

    /**
     * Get payment method whitelist.
     */
    public function paymentMethodWhitelist(): array
    {
        return $this->paymentMethodWhitelist;
    }
}
