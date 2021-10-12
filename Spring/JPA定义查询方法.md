# :sunrise: JPA从入门到放弃系列——JPA定义查询方法

> :pushpin: 千里之行，始于足下。不积跬步，无以致千里。 ——荀子《劝学篇》

## 定义查询的方法

定义查询的方法有以下两种方法：

- 声明方法名称
- 通过@Query手动定义的查询

我们可以通过配置方法的查询策略，以决定使用以上哪一种策略。JPA通过@EnableJpaRepository(QueryLookupStrategy.Key.CREATE_IF_NOT_FOUND)注解提供了支持。

其中QueryLookupStrategy.Key的值一共有三个：

- CREATE：直接根据方法名创建。
- USE_DECLARED_QUERY: 声明式创建，即是通过注解方式。
- CREATE_IF_NOT_FOUND：这个是默认的，以上两种方式的结合版。先用声明方式进行查找，如果没有找到与方法相匹配的查询，就用create的方法名创建规则创建一个查询。

> 一般直接使用默认的，除非有特殊的需求。

## 通过方法命名创建查询方法

JPA支持通过函数的命名来创建SQL查询，这些函数由查询策略（关键字）、查询字段和一些限制条件组成。类似以下格式：

```java
find…By、read…By、query…By、count…By、get…By
```

JPA直接的关键字，可以参考[Query Creation](https://docs.spring.io/spring-data/jpa/docs/2.5.5/reference/html/#reference)

### Projections对查询结果的扩展

Spring JPA对Projections扩展的支持是非常好的。从字面意思上理解就是映射，指的是和DB查询结果的字段映射关系。一般情况下，返回的字段和DB查询结果的字段是一一对应的，但有的时候，我们需要返回一些指定的字段，不需要全部返回，或者只返回一些复合型的字段，还要自己写逻辑。Spring Data正是考虑到了这一点，允许对专用返回类型进行建模，以便我们有更多的选择，将部分字段显示成视图对象。

## 通过注解创建查询方法

声明式注解来创建查询方法，需要了解以下几个注解：

- @Query
- @Param
- @Nullable
- @Modifying
- @QueryHints
- @Procedure

### @Query



### 实战

- 自定义查询方法排序

Repository声明声明函数：

```java
@Repository
public interface UserRepository extends JpaRepositoryImplementation<User, Integer> {

    List<User> findAllByName(String name, Sort sort);
}
```

使用声明的函数进行查询和排序：

```java
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Resource
    private UserRepository userRepository;

    @Override
    public List<User> fetchAllByNameAndSort(String name) {

        Sort sort = Sort.by("name");
        return userRepository.findAllByName(name, sort);
    }
}
```

- 自定义分页查询

自定义分页查询，可以通过设置返回结果类型来标识是否需要进行总数查询：

- 查询总数：返回结果设置为Page
- 不查询总数：返回结果可以设置为List或者Slice, 而Slice的作用是，只知道是否有下一个Slice可用，不会执行count。

Repository声明声明函数：

```java
@Repository
public interface UserRepository extends JpaRepositoryImplementation<User, Integer> {

    Page<User> findAllByName(String name, Pageable pageable);
    Slice<User> findAllByEmail(String email, Pageable pageable);
}
```

使用声明的函数进行查询和排序：

```java
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Resource
    private UserRepository userRepository;

    @Override
    public Page<User> pageAllByName(String name, int pageNum, int pageSize) {

        PageRequest pageRequest = PageRequest.of(pageNum, pageSize);
        return userRepository.findAllByName(name, pageRequest);
    }

    @Override
    public Slice<User> pageAllByEmail(String email, int pageNum, int pageSize) {

        PageRequest pageRequest = PageRequest.of(pageNum, pageSize);
        return userRepository.findAllByEmail(email, pageRequest);
    }
}
```

- 获取年龄最大的用户

获取年龄最大的，可以使用关键字来快速实现，如first或top, 如：

```java
@Repository
public interface UserRepository extends JpaRepositoryImplementation<User, Integer> {
    User findFirstByOrderByAgeDesc();
    List<User> findTop2ByOrderByAgeDesc();
}
```

查询方法的结果可以通过关键字来限制first或top，其可以被互换地使用。可选的数值可以追加到顶部/第一个以指定要返回的最大结果大小。如果数字被省略，则假设结果大小为1。限制表达式也支持Distinct关键字。