<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controller;

class AuthController extends Controller
{
  public function login(Request $request)
  {
    $data = $request->validate([
      'email' => ['required', 'email'],
      'password' => ['required', 'string'],
    ]);

    $user = User::where('email', $data['email'])->first();

    if (! $user || ! Hash::check($data['password'], $user->password)) {
      return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
      'token' => $token,
      'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role'  => $user->role->value,
      ],
    ]);
  }

  public function logout(Request $request)
  {
    if ($request->user() && $request->user()->currentAccessToken()) {
      $request->user()->currentAccessToken()->delete();
    }

    return response()->json(['message' => 'Logged out']);
  }

  public function me(Request $request)
  {
    $user = $request->user();

    return response()->json([
      'id' => $user->id,
      'name' => $user->name,
      'email' => $user->email,
      'role'  => $user->role->value,
    ]);
  }
}
