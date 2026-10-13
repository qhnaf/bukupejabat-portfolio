<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UnitKerjaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kode_unit_kerja' => fake()->unique()->numerify('07A###'),
            'nama_unit_kerja' => fake()->company(),
            'alamat' => fake()->address(),
            'telepon' => fake()->phoneNumber(),
            'deskripsi' => fake()->sentence(),
        ];
    }

    public function dalamNegeri(): static
    {
        return $this->state(fn () => [
            'kode_unit_kerja' => fake()->unique()->numerify('07A###'),
        ]);
    }

    public function luarNegeri(): static
    {
        return $this->state(fn () => [
            'kode_unit_kerja' => fake()->unique()->numerify('04A1##'),
        ]);
    }
}
