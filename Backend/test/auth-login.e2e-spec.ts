import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";

describe("Auth Unified Login (e2e minimal)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rechaza credenciales inválidas", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ correo: "inexistente@example.com", contrasena: "wrong" });
    expect(res.status).toBe(401);
  });
});
