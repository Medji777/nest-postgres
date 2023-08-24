import {SuperTest, Test} from "supertest";
import {authHeader, bearerAccessToken} from "../auth";
import {correctComment} from "../../stubs/comments.stub";

export const saveComment = async (
    instance: SuperTest<Test>,
    accessToken: string,
    postId: string
): Promise<string> => {
    const response = await instance.post('/posts' + '/' + postId + '/comments')
        .set({[authHeader]: bearerAccessToken(accessToken)})
        .send(correctComment);
    return response.body.id;
};