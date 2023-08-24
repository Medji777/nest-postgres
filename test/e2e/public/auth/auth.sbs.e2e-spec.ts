import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import request, {SuperTest, Test} from "supertest";
import {createNestAppTest} from "../../../main.test";
import {
    authLoginPath,
    authRegistrationConfirmationPath,
    authRegistrationEmailResendingPath,
    authRegistrationPath,
    saUsersPathTest
} from "../../../helpers/mocks/paths.mock";
import {authBasic} from "../../../helpers/auth";
import {UsersSqlType} from "../../../../src/types/sql/user.sql";
import {fieldData} from "../../../helpers/types";
import {createAuthData, createUser} from "../../../helpers/factories/users.factory";

describe('Registration user steps',()=>{

    let nestAppTest: INestApplication;
    let instance: SuperTest<Test>;

    beforeAll(async ()=>{
        nestAppTest = await createNestAppTest()
        if(!nestAppTest) throw new ServiceUnavailableException()
        await nestAppTest.init()
        instance = request(nestAppTest.getHttpServer())
        await instance.delete('/testing/all-data')
    })

    afterAll(async ()=>{
        await nestAppTest.close()
    })

    let code: fieldData = null;
    let accessToken: fieldData = null;

    const regUser = createUser();
    const authData = createAuthData();

    it('should create new user and send confirmation email with code',async () => {
        await instance.post(authRegistrationPath)
            .send(regUser)
            .expect(HttpStatus.NO_CONTENT)
    })
    it('should return error if email or login already exist',async () => {
        await instance.post(authRegistrationPath)
            .send(regUser)
            .expect(HttpStatus.BAD_REQUEST)
    })
    it('should send email with new code if user exists but not confirmed yet',async () => {
        await instance.post(authRegistrationEmailResendingPath)
            .send({email: regUser.email})
            .expect(HttpStatus.NO_CONTENT)
    })
    it('should confirm registration by email',async () => {
        const data = await instance.get(saUsersPathTest)
            .set({Authorization: authBasic})
            .query({email: regUser.email})
            .expect(HttpStatus.OK);

        const user: UsersSqlType = data.body;
        code = user.emailConfirmationCode;
        await instance.post(authRegistrationConfirmationPath)
            .send({code})
            .expect(HttpStatus.NO_CONTENT)
    })
    it('should return error if code already confirmed',async () => {
        await instance.post(authRegistrationConfirmationPath)
            .send({code})
            .expect(HttpStatus.BAD_REQUEST)
    })
    it('should return error if email already confirmed',async () => {
        await instance.post(authRegistrationEmailResendingPath)
            .send({email: regUser.email})
            .expect(HttpStatus.BAD_REQUEST)
    })
    it('should sign in user',async ()=>{
        const data = await instance.post(authLoginPath)
            .send(authData)
            .expect(HttpStatus.OK)
        expect(data.body.accessToken).not.toBeUndefined()
        accessToken = data.body.accessToken
    })
})