const jwt = require('jsonwebtoken');

// # custom header
// module.exports = (req, res, next) => {
//     const token = req.header('x-auth-token');
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.user;
//         next();
//     } catch (err) {
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// };


// Bearer Token header
module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied' });
    }

    // Extract token from Authorization header
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
