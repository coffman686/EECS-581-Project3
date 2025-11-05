// app/page.tsx

'use client';

const RecipeCard = ({ title, imageUrl }: { title: string; imageUrl: string }) => (
    <div style={{
        backgroundColor: 'var(--background)',
        border: '1px solid var(--primary-accent)',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }}>
        <img src={imageUrl} alt={title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
        <h3 style={{ marginTop: '1rem', fontFamily: 'var(--font-heading)' }}>{title}</h3>
        <div style={{ marginTop: '1rem' }}>
            <button style={{
                marginRight: '0.5rem',
                backgroundColor: 'var(--primary-accent)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
            }}>Save</button>
            <button style={{
                backgroundColor: 'transparent',
                color: 'var(--primary-accent)',
                border: '1px solid var(--primary-accent)',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
            }}>View</button>
        </div>
    </div>
);

export default function Home() {
    // Mock data for recipe cards

    const recipes = [
        { title: 'Spaghetti Carbonara', imageUrl: 'https://via.placeholder.com/150' },
        { title: 'Chicken Alfredo', imageUrl: 'https://via.placeholder.com/150' },
        { title: 'Chicken Tikka Masala', imageUrl: 'https://via.placeholder.com/150' },
        { title: 'Vegetable Stir Fry', imageUrl: 'https://via.placeholder.com/150' },
    ];

    return (
        <div>
            <h2 style={{ textAlign: 'center', margin: '2rem 0', fontFamily: 'var(--font-heading)' }}>Search Results / Recommendations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {recipes.map((recipe, index) => (
                    <RecipeCard key={index} title={recipe.title} imageUrl={recipe.imageUrl} />
                ))}
            </div>
        </div>
    );
};
