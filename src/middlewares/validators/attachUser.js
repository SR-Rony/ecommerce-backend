const attachUser = (req, res, next) => {
  try {
    const userCookie = req.cookies.user;
    if (!userCookie) {
      req.user = null;
    } else {
      req.user = JSON.parse(userCookie);
    }
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

module.exports = attachUser;