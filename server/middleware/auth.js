import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure this matches what you signed the token with
    req.body.clerkId = decoded.clerkId;

    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }
};

export default authUser;
