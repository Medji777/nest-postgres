CREATE TABLE public."Users"
(
    id uuid NOT NULL,
    login character varying(10) NOT NULL,
    email character varying NOT NULL,
    "createdAt" timestamp with time zone,
    "passwordHash" character varying NOT NULL,
    "passwordConfirmationCode" uuid DEFAULT null,
    "passwordExpirationDate" timestamp with time zone,
    "passwordIsConfirmed" boolean NOT NULL DEFAULT true,
    "emailConfirmationCode" uuid DEFAULT null,
    "emailExpirationDate" timestamp with time zone,
    "emailIsConfirmed" boolean NOT NULL DEFAULT true,
    "isBanned" boolean NOT NULL DEFAULT false,
    "banDate" timestamp with time zone DEFAULT null,
    "banReason" character varying DEFAULT null,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public."Users"
    OWNER to postgres;