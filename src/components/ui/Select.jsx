import { forwardRef } from 'react'

const Select = forwardRef(({
    label,
    error,
    options = [],
    placeholder = 'Pilih...',
    className = '',
    ...props
}, ref) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
          w-full px-4 py-2.5 rounded-lg
          bg-surface border border-border
          text-text-primary
          focus:border-primary focus:ring-1 focus:ring-primary
          transition-all duration-200
          ${error ? 'border-danger' : ''}
          ${className}
        `}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-danger">{error}</p>
            )}
        </div>
    )
})

Select.displayName = 'Select'

export default Select
