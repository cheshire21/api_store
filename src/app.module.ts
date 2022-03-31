import { HttpException, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { SendEmailsModule } from './send-emails/send-emails.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: true,
      formatError: (error) => {
        const graphQLFormattedError = {
          name: error.name,
          message: error.message,
        };
        return graphQLFormattedError;
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartsModule,
    OrdersModule,
    SendEmailsModule,
  ],
  providers: [],
})
export class AppModule {}
