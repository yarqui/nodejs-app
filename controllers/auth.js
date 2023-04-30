const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const signup = async (req, res) => {
  // First, we check if email is already in use. If it is, we throw custom error message about email in use.
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email is already in use");
  }

  // const salt = await bcrypt.genSalt(10);
  // for hashing to become unhackable, we use salt - it's the set of random symbols. Then we can add it as the 2nd argument to bcrypt.hash(), but nowadays we can just spare it and set the 2nd argument of hash() to 10
  const hashedPassword = await bcrypt.hash(password, 10);

  // returns a string -> link to generated avatar. 1st argument is email we associate avatar with, 2nd is options object to customize the Gravatar URL
  const avatarURL = gravatar.url(email);

  // If email is unique, we make a request to create a new user;
  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
  });
  if (!newUser) {
    throw HttpError(422, "Unprocessable Content");
  }

  res.status(201).json({
    user: {
      email,
      subscription: "starter",
    },
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
  // creates a payload to generate token, usually it's an id. !!!It's forbidden to save secret data in payload, because it's easy to decode a token
  const payload = {
    id: user._id,
  };
  // jwt.sign() has 1st arg - payload, 2nd - secret_key, 3rd - options object, like token expiration time
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  // adds token field to user document
  await User.findByIdAndUpdate(user._id, { token });

  // checks token expiration, and whether this token was encrypted using this SECRET_KEY. Throws and error, if token is expired. that's why we should use try catch. If token is valid, it returns our payload - in our case "id" of the user.
  try {
    const { id } = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    console.log(error.message);
  }

  res.status(200).json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

// we already have a req.user after authentication middleware, so we just take it and send it in response
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).json();
};

const updateUserSubscription = async (req, res) => {
  const { _id } = req.user;

  if (!req.body) {
    throw HttpError(400, "Missing field: subscription");
  }

  const result = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
    select: "-createdAt -updatedAt",
  });

  if (!result) {
    throw HttpError(404);
  }

  res.status(200).json(result);
};

const updateUserAvatar = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    throw HttpError(400, "Missing the file to upload");
  }

  // path has a URL ❗WITH file extension, where the uploaded file came from (device)
  // original name is the name of the uploaded file ❗WITH extension
  // in req.file we have the uploaded file. It doesn't go to req.body
  console.log("req.file: ", req.file);
  console.log("req.file.path: ", req.file.path);
  console.log("typeof req.file.path: ", typeof req.file.path);
  const { path: tempUpload, originalName } = req.file;

  // destination path + name
  const destinationUpload = path.join(avatarsDir, originalName);

  // fs.rename can also move files, not just rename it. fs.rename(oldPath, newPath)
  console.log("tempUpload:", tempUpload);
  await fs.rename(tempUpload, destinationUpload);

  const avatarURL = path.join("avatars", originalName);
  console.log("avatarURL:", avatarURL);

  const user = await User.findByIdAndUpdate(
    _id,
    { avatarURL },
    {
      new: true,
      select: "email avatarURL",
    }
  );

  if (!user) {
    throw HttpError(404);
  }

  res.status(200).json(avatarURL);
};

module.exports = {
  signup: ctrlWrapper(signup),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateUserSubscription: ctrlWrapper(updateUserSubscription),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
};
