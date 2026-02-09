import { forwardRef } from 'react'

const Input = forwardRef(({
    label,
    error,
    className = '',
    type = 'text',
    icon: Icon,
    ...props
}, ref) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full px-4 py-2.5 rounded-lg
            bg-surface border border-border
            text-text-primary placeholder-text-secondary
            focus:border-primary focus:ring-1 focus:ring-primary
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-danger">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
