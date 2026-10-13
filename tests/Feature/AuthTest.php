<?php

use App\Models\User;

it('requires email and password', function () {
    $response = $this->postJson('/api/login', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email', 'password']);
});

it('rejects invalid credentials', function () {
    User::factory()->create([
        'email' => 'admin@test.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'admin@test.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401);
    $response->assertJson(['success' => false]);
});

it('logs in with valid credentials', function () {
    User::factory()->create([
        'email' => 'admin@test.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'admin@test.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'message',
        'data' => ['token', 'user', 'permissions'],
    ]);
});

it('creates activity log on login', function () {
    $user = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => bcrypt('password123'),
    ]);

    $this->postJson('/api/login', [
        'email' => 'admin@test.com',
        'password' => 'password123',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $user->id,
        'action' => 'LOGIN',
    ]);
});

it('can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer $token",
    ])->postJson('/api/logout');

    $response->assertStatus(200);
    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $user->id,
        'action' => 'LOGOUT',
    ]);
});

it('requires auth for logout', function () {
    $response = $this->postJson('/api/logout');

    $response->assertStatus(401);
});
