const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const { SECRET_KEY } = process.env;

const signup = async (req, res) => {
  // First, we check if email is already in use. If it is, we throw custom error message about email in use.
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email is already in use");
  }

  // const salt = await bcrypt.genSalt(10);
  // for hashing to become unhackable, we use salt - it's the set of random symbols. Then we can add it as the 2nd argument to bcrypt.hash(), but nowadays we can just spare it and set the 2nd argument of hash() to 10
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

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  // compares if password in DB is the same as password in request. If it is, it returns true.
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  // creates payload, usually it's an id. !!!It's forbidden to save secret data in payload, because it's easy to decode a token
  const payload = {
    id: user._id,
  };
  // jwt.sign() has 1st arg payload, 2nd - secret_key, 3rd - options object, like token expiration time
  console.log("id:", id);
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  // checks token expiration, and if this token was encrypted using this SECRET_KEY. Throws and error, if token is expired. that's why we should use try catch. If token is valid, it returns our payload - in our case "id" of the user.
  try {
    const { id } = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    console.log(error.message);
  }

  res.json({ token });
};

module.exports = {
  signup: ctrlWrapper(signup),
  login: ctrlWrapper(login),
};
