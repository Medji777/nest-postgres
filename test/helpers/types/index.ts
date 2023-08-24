export type TestPairToken = {
    accessToken: string;
    refreshToken: string;
};

export type fieldData = string | null | undefined;

export type AuthData = {
    loginOrEmail: string;
    password: string;
};

export type TokenViewModel = Pick<TestPairToken, 'accessToken'>