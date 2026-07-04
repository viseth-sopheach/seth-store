<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UserController extends Controller
{
  public function index()
  {
    $users = User::all();

    return response()->json($users);
  }

  public function update(Request $request, $id)
  {
    $user = User::findOrFail($id);

    if ($request->has('role')) {
      $request->merge(['role' => strtolower($request->input('role'))]);
    }

    $validated = $request->validate([
      'name' => 'sometimes|string|max:255',
      'email' => [
        'sometimes',
        'string',
        'email',
        'max:255',
        Rule::unique('users', 'email')->ignore($user->id),
      ],
      'role' => ['sometimes', new Enum(UserRole::class)],
    ]);

    $user->update($validated);

    return response()->json($user);
  }
}
