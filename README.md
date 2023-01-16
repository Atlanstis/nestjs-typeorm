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

当存在一张 `profile` 表，其存在一个字段 `userId` 对应 `user` 表的 `id` 字段，即可用注解 `OneToOne` 与 `JoinColumn` 来进行映射。此时 **Profile Entity** 的内容如下所示（路径为 `src/profile/profile.entity.ts`）：

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

