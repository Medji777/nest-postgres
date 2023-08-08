
type DeleteCount = number
export type DeleteResponse<T> = [T[], DeleteCount]

type UpdateCount = DeleteCount
export type UpdateResponse<T> = [T[], UpdateCount]

export type DataResponse<T> = [T]

export type ArrayDataResponse<T> = Array<T>

export type ResponseDataCount = [{count: number}]