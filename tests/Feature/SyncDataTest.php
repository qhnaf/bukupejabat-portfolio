<?php

use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\SyncConfig;
use App\Models\SyncLog;
use App\Models\UnitKerja;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('requires auth to get sync config', function () {
    $response = $this->getJson('/api/sync-config');

    $response->assertStatus(401);
});

it('returns sync config', function () {
    $response = $this->actingAs($this->user)->getJson('/api/sync-config');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => ['api_url', 'api_key', 'http_method', 'auto_sync_enabled'],
    ]);
});

it('creates default config if none exists', function () {
    $this->actingAs($this->user)->getJson('/api/sync-config');

    $this->assertDatabaseHas('sync_configs', ['http_method' => 'GET']);
});

it('requires auth to save sync config', function () {
    $response = $this->postJson('/api/sync-config', ['api_url' => 'api.example.com']);

    $response->assertStatus(401);
});

it('saves sync config', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sync-config', [
        'api_url' => 'api.example.com/v1/pegawai',
        'api_key' => 'secret-key',
        'http_method' => 'GET',
        'auto_sync_enabled' => true,
        'auto_sync_type' => 'weekly',
        'auto_sync_day' => 'Senin',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('sync_configs', [
        'api_url' => 'api.example.com/v1/pegawai',
        'http_method' => 'GET',
    ]);
});

it('validates sync config input', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sync-config', [
        'http_method' => 'PUT',
        'auto_sync_type' => 'daily',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['http_method', 'auto_sync_type']);
});

it('rejects test connection without config', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sync-data/test-connection');

    $response->assertStatus(400);
});

it('tests connection successfully', function () {
    SyncConfig::create(['api_url' => 'https://api.example.com', 'http_method' => 'GET']);

    Http::fake([
        'https://api.example.com*' => Http::response(['data' => ['emp' => []]], 200),
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/sync-data/test-connection');

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);
});

it('fails test connection on server error', function () {
    SyncConfig::create(['api_url' => 'https://api.example.com', 'http_method' => 'GET']);

    Http::fake([
        'https://api.example.com*' => Http::response([], 500),
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/sync-data/test-connection');

    $response->assertStatus(400);
});

it('rejects sync without config', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sync-data/trigger');

    $response->assertStatus(400);
    $this->assertDatabaseHas('sync_logs', ['status' => 'Failed']);
});

it('syncs pegawai from API', function () {
    $unit = UnitKerja::factory()->create(['kode_unit_kerja' => '07A001']);
    SyncConfig::create(['api_url' => 'https://api.example.com', 'http_method' => 'GET']);

    Http::fake([
        'https://api.example.com*' => Http::response([
            'data' => [
                'emp' => [
                    ['nip' => '1998001', 'nama' => 'Budi', 'kd_unker' => '07A001', 'Jabatan' => 'Konsul'],
                    ['nip' => '1998002', 'nama' => 'Siti', 'kd_unker' => '07A001', 'Jabatan' => 'Konsul'],
                    ['nip' => '', 'nama' => 'NoNIP'],
                    ['nip' => '1998003', 'nama' => 'Andi', 'kd_unker' => '99999', 'Jabatan' => 'Staf'],
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/sync-data/trigger', [
        'method' => 'Manual',
    ]);

    $response->assertStatus(200);
    $response->assertJson(['inserted' => 2, 'skipped' => 2]);
    $this->assertDatabaseHas('pegawai', ['nip' => '1998001', 'nama' => 'Budi']);
    $this->assertDatabaseHas('jabatan', ['nama_jabatan' => 'Konsul']);
    $this->assertDatabaseHas('sync_logs', ['status' => 'Success']);
});

it('fails sync when API returns error', function () {
    SyncConfig::create(['api_url' => 'https://api.example.com', 'http_method' => 'GET']);

    Http::fake([
        'https://api.example.com*' => Http::response([], 500),
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/sync-data/trigger');

    $response->assertStatus(400);
    $this->assertDatabaseHas('sync_logs', ['status' => 'Failed']);
});

it('fails sync when no pegawai data in response', function () {
    SyncConfig::create(['api_url' => 'https://api.example.com', 'http_method' => 'GET']);

    Http::fake([
        'https://api.example.com*' => Http::response(['data' => ['other' => 'no emp']], 200),
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/sync-data/trigger');

    $response->assertStatus(400);
    $this->assertDatabaseHas('sync_logs', ['status' => 'Failed']);
});

it('sends authorization header when api key is set', function () {
    SyncConfig::create(['api_url' => 'https://api.example.com', 'http_method' => 'GET', 'api_key' => 'my-secret']);

    Http::fake([
        'https://api.example.com*' => Http::response(['data' => ['emp' => []]], 200),
    ]);

    $this->actingAs($this->user)->postJson('/api/sync-data/test-connection');

    Http::assertSent(function ($request) {
        return $request->hasHeader('Authorization', 'Bearer my-secret');
    });
});
