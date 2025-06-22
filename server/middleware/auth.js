import { verifyToken } from "@clerk/backend";

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    console.log("Decoded token payload:", payload);

    // Access custom claim from the payload directly (NOT payload.session.claims)
    const clerkId = payload?.clerkId;

    if (!clerkId) {
      throw new Error("Custom claim 'clerkId' not found in token");
    }

    req.user = { clerkId };
    next();
  } catch (err) {
    console.error("Clerk auth error:", err.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
