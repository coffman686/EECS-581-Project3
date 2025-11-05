// app/meal-planner/page.tsx

'use client';

const MealPlanner = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div>
            <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>Week of [MM/DD - MM/DD]</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', border: '1px solid var(--foreground)', padding: '1rem', borderRadius: '8px' }}>
                {days.map((day) => (
                    <div key={day} style={{ borderRight: '1px solid var(--foreground)', padding: '1rem', textAlign: 'center' }}>
                        <strong>{day}</strong>
                        <button style={{ marginTop: '1rem' }}>+ Add Recipe</button>
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button style={{ marginRight: '1rem' }}>Generate Grocery List</button>
                <button>Save Plan</button>
            </div>
        </div>
    );
};

export default MealPlanner;