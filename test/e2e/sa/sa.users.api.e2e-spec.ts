import {randomUUID} from "crypto";
import request, {SuperTest,Test} from "supertest";
import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import {createNestAppTest} from "../../main.test";
import {Paginator} from "../../../src/types/types";
import {UserViewModelSA} from "../../../src/types/users";
import {
    createUser,
    createUsers, loginAndGetPairToken,
    loginAndGetPairTokens,
    saveUser,
    saveUsers
} from "../../helpers/factories/users.factory";
import {BlogsPath, CommentsPath, PostsPath, saUsersPath} from "../../helpers/mocks/paths.mock";
import {authBasic, authHeader} from "../../helpers/auth";
import {incorrectUser} from "../../stubs/users.stub";
import {errorsMessageForBadBan, errorsMessageForIncorrectUser} from "../../stubs/error.stub";
import {defaultPagination} from "../../helpers/mocks/pagination.mock";
import {badBanInfo, banInfo} from "../../stubs/sa.stub";
import {saveBlog} from "../../helpers/factories/blogs.factory";
import {savePost} from "../../helpers/factories/posts.factory";
import {saveComment} from "../../helpers/factories/comments.factory";
import {saveCommentLike} from "../../helpers/factories/commentsLike.factory";
import {correctComment} from "../../stubs/comments.stub";
import {savePostLike} from "../../helpers/factories/postsLike.factory";
import {correctPost} from "../../stubs/posts.stub";
import {correctBlog} from "../../stubs/blogs.stub";
import {PostsViewModel} from "../../../src/types/posts";
import {CommentViewModel} from "../../../src/types/comments";
import {BlogsViewModel} from "../../../src/types/blogs";
import {defaultExtendedLikesInfo, defaultLikesInfo} from "../../helpers/mocks/likesInfo.mock";
import {LikesInfoViewModel} from "../../../src/types/likes";

describe('SAUsersController (e2e)',()=>{
    const id = randomUUID();
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

    describe(`1 GET ${saUsersPath}:`, () => {
        it(`1.1 should return 401 without authorization`, async () => {
            await instance.get(saUsersPath)
                .expect(HttpStatus.UNAUTHORIZED);
        })
        it(`1.2 should return 200 and empty users`, async () => {
            const response = await instance.get(saUsersPath)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<UserViewModelSA>>(defaultPagination);
        });
        it(`1.3 should return 200 and empty users with query`, async () => {
            const query = {
                pageNumber: 2,
                pageSize: 5
            }
            const response = await instance.get(saUsersPath)
                .set({[authHeader]: authBasic})
                .query(query)
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<UserViewModelSA>>(expect.objectContaining({
                ...defaultPagination,
                ...query
            }));
        });
        it(`1.4 should return 200 and one user in array`, async () => {
            const user = createUser();
            await saveUser(instance, user);

            const response = await instance.get(saUsersPath)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.OK);

            expect(response.body).toEqual<Paginator<UserViewModelSA>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<UserViewModelSA>([
                    {
                        id: expect.any(String),
                        login: user.login,
                        email: user.email,
                        createdAt: expect.any(String),
                        banInfo: {
                            isBanned: false,
                            banDate: null,
                            banReason: null
                        }
                    }
                ])
            });
        });
    })

    describe(`2 POST ${saUsersPath}:`, () => {
        it(`2.1 should return 401 without authorization`, async () => {
            const user = createUser();
            await instance.post(saUsersPath)
                .send(user)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`2.2 should return 400 with incorrect data`, async () => {
            const errMes = await instance.post(saUsersPath)
                .set({[authHeader]: authBasic})
                .send(incorrectUser)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForIncorrectUser);
        });
        it(`2.3 should return 201 with correct data`, async () => {
            const user = createUser();
            const response = await instance.post(saUsersPath)
                .set({[authHeader]: authBasic})
                .send(user)
                .expect(HttpStatus.CREATED);
            expect(response.body).toEqual<UserViewModelSA>({
                id: expect.any(String),
                login: user.login,
                email: user.email,
                createdAt: expect.any(String),
                banInfo: {
                    isBanned: false,
                    banDate: null,
                    banReason: null
                }
            });
        });
    })

    describe(`3 DELETE ${saUsersPath}/id:`, () => {
        it(`3.1 should return 401 without authorization`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);

            await instance.delete(`${saUsersPath}/${userId}`)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`3.2 should return 404 for not existing user`, async () => {
            await instance.delete(`${saUsersPath}/${id}`)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.NOT_FOUND);
        });
        it(`3.3 should return 201`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);

            await instance.delete(`${saUsersPath}/${userId}`)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.NO_CONTENT);
            const response = await instance.get(saUsersPath)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<UserViewModelSA>>(defaultPagination);
        });
    })

    describe(`4 PUT ${saUsersPath}/id/ban:`, () => {
        it(`4.1 should return 401 without authorization`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            await instance.put(`${saUsersPath}/${userId}/ban`)
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it(`4.2 should return 400 with incorrect data`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const errMes = await instance.put(`${saUsersPath}/${userId}/ban`)
                .set({[authHeader]: authBasic})
                .send(badBanInfo)
                .expect(HttpStatus.BAD_REQUEST);
            expect(errMes.body).toEqual(errorsMessageForBadBan);
        });
        it(`4.3 should return 204 with correct data`, async () => {
            const user = createUser();
            const userId = await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);
            const commentId = await saveComment(instance, pairToken.accessToken, postId);

            await instance.put(`${saUsersPath}/${userId}/ban`)
                .set({[authHeader]: authBasic})
                .send(banInfo)
                .expect(HttpStatus.NO_CONTENT);
            const response = await instance.get(saUsersPath)
                .set({[authHeader]: authBasic})
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<UserViewModelSA>([
                    {
                        id: expect.any(String),
                        login: user.login,
                        email: user.email,
                        createdAt: expect.any(String),
                        banInfo: {
                            isBanned: banInfo.isBanned,
                            banDate: expect.any(String),
                            banReason: banInfo.banReason
                        }
                    }
                ])
            });
            const response2 = await instance.get(PostsPath).expect(HttpStatus.OK);
            expect(response2.body).toEqual<Paginator<PostsViewModel>>(defaultPagination);
            const response3 = await instance.get(BlogsPath).expect(HttpStatus.OK);
            expect(response3.body).toEqual<Paginator<BlogsViewModel>>(defaultPagination);
            await instance.get(`${CommentsPath}/${commentId}`).expect(HttpStatus.NOT_FOUND);
        });
        it(`4.4 should return 204 with correct data and check like(post/comment)`, async () => {
            const users = createUsers(2);
            const userIds = await saveUsers(instance, users);
            const pairTokens = await loginAndGetPairTokens(instance, users);
            const blogId = await saveBlog(instance, pairTokens[0].accessToken);
            const postId = await savePost(instance, pairTokens[0].accessToken, blogId);
            const commentId = await saveComment(
                instance,
                pairTokens[0].accessToken,
                postId
            );
            await saveCommentLike(instance, pairTokens[1].accessToken, commentId);
            await savePostLike(instance, pairTokens[1].accessToken, postId);

            await instance.put(`${saUsersPath}/${userIds[1]}/ban`)
                .set({[authHeader]: authBasic})
                .send(banInfo)
                .expect(HttpStatus.NO_CONTENT);

            const response = await instance.get(`${CommentsPath}/${commentId}`).expect(HttpStatus.OK);

            expect(response.body).toEqual<CommentViewModel>({
                id: commentId,
                ...correctComment,
                commentatorInfo: {
                    userId: userIds[0],
                    userLogin: users[0].login
                },
                createdAt: expect.any(String),
                likesInfo: expect.objectContaining<LikesInfoViewModel>(defaultLikesInfo)
            });

            const response2 = await instance.get(`${PostsPath}/${postId}`).expect(HttpStatus.OK);

            expect(response2.body).toEqual<PostsViewModel>({
                id: postId,
                ...correctPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: expect.objectContaining(defaultExtendedLikesInfo)
            });
        });
    })
})