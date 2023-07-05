
type DeleteCount = number
export type DeleteResponse<T> = [T[], DeleteCount]

type UpdateCount = DeleteCount
export type UpdateResponse<T> = [T[], UpdateCount]