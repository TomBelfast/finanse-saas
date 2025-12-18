import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '~/hooks/useTheme'
import { cn } from '~/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const themes = [
        { value: 'light' as const, icon: Sun, label: 'Jasny' },
        { value: 'dark' as const, icon: Moon, label: 'Ciemny' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
    ]

    return (
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        theme === value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-gray-500 hover:bg-background/50 hover:text-foreground'
                    )}
                    title={label}
                >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </button>
            ))}
        </div>
    )
}

// Compact version for header
export function ThemeToggleCompact() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
    }

    const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'inline-flex items-center justify-center rounded-lg p-2',
                'bg-secondary text-secondary-foreground',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'transition-colors'
            )}
            title={`Motyw: ${theme === 'light' ? 'Jasny' : theme === 'dark' ? 'Ciemny' : 'Systemowy'}`}
        >
            <Icon className="h-5 w-5" />
        </button>
    )
}
