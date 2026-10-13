<?php

use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\UnitKerja;
use App\Models\User;

it('returns list of pegawai without auth', function () {
    Pegawai::factory()->count(3)->create();

    $response = $this->getJson('/api/pegawai');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => [[
            'id', 'nip', 'nama', 'nama_pegawai',
            'no_handphone', 'jabatan', 'unit_kerja_id',
            'nama_unit_kerja', 'bobot', 'wisma',
        ]],
    ]);
    $response->assertJsonCount(3, 'data');
});

it('returns pegawai by unit', function () {
    $unit = UnitKerja::factory()->create();
    Pegawai::factory()->count(2)->create(['unit_kerja_id' => $unit->id]);
    Pegawai::factory()->create();

    $response = $this->getJson("/api/pegawai/unit/{$unit->id}");

    $response->assertStatus(200);
    $response->assertJsonCount(2, 'data');
    $response->assertJson(['unit_nama' => $unit->nama_unit_kerja]);
});

it('returns 404 for unknown unit', function () {
    $response = $this->getJson('/api/pegawai/unit/99999');

    $response->assertStatus(404);
});

it('requires auth to update pegawai', function () {
    $pegawai = Pegawai::factory()->create();

    $response = $this->putJson("/api/pegawai/{$pegawai->id}", ['nama' => 'Updated']);

    $response->assertStatus(401);
});

it('updates pegawai data', function () {
    $user = User::factory()->create();
    $pegawai = Pegawai::factory()->create();

    $response = $this->actingAs($user)
        ->putJson("/api/pegawai/{$pegawai->id}", [
            'nama' => 'Budi Santoso',
            'no_handphone' => '08123456789',
        ]);

    $response->assertStatus(200);
    expect($response->json('data.nama'))->toBe('Budi Santoso');
    $this->assertDatabaseHas('pegawai', [
        'id' => $pegawai->id,
        'nama' => 'Budi Santoso',
    ]);
});

it('returns 404 when updating missing pegawai', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->putJson('/api/pegawai/99999', ['nama' => 'Test']);

    $response->assertStatus(404);
});

it('creates jabatan when updating with new jabatan name', function () {
    $user = User::factory()->create();
    $pegawai = Pegawai::factory()->create();

    $response = $this->actingAs($user)
        ->putJson("/api/pegawai/{$pegawai->id}", [
            'jabatan' => 'Konsul Jenderal',
        ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('jabatan', [
        'nama_jabatan' => 'Konsul Jenderal',
    ]);
});

it('returns dashboard stats', function () {
    $user = User::factory()->create();
    Pegawai::factory()->count(5)->create();
    User::factory()->count(2)->create();

    $response = $this->actingAs($user)
        ->getJson('/api/dashboard/stats');

    $response->assertStatus(200);
    $response->assertJson([
        'data' => [
            'total_pegawai' => 5,
            'total_admin' => 3,
        ],
    ]);
});
