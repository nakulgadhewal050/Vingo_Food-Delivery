// userRoute.js
import express from "express";
import isAuth from "../middleware/isAuth.js";
import User from "../models/usermodel.js";

const meRouter = express.Router();

meRouter.get("/me", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

export default meRouter;
