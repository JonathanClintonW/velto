import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    type?: 'button' | 'submit' | 'reset';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({
    variant = 'primary',
    type = 'button',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    onClick,
    ...props
}: ButtonProps) {
    const baseClasses = 'center animate font-medium px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed gap-2';

    const variantClasses = {
        primary: 'bg-turquoise text-black hover:bg-turquoise/80 shadow-smaller-outer',
        secondary: 'glass-card text-white hover:bg-light-gray/25 border border-light-gray/30',
        danger: 'bg-red-600 text-white hover:bg-red-800 shadow-danger-smaller-outer',
        ghost: 'text-turquoise hover:bg-turquoise/10 border border-turquoise/30 hover:border-turquoise/50'
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    Loading...
                </>
            ) : (
                <>
                    {leftIcon && leftIcon}
                    {children}
                    {rightIcon && rightIcon}
                </>
            )}
        </button>
    );
}
