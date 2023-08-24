import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import {createNestAppTest} from "../../main.test";
import {bloggerUsersPath, CommentsPath, PostsPath} from "../../helpers/mocks/paths.mock";
import {
    createUser,
    createUsers,
    loginAndGetPairToken, loginAndGetPairTokens,
    saveUser,
    saveUsers
} from "../../helpers/factories/users.factory";
import {saveBlog} from "../../helpers/factories/blogs.factory";
import {authHeader, bearerAccessToken} from "../../helpers/auth";
import {LikeStatus, Paginator} from "../../../src/types/types";
import {defaultPagination} from "../../helpers/mocks/pagination.mock";
import {UsersBloggerViewModel} from "../../../src/types/users";
import {correctBlogBan, incorrectBlogBan} from "../../stubs/blogger.users.stub";
import {errorsMessageForBloggerBanUser} from "../../stubs/error.stub";
import {savePost} from "../../helpers/factories/posts.factory";
import {correctComment} from "../../stubs/comments.stub";
import request, {SuperTest, Test} from "supertest";

describe('BloggerUsersController (e2e)', () => {
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

    describe(`1 GET ${bloggerUsersPath}:`, () => {
        it(`1.1 should return 401 without authorization`, async () => {
            await instance.get(bloggerUsersPath + '/blog/999')
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`1.2 should return 200 with correct data`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const blogBan = { ...correctBlogBan, blogId };

            await instance.put(bloggerUsersPath + '/' + userId + '/ban')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(blogBan)
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(bloggerUsersPath + '/blog' + '/' + blogId)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<UsersBloggerViewModel>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<UsersBloggerViewModel>([
                    {
                        id: expect.any(String),
                        login: user.login,
                        banInfo: {
                            isBanned: blogBan.isBanned,
                            banDate: expect.any(String),
                            banReason: blogBan.banReason
                        }
                    }
                ])
            });
        });
    });
    describe(`2 PUT ${bloggerUsersPath}/id/ban:`, () => {
        it(`2.1 should return 401 without authorization`, async () => {
            await instance.put(bloggerUsersPath + '/999/ban')
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`2.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            const errMes = await instance
                .put(bloggerUsersPath + '/' + userId + '/ban')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(incorrectBlogBan)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForBloggerBanUser);
        });
        it(`2.3 should return 204 with correct data`, async () => {
            const likeInfo = {likeStatus: LikeStatus.Like}
            const users = createUsers(3);
            const userIds = await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            const blogId = await saveBlog(instance, pairTokens[0].accessToken);
            const postId = await savePost(instance, pairTokens[0].accessToken, blogId);
            const blogBan = { ...correctBlogBan, blogId: blogId };

            await instance.put(bloggerUsersPath + '/' + userIds[1] + '/ban')
                .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
                .send(blogBan)
                .expect(HttpStatus.NO_CONTENT);

            await instance.post(PostsPath + '/' + postId + '/comments')
                .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
                .send(correctComment)
                .expect(HttpStatus.FORBIDDEN);

            await instance.put(PostsPath + '/' + postId + '/like-status')
                .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
                .send(likeInfo)
                .expect(HttpStatus.FORBIDDEN);

            const response = await instance.post(PostsPath + '/' + postId + '/comments')
                .set(authHeader, bearerAccessToken(pairTokens[2].accessToken))
                .send(correctComment)
                .expect(HttpStatus.CREATED);

            await instance.put(PostsPath + '/' + postId + '/like-status')
                .set(authHeader, bearerAccessToken(pairTokens[2].accessToken))
                .send(likeInfo)
                .expect(HttpStatus.NO_CONTENT);

            await instance.put(CommentsPath + '/' + response.body.id + '/like-status')
                .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
                .send(likeInfo)
                .expect(HttpStatus.FORBIDDEN);

            await instance.put(CommentsPath + '/' + response.body.id + '/like-status')
                .set(authHeader, bearerAccessToken(pairTokens[2].accessToken))
                .send(likeInfo)
                .expect(HttpStatus.NO_CONTENT);
        });
    });
})