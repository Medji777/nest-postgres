CREATE TABLE public."Posts"
(
    id uuid NOT NULL,
    title character varying NOT NULL,
    "shortDescription" character varying NOT NULL,
    content character varying NOT NULL,
    "blogId" uuid NOT NULL,
    "createdAt" time with time zone NOT NULL,
    "postOwnerId" uuid NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("blogId")
        REFERENCES public."Blogs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY ("postOwnerId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."Posts"
    OWNER to postgres;