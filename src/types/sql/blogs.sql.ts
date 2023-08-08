export type BlogsSqlType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt?: Date,
    isMembership?: boolean,
    banDate: Date | null,
    isBanned: boolean,
    userId: string | null
}