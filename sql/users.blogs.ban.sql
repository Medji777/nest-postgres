CREATE TABLE public."UsersBlogsBan"
(
    "userId" uuid NOT NULL,
    "blogId" uuid NOT NULL,
    "banDate" timestamp with time zone,
    "banReason" character varying COLLATE pg_catalog."default",
    FOREIGN KEY ("blogId")
        REFERENCES public."Blogs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

ALTER TABLE IF EXISTS public."UsersBlogsBan"
    OWNER to postgres;