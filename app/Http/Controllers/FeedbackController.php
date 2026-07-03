<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
  public function store(Request $request)
  {
    $validated = $request->validate([
      'subject' => 'required|string|max:255',
      'message' => 'required|string',
    ]);

    $feedback = Feedback::create(array_merge($validated, ['user_id' => auth()->id()]));

    return response()->json($feedback, 201);
  }
  public function index(Request $request)
{
    $feedback = Feedback::with('user:id,name,email')->latest()->get();
    return response()->json($feedback, 200);
}
}
