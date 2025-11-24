import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

// Verifica acceso sin token a endpoint protegido
describe("Protected Endpoint (e2e)", () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rechaza sin token (401) en endpoint de aprobación de candidato", async () => {
    const res = await request(server).patch("/candidates/1/approve");
    expect(res.status).toBe(401); // JwtAuthGuard debe impedir acceso
  });
});
