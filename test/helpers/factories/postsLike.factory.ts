import {SuperTest, Test} from "supertest";
import {HttpStatus} from "@nestjs/common";
import {PostsPath} from "../mocks/paths.mock";
import {authHeader, bearerAccessToken} from "../auth";
import {LikeStatus} from "../../../src/types/types";

export const savePostLike = async (
    instance: SuperTest<Test>,
    accessToken: string,
    postId: string
): Promise<void> => {
    await instance.put(PostsPath + '/' + postId + '/like-status')
        .set({[authHeader]: bearerAccessToken(accessToken)})
        .send({ likeStatus: LikeStatus.Like })
        .expect(HttpStatus.NO_CONTENT);
};