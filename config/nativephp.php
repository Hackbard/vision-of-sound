<?php

return [
    'version' => env('NATIVEPHP_APP_VERSION', '1.0.0'),
    'app_id' => env('NATIVEPHP_APP_ID', 'com.gameofsound.app'),
    'deeplink_scheme' => env('NATIVEPHP_DEEPLINK_SCHEME'),
    'author' => env('NATIVEPHP_APP_AUTHOR', 'Game of Sound'),
    'copyright' => env('NATIVEPHP_APP_COPYRIGHT'),
    'description' => env('NATIVEPHP_APP_DESCRIPTION', 'Audio-reactive Game of Life visualization'),
    'website' => env('NATIVEPHP_APP_WEBSITE', 'https://github.com/game-of-sound'),
    'provider' => \App\Providers\NativeAppServiceProvider::class,

    'cleanup_env_keys' => [
        'AWS_*',
        'AZURE_*',
        'GITHUB_*',
        'DO_SPACES_*',
        '*_SECRET',
        'BIFROST_*',
        'NATIVEPHP_UPDATER_PATH',
        'NATIVEPHP_APPLE_ID',
        'NATIVEPHP_APPLE_ID_PASS',
        'NATIVEPHP_APPLE_TEAM_ID',
    ],

    'cleanup_exclude_files' => [
        'build',
        'temp',
        'content',
        'node_modules',
        '*/tests',
    ],

    'updater' => [
        'enabled' => env('NATIVEPHP_UPDATER_ENABLED', false),
        'default' => env('NATIVEPHP_UPDATER_PROVIDER', 'github'),
        'providers' => [
            'github' => [
                'driver' => 'github',
                'repo' => env('GITHUB_REPO'),
                'owner' => env('GITHUB_OWNER'),
                'token' => env('GITHUB_TOKEN'),
            ],
        ],
    ],

    'queue_workers' => [
        'default' => [
            'queues' => ['default'],
            'memory_limit' => 128,
            'timeout' => 60,
            'sleep' => 3,
        ],
    ],

    'prebuild' => [],
    'postbuild' => [],
    'binary_path' => env('NATIVEPHP_PHP_BINARY_PATH', null),
];
