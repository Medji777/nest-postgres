import {OmitType} from "@nestjs/mapped-types";
import {PostInputModelDto} from "../../../public/posts/dto";

export class UpdatePostDto extends OmitType(PostInputModelDto, ['blogId'] as const) {}