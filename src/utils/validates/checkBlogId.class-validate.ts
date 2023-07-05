import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsService } from "../../public/blogs/blogs.service";

@ValidatorConstraint({ name: 'checkBlogId', async: true })
@Injectable()
export class CheckBlogIdValidate implements ValidatorConstraintInterface {
    constructor(private blogsService: BlogsService) {}
    async validate(blogId: string): Promise<boolean> {
        return this.blogsService.checkBlogById(blogId);
    }
    defaultMessage(): string {
        return'blog with this id don\'t exist in the DB'
    }
}
