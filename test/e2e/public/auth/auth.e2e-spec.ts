import {createNestAppTest} from "../../../main.test";
import request, {SuperTest, Test} from "supertest";
import {
    authLoginPath,
    authLogoutPath, authMePath,
    authNewPasswordPath,
    authPasswordRecoveryPath,
    authRefreshTokenPath,
    authRegistrationConfirmationPath,
    authRegistrationEmailResendingPath,
    authRegistrationPath, saUsersPathTest
} from "../../../helpers/mocks/paths.mock";
import {createUser, loginAndGetPairToken, saveUser} from "../../../helpers/factories/users.factory";
import {correctBadLogin, incorrectLogin} from "../../../stubs/users.stub";
import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import {
    errorsMessageForConfirmation,
    errorsMessageForEmailResending,
    errorsMessageForIncorrectLoginV2,
    errorsMessageForNewPassword,
    errorsMessageForPasswordRecovery,
    errorsMessageForRegistration
} from "../../../stubs/error.stub";
import {authBasic, authHeader, bearerAccessToken} from "../../../helpers/auth";
import {UsersMeView} from "../../../../src/types/auth";
import {
    badEmailForResending,
    incorrectCodeConfirmation,
    incorrectEmailForResending,
    incorrectNewPassword
} from "../../../stubs/auth.stub";
import {UsersSqlType} from "../../../../src/types/sql/user.sql";
import {TokenViewModel} from "../../../helpers/types";

describe('AuthController new (e2e)', () => {

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

    describe(`1 POST ${authLoginPath}:`, () => {
        it(`1.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            await instance.post(authLoginPath)
                .send(correctBadLogin)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it('1.2 should return 401 with incorrect data', async () => {
            const errMes = await instance.post(authLoginPath)
                .send(incorrectLogin)
                .expect(HttpStatus.UNAUTHORIZED);
            expect(errMes.body).toEqual({
                ...errorsMessageForIncorrectLoginV2,
                timestamp: expect.any(String)
            });
        });
        it('1.3 should return 200 with correct data', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const res = await instance.post(authLoginPath)
                .send({
                    loginOrEmail: user.login,
                    password: user.password
                })
                .expect(HttpStatus.OK);
            expect(res.body).toEqual<TokenViewModel>({
                accessToken: expect.any(String)
            });
            expect(res.headers['set-cookie'][0].split(';')[0]).toEqual(
                expect.any(String)
            );
        });
    });
    describe(`2 GET ${authMePath}:`, () => {
        it('2.1 should return 401 without authorization', async () => {
            await instance.get(authMePath).expect(HttpStatus.UNAUTHORIZED);
        });
        it('2.2 should return 200 with correct data', async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const res = await instance.get(authMePath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.OK);
            expect(res.body).toEqual<UsersMeView>({
                email: user.email,
                login: user.login,
                userId
            });
        });
    });
    describe(`3 POST ${authRegistrationPath}:`, () => {
        it('3.1 should return 400 with invalid data (the same login and email)', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const res = await instance.post(authRegistrationPath)
                .send(user)
                .expect(HttpStatus.BAD_REQUEST);
            expect(res.body).toEqual(errorsMessageForRegistration);
        });
        it('3.2 should return 204 with correct data', async () => {
            const user = createUser();
            await instance.post(authRegistrationPath)
                .send(user)
                .expect(HttpStatus.NO_CONTENT);
        });
    });
    describe(`4 POST ${authRegistrationConfirmationPath}:`, () => {
        it('4.1 should return 400 with incorrect data', async () => {
            const res = await instance.post(authRegistrationConfirmationPath)
                .send(incorrectCodeConfirmation)
                .expect(HttpStatus.BAD_REQUEST);
            expect(res.body).toEqual(errorsMessageForConfirmation);
        });
        it('4.2 should return 204 with correct code', async () => {
            const user = createUser();
            await instance.post(authRegistrationPath)
                .send(user)
                .expect(HttpStatus.NO_CONTENT)

            const res = await instance.get(saUsersPathTest)
                .set({[authHeader]: authBasic})
                .query({email: user.email})
                .expect(HttpStatus.OK);

            const userData: UsersSqlType = res.body;
            await instance.post(authRegistrationConfirmationPath)
                .send({code: userData.emailConfirmationCode})
                .expect(HttpStatus.NO_CONTENT)
        });
    });
    describe(`5 POST ${authRegistrationEmailResendingPath}:`, () => {
        it('5.1 should return 400 with incorrect data', async () => {
            const errMes = await instance.post(authRegistrationEmailResendingPath)
                .send(incorrectEmailForResending)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForEmailResending);
        });
    });
    describe(`6 POST ${authRefreshTokenPath}:`, () => {
        it('6.1 should return 401 if refresh-token is wrong', async () => {
            await instance.post(authRefreshTokenPath)
                .set('Cookie', 'bad refresh token')
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it('6.2 should return 200 with correct refresh token', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const res = await instance.post(authRefreshTokenPath)
                .set('Cookie', pairToken.refreshToken)
                .expect(HttpStatus.OK);
            expect(res.body).toEqual({
                accessToken: expect.any(String)
            });
            expect(res.headers['set-cookie'][0].split(';')[0]).toEqual(
                expect.any(String)
            );
        });
    });
    describe(`7 POST ${authLogoutPath}:`, () => {
        it('7.1 should return 401 if refresh-token is wrong', async () => {
            await instance.post(authLogoutPath)
                .set('Cookie', 'bad refresh token')
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it('7.2 should return 200 with correct refresh token', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            await instance.post(authLogoutPath)
                .set('Cookie', pairToken.refreshToken)
                .expect(HttpStatus.NO_CONTENT);
        });
    });
    describe(`8 POST ${authPasswordRecoveryPath}:`, () => {
        it('8.1 should return 400 with incorrect email', async () => {
            const errMes = await instance.post(authPasswordRecoveryPath)
                .send(badEmailForResending)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForPasswordRecovery);
        });
        it('8.2 POST should return 204 with correct code', async () => {
            const getUser = async (email): Promise<UsersSqlType> => {
                const res = await instance.get(saUsersPathTest)
                    .set({[authHeader]: authBasic})
                    .query({email})
                    .expect(HttpStatus.OK);

                return res.body
            }
            const user = createUser();
            await instance.post(authRegistrationPath)
                .send(user)
                .expect(HttpStatus.NO_CONTENT)

            const userData: UsersSqlType = await getUser(user.email);

            await instance.post(authPasswordRecoveryPath)
                .send({email: userData.email})
                .expect(HttpStatus.NO_CONTENT)

            const userData2: UsersSqlType = await getUser(user.email);

            await instance.post(authNewPasswordPath)
                .send({
                    newPassword: user.password,
                    recoveryCode: userData2.passwordConfirmationCode
                })
                .expect(HttpStatus.NO_CONTENT)
        });
    });
    describe(`9 POST ${authNewPasswordPath}:`, () => {
        it('9.1 POST should return 400 with incorrect value', async () => {
            const errMes = await instance.post(authNewPasswordPath)
                .send(incorrectNewPassword)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForNewPassword);
        });
    });
})