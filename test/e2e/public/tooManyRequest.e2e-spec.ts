import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import request, {SuperTest, Test} from "supertest";
import {createNestAppTest} from "../../main.test";
import {
    createUser,
    createUsers,
    loginAndGetPairTokens,
    saveUser,
    saveUsers
} from "../../helpers/factories/users.factory";
import {authLoginPath} from "../../helpers/mocks/paths.mock";

describe('Too many request test (e2e)', () => {
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

    describe.skip(`8 POST ${authLoginPath}: (429)`, () => {
        it('8.1 should return 429 after 5 request in 10 seconds ', async () => {
            const users = createUsers(5);
            await saveUsers(instance, users);
            await loginAndGetPairTokens(instance, users);

            const user = createUser();
            await saveUser(instance, user);

            await instance.post(authLoginPath)
                .send({
                    loginOrEmail: user.login,
                    password: user.password
                })
                .expect(HttpStatus.TOO_MANY_REQUESTS);
        });
    });
})