CREATE TABLE public."Blogs"
(
    id uuid NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "websiteUrl" character varying NOT NULL,
    "createdAt" time with time zone,
    "isMembership" boolean,
    "banDate" time with time zone DEFAULT null,
    "isBanned" boolean NOT NULL DEFAULT false,
    "userId" uuid,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."Blogs"
    OWNER to postgres;