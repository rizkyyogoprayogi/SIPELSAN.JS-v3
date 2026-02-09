const Table = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'Tidak ada data'
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-text-secondary">Memuat data...</span>
                </div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                <svg className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="px-4 py-3 text-left text-sm font-semibold text-text-secondary"
                                style={{ width: column.width }}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-border/50 hover:bg-surface-light/30 transition-colors"
                        >
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-4 py-3 text-sm">
                                    {column.render ? column.render(row) : row[column.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table
