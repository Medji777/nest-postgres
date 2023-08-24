import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import request, {SuperTest, Test} from "supertest";
import {createNestAppTest} from "../../main.test";
import {bloggerBlogsPath} from "../../helpers/mocks/paths.mock";
import {
    createUser,
    createUsers,
    loginAndGetPairToken, loginAndGetPairTokens,
    saveUser,
    saveUsers
} from "../../helpers/factories/users.factory";
import {authHeader, bearerAccessToken} from "../../helpers/auth";
import {Paginator} from "../../../src/types/types";
import {defaultPagination} from "../../helpers/mocks/pagination.mock";
import {BlogsViewModel} from "../../../src/types/blogs";
import {saveBlog} from "../../helpers/factories/blogs.factory";
import {correctBlog, correctNewBlog, incorrectBlog} from "../../stubs/blogs.stub";
import {
    errorsMessageForIncorrectBlog,
    errorsMessageForIncorrectPost,
    errorsMessageForIncorrectPostWithBlogId
} from "../../stubs/error.stub";
import {correctNewPost, correctPost, incorrectPost} from "../../stubs/posts.stub";
import {PostsViewModel} from "../../../src/types/posts";
import {defaultExtendedLikesInfo, defaultLikesInfo} from "../../helpers/mocks/likesInfo.mock";
import {savePost} from "../../helpers/factories/posts.factory";
import {saveComment} from "../../helpers/factories/comments.factory";
import {correctComment} from "../../stubs/comments.stub";
import {CommentViewType, PostInfo} from "../../../src/types/comments";

describe('BloggerBlogsController (e2e)', () => {

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

    describe(`1 GET ${bloggerBlogsPath}:`, () => {
        it(`1.1 should return 401 without authorization`, async () => {
            await instance.get(bloggerBlogsPath).expect(HttpStatus.UNAUTHORIZED);
        });
        it(`1.2 should return 200 and empty paginated array`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const response = await instance.get(bloggerBlogsPath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<BlogsViewModel>>(defaultPagination);
        });
        it(`1.3 should return 200 and one user's blog`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            await saveBlog(instance, pairToken.accessToken);
            const response = await instance.get(bloggerBlogsPath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<BlogsViewModel>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining([
                    {
                        id: expect.any(String),
                        ...correctBlog,
                        isMembership: false,
                        createdAt: expect.any(String)
                    }
                ])
            });
        });
    });
    describe(`2 POST ${bloggerBlogsPath}:`, () => {
        it(`2.1 should return 401 without authorization`, async () => {
            await instance.post(bloggerBlogsPath)
                .send(correctBlog)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`2.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            const errMes = await instance.post(bloggerBlogsPath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(incorrectBlog)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
        });
        it(`2.3 should return 201 and create blog`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            const response = await instance.post(bloggerBlogsPath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctBlog)
                .expect(HttpStatus.CREATED);
            expect(response.body).toEqual<BlogsViewModel>({
                id: expect.any(String),
                ...correctBlog,
                isMembership: false,
                createdAt: expect.any(String)
            });
        });
    });
    describe(`4 PUT ${bloggerBlogsPath}/id:`, () => {
        it(`4.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            await instance.put(bloggerBlogsPath + '/' + blogId)
                .send(correctNewBlog)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`4.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const errMes = await instance.put(bloggerBlogsPath + '/' + blogId)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(incorrectBlog)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
        });
        it(`4.3 should return 204 with correct data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            await instance.put(bloggerBlogsPath + '/' + blogId)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctNewBlog)
                .expect(HttpStatus.NO_CONTENT);
            const response = await instance.get(bloggerBlogsPath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining([
                    {
                        id: expect.any(String),
                        ...correctNewBlog,
                        isMembership: false,
                        createdAt: expect.any(String)
                    }
                ])
            });
        });
        it(`4.4 should return 404 for not existing blog`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance
                .put(bloggerBlogsPath + '/999')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctNewBlog)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`4.5 should return 403 if blogId another user `, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            await saveBlog(instance, pairTokens[0].accessToken);
            const blogIdAnotherUser = await saveBlog(instance, pairTokens[1].accessToken);

            await instance.put(bloggerBlogsPath + '/' + blogIdAnotherUser)
                .set({[authHeader]: bearerAccessToken(pairTokens[0].accessToken)})
                .send(correctNewBlog)
                .expect(HttpStatus.FORBIDDEN);
        });
    });
    describe(`5 DELETE ${bloggerBlogsPath}/id:`, () => {
        it(`5.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            await instance.delete(bloggerBlogsPath + '/' + blogId)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`5.2 should return 404 for not existing blog`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            await saveBlog(instance, pairToken.accessToken);

            await instance.delete(bloggerBlogsPath + '/999')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`5.3 should return 204 and delete blog`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            await instance.delete(bloggerBlogsPath + '/' + blogId)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.NO_CONTENT);
            await instance.get(bloggerBlogsPath)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.OK)
                .expect(defaultPagination);
        });
        it(`5.4 should return 403 if blogId another user`, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            await saveBlog(instance, pairTokens[0].accessToken);
            const blogIdAnotherUser = await saveBlog(instance, pairTokens[1].accessToken);

            await instance.delete(bloggerBlogsPath + '/' + blogIdAnotherUser)
                .set({[authHeader]: bearerAccessToken(pairTokens[0].accessToken)})
                .expect(HttpStatus.FORBIDDEN);
        });
    });
    describe(`6 POST ${bloggerBlogsPath}/id/posts:`, () => {
        it(`6.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            await instance.post(bloggerBlogsPath + '/' + blogId + '/posts')
                .send(correctPost)
                .expect(HttpStatus.UNAUTHORIZED);

            const response = await instance.get('/posts').expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<PostsViewModel>>(defaultPagination);
        });
        it(`6.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const errMes = await instance.post(bloggerBlogsPath + '/' + blogId + '/posts')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(incorrectPost)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectPost);
        });
        it(`6.3 should return 201 with correct data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const response = await instance.post(bloggerBlogsPath + '/' + blogId + '/posts')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctPost)
                .expect(HttpStatus.CREATED);
            expect(response.body).toEqual<PostsViewModel>({
                id: expect.any(String),
                ...correctPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: expect.objectContaining(defaultExtendedLikesInfo)
            });
        });
        it(`6.4 should return 404 for not existing post by blog's id`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            await saveBlog(instance, pairToken.accessToken);

            await instance.post(bloggerBlogsPath + '/999/posts')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctPost)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`6.5 should return 403 if blogId another user`, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            await saveBlog(instance, pairTokens[0].accessToken);
            const blogIdAnotherUser = await saveBlog(instance, pairTokens[1].accessToken);

            await instance.post(bloggerBlogsPath + '/' + blogIdAnotherUser + '/posts')
                .set({[authHeader]: bearerAccessToken(pairTokens[0].accessToken)})
                .send(correctPost)
                .expect(HttpStatus.FORBIDDEN);
        });
    });
    describe(`7 PUT ${bloggerBlogsPath}/id/posts:`, () => {
        it(`7.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            await instance.put(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`7.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const errMes = await instance.put(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(incorrectPost)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectPostWithBlogId);
        });
        it(`7.3 should return 404 with incorrect id`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.put(bloggerBlogsPath + '/999/posts/999')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctNewPost)
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`7.4 should return 403 if id another user`, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            const blogId = await saveBlog(instance, pairTokens[0].accessToken);
            const blogIdAnotherUser = await saveBlog(instance, pairTokens[1].accessToken);
            await savePost(instance, pairTokens[0].accessToken, blogId);
            const postIdAnotherUser = await savePost(
                instance,
                pairTokens[1].accessToken,
                blogIdAnotherUser
            );

            await instance.put(bloggerBlogsPath + '/' + blogIdAnotherUser + '/posts/' + postIdAnotherUser)
                .set({[authHeader]: bearerAccessToken(pairTokens[0].accessToken)})
                .send(correctNewPost)
                .expect(HttpStatus.FORBIDDEN);
        });
        it(`7.5 should return 204 with correct data`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            await instance.put(bloggerBlogsPath + '/' + blogId + '/posts/' + postId)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .send(correctNewPost)
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get('/posts' + '/' + postId).expect(HttpStatus.OK);
            expect(response.body).toEqual<PostsViewModel>({
                id: expect.any(String),
                ...correctNewPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: expect.objectContaining(defaultExtendedLikesInfo)
            });
        });
    });
    describe(`8 DELETE ${bloggerBlogsPath}/id/posts:`, () => {
        it(`8.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            await instance.delete(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`8.2 should return 404 with incorrect id`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);

            await instance.delete(bloggerBlogsPath + '/999/posts/999')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`8.3 should return 403 if id another user`, async () => {
            const users = createUsers(2);
            await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            const blogId = await saveBlog(instance, pairTokens[0].accessToken);
            const blogIdAnotherUser = await saveBlog(instance, pairTokens[1].accessToken);
            await savePost(instance, pairTokens[0].accessToken, blogId);
            const postIdAnotherUser = await savePost(
                instance,
                pairTokens[1].accessToken,
                blogIdAnotherUser
            );

            await instance.delete(bloggerBlogsPath + '/' + blogIdAnotherUser + '/posts/' + postIdAnotherUser)
                .set({[authHeader]: bearerAccessToken(pairTokens[0].accessToken)})
                .expect(HttpStatus.FORBIDDEN);
        });
        it(`8.4 should return 204 and delete post`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            await instance.delete(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get('/posts').expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<PostsViewModel>>(defaultPagination);
        });
    });
    describe(`9 GET ${bloggerBlogsPath}/comments:`, () => {
        it(`9.1 should return 401 without authorization`, async () => {
            await instance.get(bloggerBlogsPath + '/comments').expect(HttpStatus.UNAUTHORIZED);
        });
        it(`9.2 GET should return 200 and comments`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            await saveComment(instance, pairToken.accessToken, postId);

            const response = await instance.get(bloggerBlogsPath + '/comments')
                .set({[authHeader]: bearerAccessToken(pairToken.accessToken)})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<CommentViewType>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<CommentViewType>([
                    {
                        id: expect.any(String),
                        content: correctComment.content,
                        commentatorInfo: {
                            userId: userId,
                            userLogin: user.login
                        },
                        createdAt: expect.any(String),
                        postInfo: expect.objectContaining<PostInfo>({
                            id: postId,
                            title: correctPost.title,
                            blogId: blogId,
                            blogName: correctBlog.name
                        }),
                        likesInfo: expect.objectContaining(defaultLikesInfo)
                    }
                ])
            });
        });
    });
})