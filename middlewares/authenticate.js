const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError } = require("../helpers");
const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  // Checking authorization property in headers. All headers in Node.js we type in lowercase.
  // We use authorization = "" in case if no authorization header is sent, it'll be undefined, and we can't split "undefined"
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    // throw or next?
    next(HttpError(401, "Unauthorized")); // next stops function execution
  }

  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    // If the token is valid and not expired, the user could still have been deleted from the DB. That's why we check if the user with this id exists in DB.
    const user = await User.findById(id);
    if (!user) {
      next(HttpError(401, "Unauthorized"));
    }
    next();
  } catch {
    next(HttpError(401, "Unauthorized"));
  }

  console.log("authorization:", authorization);
  next();
};

module.exports = authenticate;
