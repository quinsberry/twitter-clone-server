import request from "supertest";

import { UserDocumentModelInterface } from "../../../src/models/UserModel";
import { app } from "../../../src/app";

import { fetchResp, Resp } from "../../fetchTypes";

describe("UsersController, Index method (Getting all users)", () => {
  it("Status code should be 200 and response should contain 'success' status", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("Response should have a 'data' property", async () => {
    const response: fetchResp<Resp<UserDocumentModelInterface>> = await request(
      app
    ).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body).toHaveProperty("data");
  });
});
