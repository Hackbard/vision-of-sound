<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('simulation');
});

Route::get('/reset/{pattern}', function (string $pattern) {
    return redirect('/')->with('pattern', $pattern);
});

Route::get('/toggle-pause', function () {
    return redirect('/')->with('action', 'toggle-pause');
});

Route::get('/toggle-fullscreen', function () {
    return redirect('/')->with('action', 'toggle-fullscreen');
});

Route::get('/toggle-controls', function () {
    return redirect('/')->with('action', 'toggle-controls');
});
