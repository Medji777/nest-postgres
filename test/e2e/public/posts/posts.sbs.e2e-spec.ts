import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import request, {SuperTest, Test} from "supertest";
import {createNestAppTest} from "../../../main.test";
import {fieldData, TestPairToken, TokenViewModel} from "../../../helpers/types";
import {
    createAuthData,
    createUser,
    createUsers,
    loginAndGetPairTokens,
    saveUsers
} from "../../../helpers/factories/users.factory";
import {authBasic, authHeader, bearerAccessToken} from "../../../helpers/auth";
import {UserViewModelSA} from "../../../../src/types/users";
import {saveBlog} from "../../../helpers/factories/blogs.factory";
import {savePost} from "../../../helpers/factories/posts.factory";
import {PostsViewModel} from "../../../../src/types/posts";
import {correctPost} from "../../../stubs/posts.stub";
import {correctBlog} from "../../../stubs/blogs.stub";
import {LikeStatus} from "../../../../src/types/types";
import {correctPostLikeStatus} from "../../../stubs/postsLike.stub";

describe('posts api sbs',() => {
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

    let accessToken: fieldData = null;
    let saveUsersData: Array<{login: string, userId: string, token: TestPairToken}> = [];

    const regUser = createUser();
    const authData = createAuthData();

    it(`POST -> "/sa/users": should create new user; status 201; content: created user;`,
        async () => {
                const resp = await instance.post('/sa/users')
                    .set({[authHeader]: authBasic})
                    .send(regUser)
                    .expect(HttpStatus.CREATED)

            expect(resp.body).toEqual<UserViewModelSA>({
                id: expect.any(String),
                login: regUser.login,
                email: regUser.email,
                createdAt: expect.any(String),
                banInfo: {
                    isBanned: false,
                    banDate: null,
                    banReason: null
                }
            })
        }
    )

    it(`POST -> "/auth/login": should sign in user; status 200; 
    content: JWT 'access' token, JWT 'refresh' token in cookie (http only, secure);`,
        async ()=>{
                const res = await instance.post('/auth/login')
                    .send(authData)
                    .expect(HttpStatus.OK)
            accessToken = res.body.accessToken;
            expect(res.body).toEqual<TokenViewModel>({
                accessToken: expect.any(String)
            });
            expect(res.headers['set-cookie'][0].split(';')[0]).toEqual(
                expect.any(String)
            );
        }
    )

    it(`POST -> "/sa/users", "/auth/login": should create and login 4 users; status 201; 
    content: created users;`,
        async () => {
            const users = createUsers(4)
            const ids = await saveUsers(instance,users)
            const pairTokens = await loginAndGetPairTokens(instance, users);
            users.forEach((_,i)=>{
                saveUsersData.push({
                    login: users[i].login,
                    userId: ids[i],
                    token: pairTokens[i]
                })
            })
            expect(saveUsersData).toHaveLength(4)
        }
    )

    it(`PUT -> "/posts/:postId/like-status": 
    create post then: like the post by user 1, user 2, user 3, user 4. get the post after each like by user 1. 
    NewestLikes should be sorted in descending; status 204; used additional methods: 
    POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, GET => /posts/:id;`,
        async ()=>{
            const blogId = await saveBlog(instance, accessToken);
            const postId = await savePost(instance, accessToken, blogId);

            const response = await instance.get(`/posts/${postId}`)
                .set({[authHeader]: bearerAccessToken(accessToken)})
                .expect(HttpStatus.OK)

            expect(response.body).toEqual<PostsViewModel>({
                id: postId,
                ...correctPost,
                blogId: blogId,
                blogName: correctBlog.name,
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.None,
                    newestLikes: []
                }
            });

            for(let [i,u] of saveUsersData.entries()) {
                await instance.put(`/posts/${postId}/like-status`)
                    .set({[authHeader]: bearerAccessToken(u.token.accessToken)})
                    .send(correctPostLikeStatus)
                    .expect(HttpStatus.NO_CONTENT);

                const resV = await instance.get(`/posts/${postId}`)
                    .set({[authHeader]: bearerAccessToken(u.token.accessToken)})
                    .expect(HttpStatus.OK)

                expect(resV.body).toEqual<PostsViewModel>({
                    id: postId,
                    ...correctPost,
                    blogId: blogId,
                    blogName: correctBlog.name,
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: ++i,
                        dislikesCount: 0,
                        myStatus: LikeStatus.Like,
                        newestLikes: expect.arrayContaining([
                            {
                                addedAt: expect.any(String),
                                userId: u.userId,
                                login: u.login
                            }
                        ])
                    }
                });
            }
        }
    )
})