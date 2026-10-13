<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class JabatanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kode_jabatan' => fake()->unique()->numerify('07####'),
            'nama_jabatan' => fake()->jobTitle(),
        ];
    }
}
