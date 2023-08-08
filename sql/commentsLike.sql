CREATE TABLE public."CommentsLike"
(
    id serial NOT NULL,
    "userId" uuid NOT NULL,
    "commentId" uuid NOT NULL,
    "myStatus" character varying NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("commentId")
        REFERENCES public."Comments" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."CommentsLike"
    OWNER to postgres;