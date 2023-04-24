const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const signup = async (req, res) => {
  // First, we check if email is already in use. If it is, we throw custom error message about email in use.
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email is already in use");
  }

  // const salt = await bcrypt.genSalt(10);
  // for hashing to become unhackable, we use salt - it's the set of random symbols. Then we can add it as the 2nd argument in bcrypt.hash(), but nowadays we can just spare it and set the 2nd argument of hash() to 10
  const hashPassword = await bcrypt.hash(password, 10);

  // If email is unique, we make a request to create a new user;
  const newUser = await User.create({ ...req.body, password: hashPassword });
  if (!newUser) {
    throw HttpError(422, "Unprocessable Content");
  }

  res.status(201).json({
    name,
    email,
  });
};

module.exports = {
  signup: ctrlWrapper(signup),
};
