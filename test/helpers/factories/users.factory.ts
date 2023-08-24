import {SuperTest, Test} from "supertest";
import {UserInputModelDto} from "../../../src/users/dto";
import {authLoginPath, saUsersPath} from "../mocks/paths.mock";
import {authBasic} from "../auth";
import {AuthData, TestPairToken} from "../types";

export const createAuthData = (): AuthData => {
    return {
        loginOrEmail: "17dergachev@gmail.com",
        password: "19gotimu"
    }
}

export const createUser = (): UserInputModelDto => {
    return {
        login: "medji",
        email: "17dergachev@gmail.com",
        password: "19gotimu"
    };
};

export const createUsers = (count: number): Array<UserInputModelDto> => {
    const users: Array<UserInputModelDto> = [];
    for (let i = 0; i < count; i++) {
        const user: UserInputModelDto = {
            login: `login${i}`,
            email: `email${i}@gmail.com`,
            password: `password${i}`
        };
        users.push(user);
    }
    return users;
};

export const saveUser = async (
    instance: SuperTest<Test>,
    user: UserInputModelDto
): Promise<string> => {
    const response = await instance.post(saUsersPath)
        .set({Authorization: authBasic})
        .send(user);
    return response.body.id;
};

export const saveUsers = async (
    instance: SuperTest<Test>,
    users: Array<UserInputModelDto>
): Promise<Array<string>> => {
    const ids: Array<string> = [];
    for (let i = 0; i < users.length; i++) {
        const response = await instance.post(saUsersPath)
            .set({Authorization: authBasic})
            .send(users[i]);
        ids.push(response.body.id);
    }
    return ids;
};

export const loginAndGetPairToken = async (
    instance: SuperTest<Test>,
    user: UserInputModelDto
): Promise<TestPairToken> => {
    const response = await instance.post(authLoginPath).send({
        loginOrEmail: user.login,
        password: user.password
    });
    const accessToken = response.body.accessToken;
    const refreshToken = response.headers['set-cookie'][0].split(';')[0];
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};

export const loginAndGetPairTokens = async (
    instance: SuperTest<Test>,
    users: UserInputModelDto[]
): Promise<Array<TestPairToken>> => {
    const pairTokens: Array<TestPairToken> = [];
    for (let i = 0; i < users.length; i++) {
        const response = await instance.post(authLoginPath).send({
            loginOrEmail: users[i].login,
            password: users[i].password
        });
        const accessToken = response.body.accessToken;
        const refreshToken = response.headers['set-cookie'][0].split(';')[0];
        pairTokens.push({
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
    return pairTokens;
};