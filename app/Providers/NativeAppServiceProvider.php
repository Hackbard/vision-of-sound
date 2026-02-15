<?php

namespace App\Providers;

use Native\Desktop\Facades\Window;
use Native\Desktop\Facades\Menu;
use Native\Desktop\Contracts\ProvidesPhpIni;
use Native\Desktop\Menu\Items\Label;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        Menu::make()
            ->appMenu()
            ->submenu('Simulation', Menu::make()
                ->link('/reset/random', 'Random Pattern', 'CmdOrCtrl+R')
                ->link('/reset/glider', 'Glider')
                ->link('/reset/pulsar', 'Pulsar')
                ->link('/reset/glider-gun', 'Glider Gun')
                ->separator()
                ->link('/toggle-pause', 'Pause/Resume', 'Space')
            )
            ->submenu('View', Menu::make()
                ->link('/toggle-fullscreen', 'Toggle Fullscreen', 'CmdOrCtrl+F')
                ->link('/toggle-controls', 'Toggle Controls', 'CmdOrCtrl+H')
            )
            ->register();

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
