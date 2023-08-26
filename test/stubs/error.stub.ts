export const errorsMessageForIncorrectBlog = {
    errorsMessages: [
        {
            message: 'input is required',
            field: 'name'
        },
        {
            message: 'input is required',
            field: 'description'
        },
        {
            message: 'input is required',
            field: 'websiteUrl'
        }
    ]
};

export const errorsMessageForIncorrectPost = {
    errorsMessages: [
        {
            message: 'input is required',
            field: 'title'
        },
        {
            message: 'input is required',
            field: 'shortDescription'
        },
        {
            message: 'input is required',
            field: 'content'
        }
    ]
};

export const errorsMessageForIncorrectPostWithBlogId = {
    errorsMessages: [
        {
            message: 'input is required',
            field: 'title'
        },
        {
            message: 'input is required',
            field: 'shortDescription'
        },
        {
            message: 'input is required',
            field: 'content'
        }
    ]
};

export const errorsMessageForIncorrectComment = {
    errorsMessages: [
        {
            message: 'content must be longer than or equal to 20 characters',
            field: 'content'
        }
    ]
};

export const errorsMessageForIncorrectPostLike = {
    errorsMessages: [
        {
            message: 'likeStatus must be one of the following values: None, Like, Dislike',
            field: 'likeStatus'
        }
    ]
};

export const errorsMessageForIncorrectCommentLike = {
    errorsMessages: [
        {
            message: 'input is required',
            field: 'likeStatus'
        }
    ]
};

export const errorsMessageForIncorrectUser = {
    errorsMessages: [
        {
            message: 'login should not be empty',
            field: 'login'
        },
        {
            message: 'password should not be empty',
            field: 'password'
        },
        {
            message: 'email should not be empty',
            field: 'email'
        }
    ]
};

export const errorsMessageForIncorrectLogin = {
    errorsMessages: [
        {
            message: 'should not be empty',
            field: 'loginOrEmail'
        },
        {
            message: 'should not be empty',
            field: 'password'
        }
    ]
};

export const errorsMessageForIncorrectLoginV2 = {
    path: "/auth/login",
    statusCode: 401,
    timestamp: "2023-08-24T07:43:07.301Z",
};

export const errorsMessageForRegistration = {
    errorsMessages: [
        {
            message: 'User already registration',
            field: 'login'
        },
        {
            message: 'User already registration',
            field: 'email'
        }
    ]
};

export const errorsMessageForConfirmation = {
    errorsMessages: [
        {
            message: 'code must be a UUID',
            field: 'code'
        }
    ]
};

export const errorsMessageForEmailResending = {
    errorsMessages: [
        {
            message: 'user with this code don\'t exist in the DB',
            field: 'email'
        }
    ]
};

export const errorsMessageForPasswordRecovery = {
    errorsMessages: [
        {
            message: 'email must be an email',
            field: 'email'
        }
    ]
};

export const errorsMessageForNewPassword = {
    errorsMessages: [
        {
            message: 'input is min 6 and max 20 symbol',
            field: 'newPassword'
        },
        {
            message: 'recoveryCode should not be empty',
            field: 'recoveryCode'
        }
    ]
};

export const errorsMessageForBadBan = {
    errorsMessages: [
        {
            message: 'banReason must be longer than or equal to 20 characters',
            field: 'banReason'
        }
    ]
};

export const errorsMessageForBloggerBanUser = {
    errorsMessages: [
        {
            message: 'blogId should not be empty',
            field: 'blogId'
        },
        {
            message: 'banReason must be longer than or equal to 20 characters',
            field: 'banReason'
        },
    ]
};

export const errorsMessageForBanBlog = {
    errorsMessages: [
        {
            message: 'isBanned must be a boolean value',
            field: 'isBanned'
        }
    ]
};
