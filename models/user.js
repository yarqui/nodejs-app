const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
const subscriptionValues = ["starter", "pro", "business"];

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      match: emailRegex,
      unique: true, // prevents from adding a duplicate email to the database
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      minLength: 6,
      required: [true, "Password is required"],
    },
    subscription: {
      type: String,
      enum: subscriptionValues,
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const signupSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...subscriptionValues)
    .required(),
});

const schemas = {
  signupSchema,
  loginSchema,
  updateSubscriptionSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
