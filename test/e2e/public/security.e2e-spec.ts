import request, {SuperTest, Test} from "supertest";
import {createNestAppTest} from "../../main.test";
import {INestApplication, ServiceUnavailableException} from "@nestjs/common";

describe('SecurityDeviceController (e2e)', () => {
    let nestAppTest: INestApplication;
    let instance: SuperTest<Test>;

    beforeAll(async ()=>{
        nestAppTest = await createNestAppTest()
        if(!nestAppTest) throw new ServiceUnavailableException()
        await nestAppTest.init()
        instance = request(nestAppTest.getHttpServer())
    })

    afterAll(async ()=>{
        await nestAppTest.close()
    })

    beforeEach(async () => {
        await instance.delete('/testing/all-data');
    });
})