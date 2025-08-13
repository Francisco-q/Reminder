import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
    return (
        <View style={[styles.header, style]}>
            {children}
        </View>
    );
};

interface CardContentProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
    return (
        <View style={[styles.content, style]}>
            {children}
        </View>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
    return (
        <Text style={[styles.title, style]}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginVertical: 4,
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    content: {
        padding: 16,
        paddingTop: 0,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
});
