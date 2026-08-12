<?php

use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/chat', [ChatController::class, 'index'])->name('chat');
Route::post('/chat/ask', [ChatController::class, 'ask'])->name('chat.ask');
