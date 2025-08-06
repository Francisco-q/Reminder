import React from 'react';
import { Text, TextStyle } from 'react-native';

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
}

// Mapeo de iconos usando emojis y símbolos Unicode
const iconMap: Record<string, string> = {
    // Iconos médicos
    pill: '💊',
    bell: '🔔',
    calendar: '📅',
    clock: '🕐',
    check: '✅',
    'check-circle': '✅',
    circle: '⭕',
    plus: '➕',

    // Iconos de navegación
    home: '🏠',
    list: '📋',
    settings: '⚙️',

    // Otros iconos útiles
    heart: '❤️',
    star: '⭐',
    warning: '⚠️',
    info: 'ℹ️',
    close: '❌',
    edit: '✏️',
    delete: '🗑️',
    save: '💾',
};

export const Icon: React.FC<IconProps> = ({
    name,
    size = 20,
    color = '#000000',
    style,
}) => {
    const iconSymbol = iconMap[name] || '❓';

    return (
        <Text
            style={[
                {
                    fontSize: size,
                    color,
                    textAlign: 'center',
                },
                style,
            ]}
        >
            {iconSymbol}
        </Text>
    );
};

export default Icon;
