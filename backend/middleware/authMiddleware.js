import jwt from 'jsonwebtoken';


const verifyToken = (req, res, next) => {
 const token = req.cookies.token;
if (!token) {
    return res.status(401).json({ message: "Authentication failed: No token provided." });
  }
const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    console.error('ACCESS_TOKEN_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: "Server configuration error: JWT secret missing." });
  }

jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ message: "Authentication failed: Invalid token." });
    }
req.user = {
      id: decoded.userid,
      username: decoded.username
    };
    next();
  });

}

export default verifyToken;