import { Moon, Sun, Monitor, Sparkles, Coffee, Crown, Terminal, Ghost, Waves } from 'lucide-react'
import { useTheme, type Theme } from '~/hooks/useTheme'
import { cn } from '~/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const themes: { value: Theme, icon: any, label: string }[] = [
        { value: 'light', icon: Sun, label: 'Jasny' },
        { value: 'dark', icon: Moon, label: 'Ciemny' },
        { value: 'system', icon: Monitor, label: 'System' },
        { value: 'warmth', icon: Coffee, label: 'Neutralny' },
    ]

    return (
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
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

    const themes: Theme[] = ['light', 'dark', 'system', 'warmth']

    const toggleTheme = () => {
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex])
    }

    const getIcon = () => {
        switch (theme) {
            case 'light': return Sun
            case 'dark': return Moon
            case 'system': return Monitor
            case 'warmth': return Coffee
            default: return Monitor
        }
    }

    const Icon = getIcon()

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
            title={`Motyw: ${theme}`}
        >
            <Icon className="h-5 w-5" />
        </button>
    )
}
