# :sunrise: JPA从入门到放弃系列——JPA快速入门

> :pushpin: 学问之功，贵乎循序渐进，经久不息。——梁启超

## JPA项目创建

### 环境要求

- JDK 1.8及以上
- MAVEN 3.0及以上
- IntelliJ IDEA（可选）

### 数据库准备

创建用户表，SQL如下：

```mysql
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

```javascript
spring.datasource.name=jpa-demo
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/demo
spring.datasource.username=guest
spring.datasource.password=guest
```

### 编写代码

1. 创建一个Entity，代码如下：

```java
@Getter
@Setter
@Entity
public class User {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Integer id;
    private String name;
    private String email;
}
```

2. 继承CrudRepository接口，获得增删改查能力，代码如下：

```java
@Repository
public interface UserCrudRepository extends CrudRepository<User, Integer> {
}
```

3. 编写测试类

可以通过编写测试来测试CrudRepository的功能。

```java
@SpringBootTest
class UserCrudRepositoryTest {

    @Resource
    private UserCrudRepository userCrudRepository;

    @Test
    void testFindAll() {
        Iterable<User> users = userCrudRepository.findAll();
        assertThat(users).isNotNull();
    }
}
```
