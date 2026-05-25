import { ObjectType, Field, InputType } from '@nestjs/graphql';

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
  @Field()
  email!: string;

  @Field()
  password!: string;
}
