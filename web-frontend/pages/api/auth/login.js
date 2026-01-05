
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { password } = req.body;
    const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === CORRECT_PASSWORD) {
        // Determine token based on environment secret or fallback
        // In a real app we would sign a JWT here
        const token = Buffer.from(CORRECT_PASSWORD).toString('base64');

        return res.status(200).json({
            success: true,
            token: `breev-${token}`,
            user: { name: 'Admin', role: 'admin' }
        });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
}
