# :sunrise: JPA从入门到放弃系列——JPA快速入门

> 学问之功，贵乎循序渐进，经久不息。——梁启超

## JPA项目创建

### 环境要求

- JDK 1.8及以上
- MAVEN 3.0及以上
- IntelliJ IDEA（可选）

### 数据库准备

创建用户表，SQL如下：

```SQL
create table user
(
    id    int auto_increment
        primary key,
    name  varbinary(64)  null,
    email varbinary(255) null
) comment '用户表';
```

### 集成JPA

> 基于SpringBoot 2.5.5版本集成JPA

- 引入JPA与MySQL依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

- 引入lombok依赖（可选）

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>compile</scope>
</dependency>
```

- 数据源配置

