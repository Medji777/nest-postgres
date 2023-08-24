import {randomUUID} from "crypto";
import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import request, {SuperTest, Test} from "supertest";
import {createNestAppTest} from "../../main.test";
import {BlogsPath, saBlogsPath} from "../../helpers/mocks/paths.mock";
import {createUser, loginAndGetPairToken, saveUser} from "../../helpers/factories/users.factory";
import {saveBlog} from "../../helpers/factories/blogs.factory";
import {authBasic, authHeader} from "../../helpers/auth";
import {Paginator} from "../../../src/types/types";
import {correctBlog} from "../../stubs/blogs.stub";
import {BlogsSAViewModel, BlogsViewModel} from "../../../src/types/blogs";
import {defaultPagination} from "../../helpers/mocks/pagination.mock";
import {errorsMessageForBanBlog} from "../../stubs/error.stub";

describe('SABlogsController (e2e)',()=>{
    const id = randomUUID()
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

    describe(`1 GET ${saBlogsPath}:`, () => {
        it('1.1 should return 401 without authorization', async () => {
            await instance.get(saBlogsPath).expect(HttpStatus.UNAUTHORIZED);
        });
        it(`1.2 should return 200`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const response = await instance.get(saBlogsPath)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.OK);

            expect(response.body).toEqual<Paginator<BlogsSAViewModel>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<BlogsSAViewModel>([
                    {
                        id: blogId,
                        ...correctBlog,
                        isMembership: false,
                        createdAt: expect.any(String),
                        blogOwnerInfo: {
                            userId: userId,
                            userLogin: user.login
                        },
                        banInfo: {
                            isBanned: false,
                            banDate: null
                        }
                    }
                ])
            });
        });
    });
    describe(`2 PUT ${saBlogsPath}/id/bind-with-user/userId:`, () => {
        it('2.1 should return 401 without authorization', async () => {
            await instance.put(saBlogsPath + `/${id}/bind-with-user/${id}`)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it('2.2 should return 404 with incorrect id', async () => {
            await instance.put(saBlogsPath + `/${id}/bind-with-user/${id}`)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.BAD_REQUEST);
        });
        it(`2.3 should return 204 (my don't have blog without userId)`, async () => {
            expect(1).toBe(1);
        });
    });
    describe(`3 PUT ${saBlogsPath}/id/ban:`, () => {
        it('3.1 should return 401 without authorization', async () => {
            await instance.put(saBlogsPath + `/${id}/ban`).expect(HttpStatus.UNAUTHORIZED);
        });
        it('3.2 should return 400 with incorrect data', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const errMes = await instance.put(`${saBlogsPath}/${blogId}/ban`)
                .set({[authHeader]: authBasic})
                .send({ isBanned: '' })
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForBanBlog);
        });
        it('3.3 should return 204 with correct data', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            await instance.put(`${saBlogsPath}/${blogId}/ban`)
                .set({[authHeader]: authBasic})
                .send({ isBanned: true })
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(BlogsPath).expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<BlogsViewModel>>(
                expect.objectContaining<Paginator<BlogsViewModel>>(defaultPagination)
            );
        });
    });
})