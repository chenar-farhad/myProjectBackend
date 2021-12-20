import { Router } from "express";
import jwt from "jsonwebtoken";
import winston from "winston";
import UserModel from "../models/users.model.js";
import userValidation from "../validations/users.validate.js";

const route = Router();

/*------- LOGIN --------*/

route.post("/login", async (req, res) => {
  //get the email and password from body
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username, password });

  //if user exists
  if (user) {
    //generate token
    const token = jwt.sign(JSON.stringify(user), process.env.JWT_PRIVATE_KEY);
    res.json({ token });
  } else {
    //show error
    res.status(400).json("ناوی بەکارهێنەر یان وشەی نیهێنی هەڵەیە");
  }
});

/*------- REGISTER --------*/
route.post("/register", async (req, res) => {
  try {
    await userValidation.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const user = new UserModel(req.body);
  try {
    await user.save();
    winston.info(
      `Register new user, Email:\"${user.email}\" and Username:\"${user.username}\" and Password:\"${user.password}\" Role:\"${user.role}\"`
    );
  } catch (error) {
    winston.error(error.message);
    return res.status(500).json("Unknown error happened!");
  }

  res.json("بەسەرکەوتووی هەژمارەکەت درووستکرا");
});

export default route;
