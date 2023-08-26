import {createNestAppTest} from "../../main.test";
import request, {SuperTest, Test} from "supertest";
import {BlogsPath} from "../../helpers/mocks/paths.mock";
import {HttpStatus, INestApplication, ServiceUnavailableException} from "@nestjs/common";
import {Paginator} from "../../../src/types/types";
import {BlogsViewModel} from "../../../src/types/blogs";
import {defaultPagination} from "../../helpers/mocks/pagination.mock";
import {createUser, loginAndGetPairToken, saveUser} from "../../helpers/factories/users.factory";
import {saveBlog} from "../../helpers/factories/blogs.factory";
import {correctBlog} from "../../stubs/blogs.stub";
import {PostsViewModel} from "../../../src/types/posts";
import {savePost} from "../../helpers/factories/posts.factory";
import {correctPost} from "../../stubs/posts.stub";
import {defaultExtendedLikesInfo} from "../../helpers/mocks/likesInfo.mock";
import {randomUUID} from "crypto";

describe('BlogsController (e2e)', () => {

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

    describe(`1 GET ${BlogsPath}:`, () => {
        it(`1.1 should return 200 and empty paginated array`, async () => {
            const response = await instance.get(BlogsPath).expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<BlogsViewModel>>(defaultPagination);
        });
        it(`1.2 should return 200 and one blog in array`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const response = await instance.get(BlogsPath).expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<BlogsViewModel>>({
                ...defaultPagination,
                pagesCount: 1,
                totalCount: 1,
                items: expect.arrayContaining<BlogsViewModel>( [
                    {
                        id: blogId,
                        ...correctBlog,
                        isMembership: false,
                        createdAt: expect.any(String)
                    }
                ])
            });
        });
    });
    describe(`2 GET ${BlogsPath}/id:`, () => {
        it('2.1 should return 404 for not existing blog', async () => {
            await instance.get(`${BlogsPath}/${id}`).expect(HttpStatus.NOT_FOUND);
        });
        it('2.2 should return 200 with blog', async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const response = await instance.get(BlogsPath + '/' + blogId)
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<BlogsViewModel>({
                id: blogId,
                ...correctBlog,
                isMembership: false,
                createdAt: expect.any(String)
            });
        });
    });
    describe(`3 GET ${BlogsPath}/id/posts:`, () => {
        it(`3.1 should return 404 for not existing post by blog's id`, async () => {
            await instance.get(BlogsPath + `/${id}/posts`).expect(HttpStatus.NOT_FOUND);
        });
        it(`3.2 should return 200 and empty post`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);

            const response = await instance.get(BlogsPath + '/' + blogId + '/posts')
                .expect(HttpStatus.OK);
            expect(response.body).toEqual<Paginator<PostsViewModel>>(defaultPagination);
        });
        it(`3.3 should return 200 and post`, async () => {
            const user = createUser();
            await saveUser(instance, user);
            const pairToken = await loginAndGetPairToken(instance, user);
            const blogId = await saveBlog(instance, pairToken.accessToken);
            const postId = await savePost(instance, pairToken.accessToken, blogId);

            const response = await instance.get(BlogsPath + '/' + blogId + '/posts')
                .expect(HttpStatus.OK);
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
                        extendedLikesInfo: expect.objectContaining(defaultExtendedLikesInfo)
                    }
                ])
            });
        });
    });
})