import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: process.env.JWT_EXPIRE } // Expiration
  );
};

export default generateToken;
