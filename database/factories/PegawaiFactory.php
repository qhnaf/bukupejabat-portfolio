<?php

namespace Database\Factories;

use App\Models\Jabatan;
use App\Models\UnitKerja;
use Illuminate\Database\Eloquent\Factories\Factory;

class PegawaiFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nip' => fake()->unique()->numerify('19##########'),
            'nama' => fake()->name(),
            'alamat' => fake()->address(),
            'no_handphone' => fake()->phoneNumber(),
            'jabatan_id' => Jabatan::factory(),
            'unit_kerja_id' => UnitKerja::factory(),
        ];
    }
}
