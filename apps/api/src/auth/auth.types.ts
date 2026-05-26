import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field()
  userId!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  role!: string;
}

@InputType()
export class LoginInput {
  @IsEmail()
  @Field()
  email!: string;

  @IsString()
  @MinLength(1)
  @Field()
  password!: string;
}
