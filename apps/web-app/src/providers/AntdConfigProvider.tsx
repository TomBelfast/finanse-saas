import React, { useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useTheme } from '~/hooks/useTheme';
import { appTheme } from '~/theme/appTheme';
import pl from 'antd/lib/locale/pl_PL';

export const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

        const updateTheme = () => {
            if (theme === 'dark') {
                setIsDarkMode(true);
            } else if (theme === 'light') {
                setIsDarkMode(false);
            } else {
                setIsDarkMode(checkSystemTheme());
            }
        };

        updateTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                updateTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ConfigProvider
            locale={pl}
            theme={{
                token: appTheme,
                algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
            }}
        >
            {children}
        </ConfigProvider>
    );
};
