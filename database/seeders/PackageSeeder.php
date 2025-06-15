<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Package;

class PackageSeeder extends Seeder
{
    public function run()
    {
        $packages = [
            [
                'name' => 'Basic Package',
                'price' => 29.99,
                'duration' => 30,
                'description' => 'Basic loyalty membership with essential benefits.',
                'features' => json_encode([
                    '10% cashback',
                    'Standard shipping',
                    'Basic offers',
                    'Standard support',
                ]),
            ],
            // [
            //     'name' => 'Premium Package',
            //     'price' => 19.99,
            //     'duration' => 30,
            //     'description' => 'Enhanced loyalty membership with additional benefits.',
            //     'features' => json_encode([
            //         '20% cashback',
            //         'Free shipping',
            //         'Exclusive offers',
            //         'Priority support',
            //     ]),
            // ],
            // [
            //     'name' => 'Platinum Package',
            //     'price' => 29.99,
            //     'duration' => 30,
            //     'description' => 'Top-tier loyalty membership with premium benefits.',
            //     'features' => json_encode([
            //         '30% cashback',
            //         'Free shipping',
            //         'Exclusive offers',
            //         'Priority support',
            //     ]),
            // ],
        ];

        foreach ($packages as $package) {
            Package::create($package);
        }
    }
}
