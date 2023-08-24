import {SuperTest, Test} from "supertest";
import {bloggerBlogsPath} from "../mocks/paths.mock";
import {authHeader, bearerAccessToken} from "../auth";
import {correctBlog} from "../../stubs/blogs.stub";

export const saveBlog = async (
    instance: SuperTest<Test>,
    accessToken: string
): Promise<string> => {
    const response = await instance.post(bloggerBlogsPath)
        .set({[authHeader]: bearerAccessToken(accessToken)})
        .send(correctBlog);
    return response.body.id;
};