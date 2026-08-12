<?php

namespace App\Http\Controllers;

use App\Ai\Agents\ZondaAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ChatController extends Controller
{
    public function index() : Response
    {
        return inertia('chat');
    }

    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:4000'],
        ]);

        $response = ZondaAssistant::make()->prompt($validated['question']);

        return response()->json([
            'answer' => $response->text,
        ]);
    }
}