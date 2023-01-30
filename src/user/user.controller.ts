import { Controller, Get } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.log('UserController init');
  }

  @Get()
  findAll(): Promise<User[]> {
    this.logger.log('请求 Users');
    return this.userService.findAll();
  }

  @Get('find')
  findOne(): Promise<User> {
    return this.userService.findOne(1);
  }

  @Get('add')
  add() {
    const user = {
      username: 'wxc',
      password: '123456',
    } as User;
    return this.userService.add(user);
  }

  @Get('update')
  update() {
    const user = { password: '654321' } as User;
    return this.userService.update(1, user);
  }

  @Get('delete')
  delete() {
    return this.userService.delete(1);
  }
}
