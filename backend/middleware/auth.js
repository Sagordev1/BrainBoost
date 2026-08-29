const jwt = require("jsonwebtoken");


function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) 
    {
    return res.status(401).json({ success: false, message: "আগে Login করো।" });
  }

  try
   {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  }
   catch (err)
    {
    return res.status(401).json({ success: false, message: "Session মেয়াদ শেষ, আবার Login করো।" });
  }
}


function attachUserIfPresent(req, _res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
    } catch (err) {
      
    }
  }
  next();
}

module.exports = { requireAuth, attachUserIfPresent };
