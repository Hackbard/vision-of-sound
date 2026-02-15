<?php

namespace App\Providers;

use Native\Desktop\Facades\Window;
use Native\Desktop\Facades\Menu;
use Native\Desktop\Contracts\ProvidesPhpIni;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        Menu::create(
            Menu::app(),
            Menu::label('Simulation')->submenu(
                Menu::link('/reset/random', 'Random Pattern')->hotkey('CmdOrCtrl+R'),
                Menu::link('/reset/glider', 'Glider'),
                Menu::link('/reset/pulsar', 'Pulsar'),
                Menu::link('/reset/glider-gun', 'Glider Gun'),
                Menu::separator(),
                Menu::link('/toggle-pause', 'Pause/Resume')
            ),
            Menu::label('View')->submenu(
                Menu::fullscreen('Toggle Fullscreen'),
                Menu::link('/toggle-controls', 'Toggle Controls')->hotkey('CmdOrCtrl+H'),
                Menu::separator(),
                Menu::devTools('Developer Tools')
            ),
            Menu::window()
        );

        Window::open('main')
            ->title('Game of Sound')
            ->width(1200)
            ->height(800)
            ->minWidth(800)
            ->minHeight(600)
            ->rememberState()
            ->backgroundColor('#000000');
    }

    /**
     * Return an array of php.ini directives to be set.
     */
    public function phpIni(): array
    {
        return [];
    }
}
