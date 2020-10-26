import request from "supertest";

import { UserModel } from "@models/UserModel";
import { app } from "../../../src/app";

import { fetchResp, Resp } from "../../fetchTypes";

interface createdUser {
  __v: number;
  _id: string;
  confirmed: boolean;
  email: string;
  fullname: string;
  username: string;
}

describe("UsersController, Create method (Create new user)", () => {
  it("tests the post new user endpoint (Sign Up) and returns as success message", async () => {
    const data = {
      fullname: "Test user",
      username: "testuser",
      email: "testing@email.com",
      password: "Test132",
      password2: "Test132",
    };

    const response: fetchResp<Resp<createdUser>> = await request(app)
      .post("/auth/signup")
      .send(data);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("_id");
    expect(response.body.data).toHaveProperty("confirmed", false);
    expect(response.body.data).toHaveProperty("email", "testing@email.com");
    expect(response.body.data).toHaveProperty("fullname", "Test user");
    expect(response.body.data).toHaveProperty("username", "testuser");

    if (response.status === 201) {
      UserModel.deleteOne({ _id: response.body.data?._id }, (err) => {
        expect(err).toBe(null);
      });
    }
  });
});
