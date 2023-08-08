CREATE TABLE public."PostsLike"
(
    id serial NOT NULL,
    "userId" uuid NOT NULL,
    "postId" uuid NOT NULL,
    "myStatus" character varying NOT NULL,
    "addedAt" timestamp with time zone NOT NULL,
    "isBanned" boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("postId")
        REFERENCES public."Posts" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."PostsLike"
    OWNER to postgres;