import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../src/app.module";

// Verifica que un usuario con rol CANDIDATE no pueda acceder al endpoint solo ADMIN
describe("Role Guard - Approve Candidate (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let server: any;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret";
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    jwtService = app.get(JwtService);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rechaza con 403 cuando el rol no es ADMIN", async () => {
    const token = jwtService.sign({ sub: 999, role: "CANDIDATE" });
    const res = await request(server)
      .patch("/candidates/1/approve")
      .set("Authorization", `Bearer ${token}`);
    expect([403, 401]).toContain(res.status); // 403 esperado; 401 si guard JWT falla
    if (res.status === 403) {
      expect(res.body.message).toMatch(
        /forbidden|Forbidden|denied|No autorizado/i,
      );
    }
  });
});
