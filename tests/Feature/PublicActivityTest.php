<?php

use App\Models\PublicActivityCount;
use App\Models\User;

it('validates hit type', function () {
    $response = $this->postJson('/api/public-activities/hit', ['type' => 'invalid']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['type']);
});

it('records preview hit', function () {
    $response = $this->postJson('/api/public-activities/hit', ['type' => 'preview']);

    $response->assertStatus(200);
    $this->assertDatabaseHas('public_activity_counts', [
        'type' => 'preview',
        'count' => 1,
    ]);
});

it('increments existing count', function () {
    $this->postJson('/api/public-activities/hit', ['type' => 'download']);
    $this->postJson('/api/public-activities/hit', ['type' => 'download']);

    $this->assertDatabaseHas('public_activity_counts', [
        'type' => 'download',
        'count' => 2,
    ]);
});

it('requires auth to view stats', function () {
    $response = $this->getJson('/api/public-activities/stats');

    $response->assertStatus(401);
});

it('returns stats for last 7 days', function () {
    $user = User::factory()->create();
    PublicActivityCount::create(['date' => now()->toDateString(), 'type' => 'preview', 'count' => 5]);
    PublicActivityCount::create(['date' => now()->subDays(10)->toDateString(), 'type' => 'preview', 'count' => 99]);

    $response = $this->actingAs($user)->getJson('/api/public-activities/stats');

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});

it('returns stats with date range', function () {
    $user = User::factory()->create();
    PublicActivityCount::create(['date' => now()->subDays(2)->toDateString(), 'type' => 'preview', 'count' => 10]);
    PublicActivityCount::create(['date' => now()->toDateString(), 'type' => 'preview', 'count' => 20]);

    $response = $this->actingAs($user)->getJson('/api/public-activities/stats', [
        'start_date' => now()->subDays(3)->toDateString(),
        'end_date' => now()->toDateString(),
    ]);

    $response->assertStatus(200);
    $response->assertJsonCount(2, 'data');
});
