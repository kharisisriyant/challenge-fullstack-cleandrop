import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateCompanyInput {
  @Field()
  @IsString()
  name!: string;
}
