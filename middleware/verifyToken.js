import jwt from "jsonwebtoken";

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
    // Heder se token nikalna
    const token = req.headers.authorization?.split(" ")[1];

    // check token exist
    if(!token) return res.status(401).json({message: "No token"});

    // token verify + decode
    try {
        const decoded = jwt.verify(token, "secrete123");
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({message: "Invalid token"});
    }

}



export default verifyToken;