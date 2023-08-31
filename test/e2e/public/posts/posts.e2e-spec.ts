import request, {SuperTest, Test} from "supertest";
import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import {createNestAppTest} from "../../../main.test";
import {PostsPath} from "../../../helpers/mocks/paths.mock";
import {LikeStatus, Paginator} from "../../../../src/types/types";
import {PostsViewModel} from "../../../../src/types/posts";
import {createUser, loginAndGetPairToken, saveUser} from "../../../helpers/factories/users.factory";
import {savePost} from "../../../helpers/factories/posts.factory";
import {saveBlog} from "../../../helpers/factories/blogs.factory";
import {correctPost} from "../../../stubs/posts.stub";
import {correctBlog} from "../../../stubs/blogs.stub";
import {defaultExtendedLikesInfo, defaultLikesInfo} from "../../../helpers/mocks/likesInfo.mock";
import {defaultPagination} from "../../../helpers/mocks/pagination.mock";
import {correctComment, inCorrectComment} from "../../../stubs/comments.stub";
import {authHeader, bearerAccessToken} from "../../../helpers/auth";
import {errorsMessageForIncorrectComment, errorsMessageForIncorrectPostLike} from "../../../stubs/error.stub";
import {CommentViewModel} from "../../../../src/types/comments";
import {saveComment} from "../../../helpers/factories/comments.factory";
import {badPostLikeStatus, correctPostLikeStatus} from "../../../stubs/postsLike.stub";
import {randomUUID} from "crypto";

describe('PostsController (e2e)', () => {
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

    describe(`1 GET ${PostsPath}:`, () => {
        it('1.1 should return 200 and empty array', async () => {
            const response = await instance.get(PostsPath).expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<PostsViewModel>>(defaultPagination);
        });
        it('1.2 should return 200 and post in array', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const response = await instance.get(PostsPath).expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<PostsViewModel>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<PostsViewModel>([
                    {
                        id: postId,
                        ...correctPost,
                        blogId: blogId,
                        blogName: correctBlog.name,
                        createdAt: expect.any(String),
                        extendedLikesInfo: defaultExtendedLikesInfo
                    }
                ])
            });
        });
    });
    describe(`2 GET ${PostsPath}/id:`, () => {
        it('2.1 should return 404 for not existing posts', async () => {
            await instance.get(`${PostsPath}/${id}`).expect(HttpStatus.NOT_FOUND);
        });
        it(`2.2 should return 200 and post by id`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const response = await instance.get(`${PostsPath}/${postId}`)
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<PostsViewModel>({
                id: postId,
                ...correctPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: defaultExtendedLikesInfo
            });
        });
    });
    describe(`3 POST ${PostsPath}/id/comments:`, () => {
        it(`3.1 should return 403 without authorization`, async () => {
            await instance.post(`${PostsPath}/${id}/comments`)
                .send(correctComment)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`3.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const errMes = await instance.post(`${PostsPath}/${postId}/comments`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(inCorrectComment)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectComment);
        });
        it(`3.3 should return 404 for not existing comment`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.post(`${PostsPath}/${id}/comments`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctComment)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`3.4 should return 201 with correct data`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const response = await instance.post(`${PostsPath}/${postId}/comments`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctComment)
                .expect(HttpStatus.CREATED);
            expect(response.body).toEqual<CommentViewModel>({
                id: expect.any(String),
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
    describe(`4 GET ${PostsPath}/id/comments:`, () => {
        it(`4.1 should return 404 for not existing comment`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.get(`${PostsPath}/${id}/comments`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`4.2 should return 200 and comments by post's id`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            const result = await instance.get(`${PostsPath}/${postId}/comments`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.OK);
            expect(result.body).toEqual<Paginator<CommentViewModel>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<CommentViewModel>([
                    {
                        id: commentId,
                        ...correctComment,
                        commentatorInfo: {
                            userId: userId,
                            userLogin: user.login
                        },
                        createdAt: expect.any(String),
                        likesInfo: defaultLikesInfo
                    }
                ])
            });
        });
    });
    describe(`5 PUT ${PostsPath}/id/like-status:`, () => {
        it(`5.1 should return 401 without authorization`, async () => {
            await instance.put(`/posts/${id}/like-status`).expect(HttpStatus.UNAUTHORIZED);
        });
        it(`5.2 should return 400 with bad body`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const errMes = await instance.put(`${PostsPath}/${postId}/like-status`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(badPostLikeStatus)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectPostLike);
        });
        it(`5.3 should return 404 if post not exist`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.put(PostsPath + `/${id}/like-status`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctPostLikeStatus)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`5.4 should return 204 if all ok`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            await instance.put(`${PostsPath}/${postId}/like-status`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .send(correctPostLikeStatus)
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(`${PostsPath}/${postId}`)
                .set(authHeader, bearerAccessToken(pairToken.accessToken))
                .expect(HttpStatus.OK);

            expect(response.body).toEqual<PostsViewModel>({
                id: postId,
                ...correctPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 0,
                    myStatus: LikeStatus.Like,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: userId,
                            login: user.login
                        }
                    ]
                }
            });
            const response2 = await instance.get(`${PostsPath}/${postId}`)
                .expect(HttpStatus.OK);
            expect(response2.body).toEqual<PostsViewModel>({
                id: postId,
                ...correctPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 0,
                    myStatus: LikeStatus.None,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: userId,
                            login: user.login
                        }
                    ]
                }
            });
        });
    });
})