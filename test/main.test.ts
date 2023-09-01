import {Test, TestingModule} from "@nestjs/testing";
import {INestApplication} from "@nestjs/common";
import {AppModule} from "../src/app/app.module";
import {appSettings} from "../src/app/app.settings";

export async function createNestAppTest(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
    }).compile();

    const app = moduleFixture.createNestApplication();
    appSettings(app)
    return app;
}