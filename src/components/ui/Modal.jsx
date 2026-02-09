import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    }

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
        relative w-full ${sizes[size]} mx-4
        glass rounded-xl shadow-2xl
        animate-scale-in
      `}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-surface-light transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
