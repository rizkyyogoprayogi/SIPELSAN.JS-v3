const Card = ({
    children,
    className = '',
    title,
    subtitle,
    action,
    noPadding = false
}) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {action && action}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    )
}

export default Card
