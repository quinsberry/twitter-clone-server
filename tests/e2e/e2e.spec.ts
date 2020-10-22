import request from "supertest";

import { app } from "../../src/app";
import {
  UserDocumentModelInterface,
  UserModel,
} from "../../src/models/UserModel";

import { fetchResp, Resp } from "../fetchTypes";

interface createdUser {
  __v: number;
  _id: string;
  confirmed: boolean;
  email: string;
  fullname: string;
  username: string;
}

describe("GET, /users (Getting all users)", () => {
  it("200, 'success'", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("200, 'success', response has 'data' property", async () => {
    const response: fetchResp<Resp<UserDocumentModelInterface>> = await request(
      app
    ).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body).toHaveProperty("data");
  });
});

describe("POST, /auth/signup (Create new user)", () => {
  it("201, 'success', response return created user ", async () => {
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
    expect(response.body.data).not.toHaveProperty("password");
    expect(response.body.data).not.toHaveProperty("confirmHash");

    if (response.status === 201) {
      UserModel.deleteOne({ _id: response.body.data?._id }, (err) => {
        expect(err).toBe(null);
      });
    }
  });
});
