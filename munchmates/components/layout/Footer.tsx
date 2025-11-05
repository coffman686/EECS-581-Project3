// components/Footer.tsx

const Footer = () => {
    return (
        <footer style={{ borderTop: '1px solid var(--foreground)', padding: '1rem', textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                &copy; {new Date().getFullYear()} MunchMates. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;