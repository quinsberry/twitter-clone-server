import { body } from "express-validator";

export const registerValidations = [
  body("email", "Email is required")
    .isEmail()
    .isLength({ min: 10, max: 40 })
    .withMessage("Your email has to contain 10-40 symbols"),
  body("fullname", "Name is required")
    .isString()
    .isLength({ min: 1, max: 40 })
    .withMessage("Fullname has to contain 2-40 symbols"),
  body("username", "Username is required")
    .isString()
    .isLength({ min: 1, max: 40 })
    .withMessage("Username has to contain 2-40 symbols"),
  body("password", "Password is required")
    .isString()
    .isLength({ min: 6, max: 40 })
    .withMessage("Password has to contain 6-40 symbols")
    .custom((value, { req }) => {
      if (value !== req.body.password2) {
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
];
