# :sunrise: JPA从入门到放弃系列——JPA基础查询实战

> 把每件一般的事做好显现不一般；把每件简单的事做好显现不简单；把每件平凡的事做好显现不平凡。

## JPA自动建表

在进行JPA基础查询实战前，我们需要先建立一张用户表。我们可以通过手写SQL的形式来创建，也可以通过JPA来创建。这次，我采用JPA的方式来创建表。

1. 配置开始生成ddl

```javascript
spring.jpa.show-sql=true
spring.jpa.generate-ddl=true
```

2. 建立User Entity

```java
@Getter
@Setter
@Entity
@Table(name = "user")
public class User {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Integer id;
    
    @Column(length = 16)
    private String name;
    
    private Integer age;
    
    @Column(length = 255)
    private String email;
}
```

3. 启动项目，检查User表是否被创建

通过查看项目启动日志，我们可以看到，JPA生成的DDL语句：

```mysql
create table user
(
    id    integer not null auto_increment,
    age   integer,
    email varchar(255),
    name  varchar(16),
    primary key (id)
) engine = InnoDB
```

同时，数据库中也存在user表。

## 建立Service

建立UserService前，需要创建UserRepository

```java
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}
```

定义UserService接口以及实现类

```java
public interface UserService {
}

@Service
public class UserServiceImpl implements UserService {
}
```

## 实战1：CRUD基础使用

UserService需要提供以下几个功能：

- 用户注册
- 根据用户id查询用户
- 用户年龄增加
- 全量查询用户信息

### 用户注册

用户注册本质上是对用户进行新增，使用save(T t)方法新增即可。

```java
@Override
public User userRegister(User newUser) {
    return userRepository.save(newUser);
}
```

实际是调用到了CrudRepository接口的save方法，返回的实体对象中也包含了user主键id的值。

### 根据用户id查询用户

使用CrudRepository提供的findById方法，可以实现根据主键查询到用户, 实现如下：

```java
@Override
public User fetchUser(Integer id) {
    Optional<User> userOptional = userRepository.findById(id);
    return userOptional.orElseThrow(() -> new NotFoundException("系统无此用户"));
}
```

由于findById返回的是Optional，所以这里我需要做下处理，如果找不到则抛出异常（也可以返回Optional，由上层来判空处理）。

### 用户年龄增加

用户年龄增加实际上还是调用到CrudRepositoy的save方法，save实际上是根据主键判断数据是否存在，若存在则更新，否则就新增。实现代码如下：

```java
@Override
public User userAgeGrow(Integer id) {

    User user = fetchUser(id);
    user.setAge(user.getAge() + 1);
    return userRepository.save(user);
}
```

### 全量查询用户信息

由于CrudRepository提供的findAll()方法的返回值是Iterable类型，这个使用场景还是比较少的，用JpaRepository的findAll()方法，返回值是List类型，这个使用场景最多。实现代码如下：

```java
@Override
public List<User> fetchAllUsers() {
    return userRepository.findAll();
}
```

## 实战2：排序查询

UserService需要提供一个根据年龄倒序查询用户信息，实现排序查询的方法，可以使用PagingAndSortingRepository的findAll(Sort sort)方法，但在实际开发中，使用JpaRepository提供的findAll(Sort sort)方法更好。

- 利用Sort by(String... properties)方法来实现：

```java
@Override
public List<User> fetchAllUsersBySortAge() {
    Sort sort = Sort.by("age").descending();
    return userRepository.findAll(sort);
}
```

- 利用Sort by(Order... orders)方法来实现：

```java
@Override
public List<User> fetchAllUsersBySortAge() {
    Sort.Order order = Sort.Order.desc("age");
    Sort sort = Sort.by(order);
    return userRepository.findAll(sort);
}
```

## 实战3：分页查询

```java
@Override
public Page<User> fetchUsersByPage(int pageNum, int pageSize) {

    PageRequest pageRequest = PageRequest.of(pageNum, pageSize);
    return userRepository.findAll(pageRequest);
}
```

## 实战4：flush与JPA生命周期实战

## 实战5：QueryByExampleExecutor实战

## 实战6：动态查询