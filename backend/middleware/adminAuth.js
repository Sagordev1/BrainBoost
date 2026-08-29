const jwt = require("jsonwebtoken");


function requireAdmin(req, res, next) {
  const token =  req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized." });
  }

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Unauthorized." });
  }
}

module.exports =  { requireAdmin };










