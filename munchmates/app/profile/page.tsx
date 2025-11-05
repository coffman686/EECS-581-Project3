// app/profile/page.tsx

'use client';

const ProfilePage = () => {
    return (
        <div>
            <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>User Profile</h2>
            <form style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid var(--foreground)', padding: '2rem', borderRadius: '8px' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
                    <input type="text" id="name" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                    <input type="email" id="email" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dietary Preferences:</label>
                    <input type="text" placeholder="e.g., Vegetarian, Gluten-Free" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Favorite Cuisines:</label>
                    <input type="text" placeholder="e.g., Italian, Mexican" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Allergies:</label>
                    <input type="text" placeholder="e.g., Nuts, Dairy" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Save Settings
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;