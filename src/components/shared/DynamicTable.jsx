import PropTypes from 'prop-types';

const DynamicTable = ({ columns, data, renderActions = null, renderColumnContent = {}, onRowContextMenu, parentClass= '' }) => {
    return (
        <table className={`dynamic-table ${parentClass}`}>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.key} className={column.className || ''}>
                            {column.label}
                        </th>
                    ))}
                    {renderActions && <th className='width-25p'>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {data?.map((row, rowIndex) => (
                    <tr
                        key={row.id}
                        ref={row.ref || null} // Apply ref only if provided
                        className={row.rowClass || ''}
                        onContextMenu={(event) => onRowContextMenu && onRowContextMenu(event, row)} // Optional context menu handler
                    >
                        {columns.map((column) => (
                            <td key={column.key} className={column.classNametd || ''}>
                                {column.render
                                    ? column.render(row) // Use custom render function if available
                                    : renderColumnContent && renderColumnContent[column.key]
                                        ? renderColumnContent[column.key](row, rowIndex) // Use custom rendering from prop if provided
                                        : row[column.key]}
                            </td>
                        ))}
                        {renderActions && (
                            <td>
                                {renderActions(row)}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


DynamicTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    renderActions: PropTypes.func,
    renderColumnContent: PropTypes.objectOf(PropTypes.func),
    onRowContextMenu: PropTypes.func, // Optional prop for context menu
    parentClass: PropTypes.string,
};

export default DynamicTable;