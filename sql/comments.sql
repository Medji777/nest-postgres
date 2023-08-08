CREATE TABLE public."Comments"
(
    id uuid NOT NULL,
    content character varying NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "postId" uuid NOT NULL,
    "bloggerId" uuid NOT NULL,
    "likesCount" integer NOT NULL DEFAULT 0,
    "dislikesCount" integer NOT NULL DEFAULT 0,
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
        NOT VALID,
    FOREIGN KEY ("bloggerId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."Comments"
    OWNER to postgres;