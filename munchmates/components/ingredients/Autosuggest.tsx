// munchmates/components/ingredients/Autosuggest.tsx
// Autosuggest input component.
// Filters a list of strings based on user input and displays
// a clickable dropdown of suggestions.

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export default function Autosuggest({ data, query, setQuery }: { data: string[], query: string, setQuery: (query: string) => void }) {
    const [filteredData, setFilteredData] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    useEffect(() => {
        if (query === '') {
            setFilteredData([]);
        } else {
            const lowerQuery = query.toLowerCase();
            setFilteredData(data.filter(item => item.toLowerCase().includes(lowerQuery)));
        }
    }, [query, data]);
    const background = getComputedStyle(document.body).backgroundColor;

    return (
        <div className="relative">
            <Input
                type="text"
                id="ingredient-autosuggest"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                placeholder="Enter ingredient..."
            />
            {filteredData.length > 0 && isFocused && (
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
                        backgroundColor: background,}}
                >
                    {filteredData.map((item, index) => (
                        <li
                            key={index}
                            style={{ padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur from firing
                                setQuery(item);
                                setFilteredData([]);
                                setIsFocused(false);
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
