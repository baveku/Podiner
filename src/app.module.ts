import { RedisModule } from '@liaoliaots/nestjs-redis'
import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HeaderResolver } from 'nestjs-i18n'
import { I18nModule } from 'nestjs-i18n/dist/i18n.module'
import * as path from 'path'
import { DataSource } from 'typeorm'
import { AuthAppleModule } from './auth-apple/auth-apple.module'
import { AuthFacebookModule } from './auth-facebook/auth-facebook.module'
import { AuthGoogleModule } from './auth-google/auth-google.module'
import { AuthTwitterModule } from './auth-twitter/auth-twitter.module'
import { AuthModule } from './auth/auth.module'
import appConfig from './config/app.config'
import appleConfig from './config/apple.config'
import authConfig from './config/auth.config'
import databaseConfig from './config/database.config'
import facebookConfig from './config/facebook.config'
import fileConfig from './config/file.config'
import googleConfig from './config/google.config'
import mailConfig from './config/mail.config'
import twitterConfig from './config/twitter.config'
import { TypeOrmConfigService } from './database/typeorm-config.service'
import { FilesModule } from './files/files.module'
import { ForgotModule } from './forgot/forgot.module'
import { HomeModule } from './home/home.module'
import { MailConfigService } from './mail/mail-config.service'
import { MailModule } from './mail/mail.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        twitterConfig,
        appleConfig,
      ],
      envFilePath: ['.env'],
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize()
        return dataSource
      },
    }),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('app.fallbackLanguage'),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService) => {
            return [configService.get('app.headerLanguage')]
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthFacebookModule,
    AuthGoogleModule,
    AuthTwitterModule,
    AuthAppleModule,
    ForgotModule,
    MailModule,
    HomeModule,
  ],
})
export class AppModule {}
