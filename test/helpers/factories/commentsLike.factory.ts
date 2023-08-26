import {SuperTest, Test} from "supertest";
import {authHeader, bearerAccessToken} from "../auth";
import {HttpStatus} from "@nestjs/common";
import {CommentsPath} from "../mocks/paths.mock";
import {LikeStatus} from "../../../src/types/types";

export const saveCommentLike = async (
    instance: SuperTest<Test>,
    accessToken: string,
    commentId: string
): Promise<void> => {
    await instance
        .put(CommentsPath + '/' + commentId + '/like-status')
        .set({[authHeader]: bearerAccessToken(accessToken)})
        .send({ likeStatus: LikeStatus.Like })
        .expect(HttpStatus.NO_CONTENT);
};