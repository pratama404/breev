export function verifyAuth(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.split(' ')[1];

    // In a real app, verify JWT signature.
    // Here we verify the base64 encoded password against env.
    const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const expectedToken = Buffer.from(CORRECT_PASSWORD).toString('base64');

    // We prefixed the token with "breev-" in login.js
    const validToken = `breev-${expectedToken}`;

    return token === validToken;
}
