import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user info for later use
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUser;
