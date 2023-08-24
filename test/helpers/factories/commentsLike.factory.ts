import {SuperTest, Test} from "supertest";
import {authHeader, bearerAccessToken} from "../auth";
import {HttpStatus} from "@nestjs/common";
import {CommentsPath} from "../mocks/paths.mock";

export const saveCommentLike = async (
    instance: SuperTest<Test>,
    accessToken: string,
    commentId: string
): Promise<void> => {
    await instance
        .put(CommentsPath + '/' + commentId + '/' + 'like-status')
        .set({[authHeader]: bearerAccessToken(accessToken)})
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.NO_CONTENT);
};