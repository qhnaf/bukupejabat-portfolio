<?php

use App\Models\UnitKerja;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('requires auth to list users', function () {
    $response = $this->getJson('/api/users');

    $response->assertStatus(401);
});

it('lists all users', function () {
    User::factory()->count(3)->create();

    $response = $this->actingAs($this->user)->getJson('/api/users');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => [['id', 'username', 'email', 'role']],
    ]);
    $response->assertJsonCount(4, 'data');
});

it('requires auth to create user', function () {
    $response = $this->postJson('/api/users', [
        'username' => 'newadmin',
        'email' => 'new@test.com',
        'password' => 'password123',
        'role' => 'admin',
    ]);

    $response->assertStatus(401);
});

it('creates a new user', function () {
    $unit = UnitKerja::factory()->create();

    $response = $this->actingAs($this->user)->postJson('/api/users', [
        'username' => 'newadmin',
        'email' => 'new@test.com',
        'password' => 'password123',
        'role' => 'admin',
        'unit_kerja_id' => $unit->id,
    ]);

    $response->assertStatus(201);
    expect($response->json('data.username'))->toBe('newadmin');
    $this->assertDatabaseHas('users', ['email' => 'new@test.com']);
});

it('validates required fields when creating user', function () {
    $response = $this->actingAs($this->user)->postJson('/api/users', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['username', 'email', 'password', 'role']);
});

it('rejects duplicate username', function () {
    User::factory()->create(['username' => 'taken']);

    $response = $this->actingAs($this->user)->postJson('/api/users', [
        'username' => 'taken',
        'email' => 'other@test.com',
        'password' => 'password123',
        'role' => 'admin',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['username']);
});

it('requires auth to update user', function () {
    $target = User::factory()->create();

    $response = $this->putJson("/api/users/{$target->id}", ['username' => 'updated']);

    $response->assertStatus(401);
});

it('updates user data', function () {
    $target = User::factory()->create();

    $response = $this->actingAs($this->user)->putJson("/api/users/{$target->id}", [
        'username' => 'updatedname',
        'email' => 'updated@test.com',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', [
        'id' => $target->id,
        'username' => 'updatedname',
    ]);
});

it('returns 404 when updating missing user', function () {
    $response = $this->actingAs($this->user)->putJson('/api/users/99999', ['username' => 'x']);

    $response->assertStatus(404);
});

it('changes password with correct current password', function () {
    $target = User::factory()->create(['password' => bcrypt('oldpassword123')]);

    $response = $this->actingAs($this->user)->putJson("/api/users/{$target->id}", [
        'current_password' => 'oldpassword123',
        'new_password' => 'newpassword456',
    ]);

    $response->assertStatus(200);
    expect(\Illuminate\Support\Facades\Hash::check('newpassword456', $target->fresh()->password))->toBeTrue();
});

it('rejects password change with wrong current password', function () {
    $target = User::factory()->create(['password' => bcrypt('oldpassword123')]);

    $response = $this->actingAs($this->user)->putJson("/api/users/{$target->id}", [
        'current_password' => 'wrongpassword',
        'new_password' => 'newpassword456',
    ]);

    $response->assertStatus(400);
});

it('requires auth to delete user', function () {
    $target = User::factory()->create();

    $response = $this->deleteJson("/api/users/{$target->id}");

    $response->assertStatus(401);
});

it('deletes a user', function () {
    $target = User::factory()->create();

    $response = $this->actingAs($this->user)->deleteJson("/api/users/{$target->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('returns 404 when deleting missing user', function () {
    $response = $this->actingAs($this->user)->deleteJson('/api/users/99999');

    $response->assertStatus(404);
});

it('returns user profile with unit kerja', function () {
    $unit = UnitKerja::factory()->create();
    $target = User::factory()->create(['unit_kerja_id' => $unit->id]);

    $response = $this->actingAs($this->user)->getJson("/api/admin/profile/{$target->id}");

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => ['id', 'username', 'email', 'role', 'nama_unit_kerja'],
    ]);
});

it('returns 404 for missing profile', function () {
    $response = $this->actingAs($this->user)->getJson('/api/admin/profile/99999');

    $response->assertStatus(404);
});
