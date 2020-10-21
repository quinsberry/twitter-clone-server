import { body } from "express-validator";

export const tweetsValidations = [
  body("text", "Tweet text is required")
    .isString()
    .isLength({ min: 1, max: 280 })
    .withMessage("Your tweet has to contain 1-280 symbols"),
];
