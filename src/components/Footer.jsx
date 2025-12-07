const Footer = () => {
    return (
        <footer>
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                © {new Date().getFullYear()} Easy Loans - Stevencedor. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;