import {SuperTest, Test} from "supertest";
import {bloggerBlogsPath} from "../mocks/paths.mock";
import {authHeader, bearerAccessToken} from "../auth";
import {correctPost} from "../../stubs/posts.stub";

export const savePost = async (
    instance: SuperTest<Test>,
    accessToken: string,
    blogId: string
): Promise<string> => {
    const response = await instance.post(`${bloggerBlogsPath}/${blogId}/posts`)
        .set({[authHeader]: bearerAccessToken(accessToken)})
        .send(correctPost);
    return response.body.id;
};