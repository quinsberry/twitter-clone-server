import { model, Schema, Document } from "mongoose";
import { UserDocumentModelInterface } from "./UserModel";

export interface TweetModelInterface {
  text: string;
  user: UserDocumentModelInterface | string;
  likes?: any;
  retweets?: any;
  replies?: any;
}

export type TweetDocumentModelInterface = TweetModelInterface & Document;

const TweetSchema = new Schema<TweetModelInterface>({
  text: {
    required: true,
    type: String,
  },
  user: {
    required: true,
    ref: "User",
    type: Schema.Types.ObjectId,
  },
  likes: Array,
  retweets: Array,
  replies: Array,
});

export const TweetModel = model<TweetDocumentModelInterface>(
  "Tweet",
  TweetSchema
);
