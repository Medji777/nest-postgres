CREATE TABLE public."Security"
(
    id serial NOT NULL,
    ip character varying NOT NULL,
    title character varying NOT NULL,
    "lastActiveDate" timestamp with time zone NOT NULL,
    "expiredTokenDate" timestamp with time zone NOT NULL,
    "deviceId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public."Security"
    OWNER to postgres;