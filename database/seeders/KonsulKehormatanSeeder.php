<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KonsulKehormatan;

class KonsulKehormatanSeeder extends Seeder
{
    /**
     * Isi 10 data contoh Konsul Kehormatan RI (untuk demo/portfolio).
     * Aman dijalankan berulang karena memakai updateOrCreate.
     */
    public function run(): void
    {
        $konsuls = [
            [
                'negara' => 'Malaysia',
                'kota' => 'Kuala Lumpur',
                'alamat' => "Level 22, Menara 3 Petronas,\nPersiaran KLCC, 50088 Kuala Lumpur",
                'no_telp' => '(+60) 3 2161 2800',
                'fax' => '(+60) 3 2161 2810',
                'email' => 'kln.kl@kemlu.go.id',
                'website' => 'kln.go.id/kuala-lumpur',
                'hari_kerja' => 'Senin – Jumat, 08.30 – 17.00',
            ],
            [
                'negara' => 'Singapore',
                'kota' => 'Singapore',
                'alamat' => "150 Orchard Road, #07-01/03,\nOrchard Plaza, Singapore 238841",
                'no_telp' => '(+65) 6339 3833',
                'fax' => '(+65) 6339 9833',
                'email' => 'kbri.singapura@kemlu.go.id',
                'website' => 'kemlu.go.id/singapura',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 17.30',
            ],
            [
                'negara' => 'Japan',
                'kota' => 'Osaka',
                'alamat' => "3-1-41, Nishitenma,\nKita-ku, Osaka 530-0001",
                'no_telp' => '(+81) 6 6361 2211',
                'fax' => '(+81) 6 6361 2215',
                'email' => 'japanosaka@kemlu.go.id',
                'website' => 'kemlu.go.id/osaka',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 17.00',
            ],
            [
                'negara' => 'Australia',
                'kota' => 'Sydney',
                'alamat' => "236-238 Maroubra Road,\nMaroubra NSW 2035",
                'no_telp' => '(+61) 2 9344 9933',
                'fax' => '(+61) 2 9349 6854',
                'email' => 'sydney.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/sydney',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 17.00',
            ],
            [
                'negara' => 'Germany',
                'kota' => 'Frankfurt',
                'alamat' => "Friedrich-Ebert-Anlage 41,\n60325 Frankfurt am Main",
                'no_telp' => '(+49) 69 710 1730',
                'fax' => '(+49) 69 710 1790',
                'email' => 'frankfurt.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/frankfurt',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 16.00',
            ],
            [
                'negara' => 'France',
                'kota' => 'Marseille',
                'alamat' => "2 Rue de la Liberte,\n13002 Marseille",
                'no_telp' => '(+33) 4 91 33 05 00',
                'fax' => '(+33) 4 91 33 05 09',
                'email' => 'marseille.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/marseille',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 17.00',
            ],
            [
                'negara' => 'Netherlands',
                'kota' => 'Rotterdam',
                'alamat' => "Westblaak 92,\n3012 KM Rotterdam",
                'no_telp' => '(+31) 10 414 1000',
                'fax' => '(+31) 10 414 1099',
                'email' => 'rotterdam.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/rotterdam',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 17.00',
            ],
            [
                'negara' => 'Turkey',
                'kota' => 'Istanbul',
                'alamat' => "Karaevli Sok. No.18,\nTrabzon/istanbul 80840",
                'no_telp' => '(+90) 212 343 2500',
                'fax' => '(+90) 212 343 2550',
                'email' => 'istanbul.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/istanbul',
                'hari_kerja' => 'Senin – Jumat, 09.00 – 18.00',
            ],
            [
                'negara' => 'United Arab Emirates',
                'kota' => 'Dubai',
                'alamat' => "Jumeirah 1, Street 12b,\nVilla No. 12, Dubai",
                'no_telp' => '(+971) 4 349 3700',
                'fax' => '(+971) 4 349 3799',
                'email' => 'dubai.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/dubai',
                'hari_kerja' => 'Minggu – Kamis, 08.00 – 17.00',
            ],
            [
                'negara' => 'India',
                'kota' => 'Mumbai',
                'alamat' => "Netaji Subhash Chandra Bose Road,\nColaba, Mumbai 400001",
                'no_telp' => '(+91) 22 2215 5600',
                'fax' => '(+91) 22 2215 5650',
                'email' => 'mumbai.kjri@kemlu.go.id',
                'website' => 'kemlu.go.id/mumbai',
                'hari_kerja' => 'Senin – Jumat, 09.30 – 18.00',
            ],
        ];

        foreach ($konsuls as $konsul) {
            KonsulKehormatan::updateOrCreate(
                ['negara' => $konsul['negara'], 'kota' => $konsul['kota']],
                $konsul
            );
        }
    }
}
