const Card = ({
    children,
    className = '',
    title,
    subtitle,
    action,
    noPadding = false
}) => {
    return (
        <div className={`
      glass rounded-xl overflow-hidden animate-fade-in
      ${className}
    `}>
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
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
