import { useState, useEffect } from 'react';

export default function Autosuggest({ data }: { data: string[] }) {
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState<string[]>([]);

    useEffect(() => {
        if (query === '') {
            setFilteredData([]);
        } else {
            const lowerQuery = query.toLowerCase();
            setFilteredData(data.filter(item => item.toLowerCase().includes(lowerQuery)));
        }
    }, [query, data]);

    return (
        <div style={{ position: 'relative', width: '200px' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search..."
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
            {filteredData.length > 0 && (
                <ul
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        border: '1px solid #ccc',
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        backgroundColor: 'black',
                    }}
                >
                    {filteredData.map((item, index) => (
                        <li
                            key={index}
                            style={{ padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                            onClick={() => {
                                setQuery(item);
                                setFilteredData([]);
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
