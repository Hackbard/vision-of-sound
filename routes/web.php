<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('dashboard');
});

// Experiences
Route::get('/game-of-life', function () {
    return view('simulation');
});

Route::get('/fractals', function () {
    return view('fractals');
});

Route::get('/kaleidoscope', function () {
    return view('kaleidoscope');
});

Route::get('/oscilloscope', function () {
    return view('oscilloscope');
});

// Legacy routes
Route::get('/reset/{pattern}', function (string $pattern) {
    return redirect('/game-of-life')->with('pattern', $pattern);
});

Route::get('/toggle-pause', function () {
    return redirect('/game-of-life')->with('action', 'toggle-pause');
});

Route::get('/toggle-fullscreen', function () {
    return redirect('/game-of-life')->with('action', 'toggle-fullscreen');
});

Route::get('/toggle-controls', function () {
    return redirect('/game-of-life')->with('action', 'toggle-controls');
});
