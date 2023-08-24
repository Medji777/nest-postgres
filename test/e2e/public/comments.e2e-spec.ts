import {randomUUID} from "crypto";
import request, {SuperTest, Test} from "supertest";
import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import {authHeader, bearerAccessToken} from "../../helpers/auth";
import {
    createUser,
    createUsers,
    loginAndGetPairToken, loginAndGetPairTokens,
    saveUser,
    saveUsers
} from "../../helpers/factories/users.factory";
import {savePost} from "../../helpers/factories/posts.factory";
import {saveComment} from "../../helpers/factories/comments.factory";
import {saveBlog} from "../../helpers/factories/blogs.factory";
import {correctComment, correctCommentNew, inCorrectComment} from "../../stubs/comments.stub";
import {badCommentLikeStatus, correctCommentLikeStatus} from "../../stubs/commentsLike.stub";
import {
    errorsMessageForIncorrectComment,
    errorsMessageForIncorrectCommentLike
} from "../../stubs/error.stub";
import {CommentsPath, PostsPath} from "../../helpers/mocks/paths.mock";
import {LikeStatus, Paginator} from "../../../src/types/types";
import {CommentViewModel} from "../../../src/types/comments";
import {defaultPagination} from "../../helpers/mocks/pagination.mock";
import {defaultLikesInfo} from "../../helpers/mocks/likesInfo.mock";
import {createNestAppTest} from "../../main.test";


describe('CommentsController (e2e)', () => {
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

    describe(`1 GET ${CommentsPath}/id:`, () => {
        it(`1.1 should return 404 if comment don't exist`, async () => {
            await instance.get(`${CommentsPath}/${id}`).expect(HttpStatus.NOT_FOUND);
        });
        it(`1.2 should return 200 and comments by id`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            const response = await instance.get(`${CommentsPath}/${commentId}`).expect(HttpStatus.OK);
            expect(response.body).toEqual<CommentViewModel>({
                id: commentId,
                ...correctComment,
                commentatorInfo: {
                    userId: userId,
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: defaultLikesInfo
            });
        });
    });
    describe(`2 PUT ${CommentsPath}/id:`, () => {
        it(`2.1 should return 401 without authorization`, async () => {
            await instance.put('/comments/999')
                .send(correctCommentNew)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`2.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            const errMes = await instance.put(`${CommentsPath}/${commentId}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(inCorrectComment)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectComment);
        });
        it(`2.3 should return 404 for not existing comment`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.put(`${CommentsPath}/${id}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctCommentNew)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`2.4 should return 403 with incorrect token`, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            const blogId = await saveBlog(instance, pairTokens[0].accessToken);
            const postId = await savePost(instance, pairTokens[0].accessToken, blogId);
            const commentId = await saveComment(
                instance,
                pairTokens[0].accessToken,
                postId
            );

            await instance.put(`${CommentsPath}/${commentId}`)
                .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
                .send(correctCommentNew)
                .expect(HttpStatus.FORBIDDEN);
        });
        it(`2.5 should return 204 with correct data`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            await instance.put(`${CommentsPath}/${commentId}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctCommentNew)
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(`${CommentsPath}/${commentId}`).expect(HttpStatus.OK);

            expect(response.body).toEqual<CommentViewModel>({
                id: commentId,
                ...correctCommentNew,
                commentatorInfo: {
                    userId: userId,
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: defaultLikesInfo
            });
        });
    });
    describe(`3 DELETE ${CommentsPath}/id:`, () => {
        it(`3.1 should return 401 without authorization`, async () => {
            await instance.delete(`${CommentsPath}/${id}`)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`3.2 should return 404 for not existing comment`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.delete(`${CommentsPath}/${id}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`3.3 should return 403 with incorrect token`, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            const blogId = await saveBlog(instance, pairTokens[0].accessToken);
            const postId = await savePost(instance, pairTokens[0].accessToken, blogId);
            const commentId = await saveComment(
                instance,
                pairTokens[0].accessToken,
                postId
            );

            await instance.delete(`${CommentsPath}/${commentId}`)
                .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
                .expect(HttpStatus.FORBIDDEN);
        });
        it(`3.4 should return 204`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            await instance.delete(`${CommentsPath}/${commentId}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(`${PostsPath}/${postId}/comments`).expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<CommentViewModel>>(defaultPagination);
        });
    });
    describe(`4 PUT ${CommentsPath}/id/like-status:`, () => {
        it(`4.1 should return 401 without authorization`, async () => {
            await instance.put(`${CommentsPath}/${id}/like-status`).expect(HttpStatus.UNAUTHORIZED);
        });
        it(`4.2 should return 400 with bad body`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            const errMes = await instance.put(`${CommentsPath}/${commentId}/like-status`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(badCommentLikeStatus)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectCommentLike);
        });
        it(`4.3 should return 404 if comment not exist`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.put(`${CommentsPath}/${id}/like-status`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctCommentLikeStatus)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`4.4 should return 204 if all ok`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            await instance.put(`${CommentsPath}/${commentId}/like-status`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctCommentLikeStatus)
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(`${CommentsPath}/${commentId}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.OK);

            expect(response.body).toEqual<CommentViewModel>({
                id: commentId,
                ...correctComment,
                commentatorInfo: {
                    userId: userId,
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                    ...defaultLikesInfo,
                    likesCount: 1,
                    myStatus: LikeStatus.Like
                }
            });
            const response2 = await instance.get(`${CommentsPath}/${commentId}`).expect(HttpStatus.OK);
            expect(response2.body).toEqual({
                id: commentId,
                ...correctComment,
                commentatorInfo: {
                    userId: userId,
                    userLogin: user.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                    ...defaultLikesInfo,
                    likesCount: 1,
                }
            });
        });
    });
})