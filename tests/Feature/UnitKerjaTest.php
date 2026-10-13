<?php

use App\Models\UnitKerja;
use App\Models\User;

it('requires auth to list unit kerja', function () {
    $response = $this->getJson('/api/unit-kerja');

    $response->assertStatus(401);
});

it('returns list of unit kerja', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    UnitKerja::create([
        'kode_unit_kerja' => 'UK001',
        'nama_unit_kerja' => 'Kemlu Pusat',
    ]);

    $response = $this->getJson('/api/unit-kerja');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [['id', 'kode_unit_kerja', 'nama_unit_kerja']],
    ]);
});

it('returns dalam negeri unit kerja', function () {
    UnitKerja::create([
        'kode_unit_kerja' => '07A001',
        'nama_unit_kerja' => 'Kemlu Pusat',
    ]);

    $response = $this->getJson('/api/unit-kerja/dalam-negeri');

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});

it('returns luar negeri unit kerja', function () {
    UnitKerja::create([
        'kode_unit_kerja' => '04A101',
        'nama_unit_kerja' => 'KBRI Tokyo',
    ]);

    $response = $this->getJson('/api/unit-kerja/luar-negeri');

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});
