// app/grocery-list/page.tsx

'use client';

const GroceryList = () => {
    const ingredients = [
        { name: 'Ingredient 1', checked: false },
        { name: 'Ingredient 2', checked: true },
        { name: 'Ingredient 3', checked: false },
    ];

    return (
        <div>
            <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>Grocery List</h2>
            <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid var(--foreground)', padding: '1rem', borderRadius: '8px' }}>
                {ingredients.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input type="checkbox" checked={item.checked} readOnly style={{ marginRight: '0.5rem' }} />
                        <label>{item.name}</label>
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button style={{ marginRight: '1rem' }}>Share List</button>
                <button style={{ marginRight: '1rem' }}>Download</button>
                <button>Clear Checked Items</button>
            </div>
        </div>
    );
};

export default GroceryList;
