<?php

use App\Models\SyncLog;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('requires auth to list sync logs', function () {
    $response = $this->getJson('/api/sync-logs');

    $response->assertStatus(401);
});

it('lists sync logs', function () {
    SyncLog::create(['date' => now(), 'method' => 'Manual', 'status' => 'Success', 'detail' => 'OK']);

    $response = $this->actingAs($this->user)->getJson('/api/sync-logs');

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});

it('requires auth to create sync log', function () {
    $response = $this->postJson('/api/sync-logs', [
        'method' => 'Manual',
        'status' => 'Success',
    ]);

    $response->assertStatus(401);
});

it('creates sync log', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sync-logs', [
        'method' => 'Manual',
        'status' => 'Success',
        'detail' => 'Sync completed',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('sync_logs', ['method' => 'Manual', 'status' => 'Success']);
});

it('validates sync log fields', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sync-logs', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['method', 'status']);
});

it('exports sync logs as CSV', function () {
    SyncLog::create(['date' => now(), 'method' => 'Manual', 'status' => 'Success']);

    $response = $this->actingAs($this->user)->getJson('/api/sync-logs/export');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});
