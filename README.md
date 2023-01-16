本项目用于记录 **NestJS** 与 **TypeORM** 对接过程中的一系列配置及说明。

## Entity

**Entity** 类对应数据库中的每张表，以 `src/user/user.entity.ts` 为例：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```

通过注解 `@Entity()` 定义 **Entity** 类，注解 `@Column()`，`@PrimaryGeneratedColumn()` 等定义需映射到数据库的字段。

 每个 **Entity** 类需要在 **TypeOrmModule** 的 `entities` 中引入，才可生效。

当项目启动，并且 **TypeOrmModule** 的 `synchronize` 为 `true` 时，会在数据库中，自动生成 `user` 表，其结构如下：

```
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| username    | varchar(255) |                            |
| password    | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

> [What is Entity?](https://typeorm.io/entities#what-is-entity)

## Entity 间对应关系

### One To One

当存在一张 `profile` 表，其存在一个字段 `userId` 对应 `user` 表的 `id` 字段，并且数据间为一对一映射关系，即可用注解 `OneToOne` 与 `JoinColumn` 来进行实现。此时 **Profile Entity** 的内容如下所示（路径为 `src/profile/profile.entity.ts`）：

```typescript
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gender: number;

  @Column()
  photo: string;

  @Column()
  address: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
```

此时 `profile` 表的结构为：

```
+-------------+--------------+----------------------------+
|                       profile                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| gender      | varchar(255) |                            |
| photo       | varchar(255) |                            |
| address     | varchar(255) |                            |
| userId      | int          | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

### Many-To-One / One-To-Many

当存在一张 `log` 表，其存在一个字段 `userId` 对应 `user` 表的 `id` 字段，并且 `user` 表中的数据可以映射 `log`表中多个数据时，可以通过注解 `ManyToOne`，`OneToMany` 来进行实现。

此时 **Log Entity** 的内容如下（路径为 `src/log/log.entity.ts`）：

```typescript
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  methods: string;

  @Column()
  data: string;

  @Column()
  result: string;

  @ManyToOne(() => User, (user) => user.logs)
  user: User;
}
```

修改 `User Entity` 的内容：

```typescript
import { Log } from 'src/log/log.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];
}
```

此时表结构为：

```
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| username    | varchar(255) |                            |
| password    | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                           log                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| path        | varchar(255) |                            |
| methods     | varchar(255) |                            |
| data        | varchar(255) |                            |
| result      | varchar(255) |                            |
| userId      | int          | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

### Many To Many

当存在一张表 `role`，其当中的数据与表 `user` 的数据为多对多的关系，此时可以通过注解 `ManyToMany` 和 `JoinTable` 实现。

此时 **Role Entity** 的内容如下（路径为 `src/role/role.entity.ts`）：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/user/user.entity';
@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User)
  @JoinTable({ name: 'user_role' })
  users: User[];
}
```

此时，会自动生成一张 `user_role` 表（表名可通过在注解 `JoinTable` 中传入 `name` 进行修改），用于储存  `role` 与 `user`  的关系。

此时表之前的关系为：

```
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| username    | varchar(255) |                            |
| password    | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                        user_role                        |
+-------------+--------------+----------------------------+
| roleId      | varchar(255) | PRIMARY KEY AUTO_INCREMENT |
| userId      | varchar(255) | PRIMARY KEY AUTO_INCREMENT |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                          role                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

> `@ManyToMany` 与`@JoinTable` 只需在存在多对多关系的两张表之间任意一张进行注解即可。

