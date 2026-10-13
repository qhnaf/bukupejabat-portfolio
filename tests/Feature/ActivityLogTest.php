<?php

use App\Models\ActivityLog;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('requires auth to list activity logs', function () {
    $response = $this->getJson('/api/activity-logs');

    $response->assertStatus(401);
});

it('lists activity logs', function () {
    ActivityLog::create(['user_id' => $this->user->id, 'action' => 'LOGIN', 'description' => 'Test login']);

    $response = $this->actingAs($this->user)->getJson('/api/activity-logs');

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});

it('filters activity logs by date range', function () {
    ActivityLog::create(['user_id' => $this->user->id, 'action' => 'LOGIN', 'description' => 'Old']);
    ActivityLog::where('action', 'LOGIN')->delete();

    $log = ActivityLog::create(['user_id' => $this->user->id, 'action' => 'LOGIN', 'description' => 'Recent']);

    $response = $this->actingAs($this->user)->getJson('/api/activity-logs', [
        'start_date' => now()->subDay()->toDateString(),
        'end_date' => now()->toDateString(),
    ]);

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});

it('requires auth to create activity log', function () {
    $response = $this->postJson('/api/activity-logs', [
        'action' => 'CREATE',
        'description' => 'Test',
    ]);

    $response->assertStatus(401);
});

it('creates activity log', function () {
    $response = $this->actingAs($this->user)->postJson('/api/activity-logs', [
        'action' => 'CREATE',
        'description' => 'Created unit kerja',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $this->user->id,
        'action' => 'CREATE',
    ]);
});

it('validates activity log fields', function () {
    $response = $this->actingAs($this->user)->postJson('/api/activity-logs', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['action', 'description']);
});

it('exports activity logs as CSV', function () {
    ActivityLog::create(['user_id' => $this->user->id, 'action' => 'LOGIN', 'description' => 'Test export']);

    $response = $this->actingAs($this->user)->getJson('/api/activity-logs/export');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});
