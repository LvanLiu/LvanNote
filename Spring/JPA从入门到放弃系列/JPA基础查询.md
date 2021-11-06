# JPA基础查询

> :pencil2: 博观而约取，厚积而薄发。——苏轼

## Repository介绍

`Repository`位于Spring Data Common的lib里面，是Spring Data 里面做数据库操作的最底层的抽象接口、最顶级的父类，源码里面其实什么方法都没有，仅仅起到一个标识作用。管理域类以及域类的id类型作为类型参数，此接口主要作为标记接口捕获要使用的类型，并帮助你发现扩展此接口的接口。Spring底层做动态代理的时候发现只要是它的子类或者实现类，都代表储存库操作。

```java
@Indexed
public interface Repository<T, ID> {
}
```

Spring 在做动态代理的时候，只要是它的子类或者实现类，再利用 `T` 类以及 `T`类的 主键 `ID` 类型作为泛型的类型参数，就可以来标记出来、并捕获到要使用的实体类型，就能帮助使用者进行数据库操作。

----

**我们需要掌握使用的7大 Repository 接口：**

接口 | 描述 | 所在模块
---------|----------|---------
 Repository</font> | 基础接口，用于暴露Entity以及主键 | spring-data-common
 CrudRepository | 简单的CRUD方法 | spring-data-common
 PagingAndSortingRepository | 带分页和排序的方法 | spring-data-common
 QueryByExampleExecutor | 简单 Example 查询 | spring-data-common
 QueryDslPredicateExecutor | QueryDsl 的封装 | spring-data-common
 <font color=#42b983>JpaRepository<font> | <font color=#42b983>JPA 的扩展方法</font> | <font color=#42b983>spring-data-jpa</font>
 <font color=#42b983>JpaSpecificationExecutor</font> | <font color=#42b983>支持支持Criteria查询</font> | <font color=#42b983>spring-data-jpa</font>

**两大 Repository 实现类：**

实现类 | 描述 | 所在模块
---------|----------|---------
 SimpleJpaRepository | JPA 所有接口的默认实现类 | spring-data-jpa
 QueryDslJpaRepository | QueryDsl 的实现类 | spring-data-jpa

**类的结构关系如下：**

![img.png](../../img/spring/Repository.png ':size=50%')

## CrudRepository详解

`CrudRepository`接口提供了公共的通用的CRUD方法，API如下：

```java
@NoRepositoryBean
public interface CrudRepository<T, ID> extends Repository<T, ID> {
    //单个Entity的持久化
	<S extends T> S save(S entity);

    //批量Entity的持久化，循环调用以上的 save 方法
	<S extends T> Iterable<S> saveAll(Iterable<S> entities);

    //根据主键查询实体，及早加载
	Optional<T> findById(ID id);

    //根据主键判断实体是否存在
	boolean existsById(ID id);

    //查询实体的所有列表
	Iterable<T> findAll();

    //）根据主键列表查询实体列表
	Iterable<T> findAllById(Iterable<ID> ids);

    //查询总数
	long count();

    //根据主键id进行删除，会先根据id查询是否存在，若存在再进行删除
	void deleteById(ID id);

    //根据entity，entity的主键不允许空，否则该方法无效
	void delete(T entity);
	void deleteAllById(Iterable<? extends ID> ids);
	void deleteAll(Iterable<? extends T> entities);
	void deleteAll();
}
```

这里需要特殊说明下`save`方法，JPA将新增和更新统一封装到这个方法下了，通过`SimpleJpaRepository#save`来看下原理：

```java
@Transactional
@Override
public <S extends T> S save(S entity) {
    if (entityInformation.isNew(entity)) {
        em.persist(entity);
        return entity;
    } else {
        return em.merge(entity);
    }
}
```

我们发现它是先检查传进去的实体是不是存在，然后判断是 `update` 还是 `insert`；是不是存在两种根据机制：

- 根据主键来判断
- 根据 `Version`（乐观锁） 来判断

如果我们去看JPA控制台打印出来的SQL，最少会有两条，一条是查询，一条是`insert`或者`update`。

?> _DEMO_ [CrudRepository](https://github.com/LvanLiu/spring-boot-demo/blob/master/jpa-demo/src/test/java/com/lvan/jpademo/repository/CrudRepositoryTest.java)

## PagingAndSortingRepository详解

`PagingAndSortingRepository`继承`CrudRepository`所有的基本方法，它增加了分页和排序等查询方法，API如下：

```java
@NoRepositoryBean
public interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {
    //根据排序取所有对象的集合
	Iterable<T> findAll(Sort sort);

    //根据分页和排序进行查询，并用Page对象封装。Pageable对象包含分页和Sort对象
	Page<T> findAll(Pageable pageable);
}
```

### 排序查询

```java
//单参数排序
//利用Sort的Direction来实现
Sort sort = Sort.by(Sort.Direction.DESC, "xx");
//利用Sort的Order来实现
Sort sort = Sort.by(Sort.Order.desc("xxx"));

//多参数排序
//适用于参数不同的排序
Sort sort = Sort.by(Sort.Order.desc("xxx"), Sort.Order.desc("xxx"));

//这种更直观
List<Sort.Order> orders = Sort.by(Sort.Order.desc("xxx")).and(Sort.Order.desc("xxx")).toList();
Sort sort = Sort.by(orders);

//适用于多个参数都是同一种排序
Sort sort = Sort.by(Sort.Direction.DESC, "xxx", "xxx");
```

### 分页查询

`Pageable`是一个接口，提供了分页一组方法的声明，如第几页，每页多少条记录，排序信息等, 提供以下功能：

```java
int getPageNumber();

int getPageSize();

int getOffset();

Sort getSort();

Pageable next();

Pageable previousOrFirst();

Pageable first();

boolean hasPrevious();
```

`PageRequest`是`Pageable`的实现类，用法如下：

```java
//通过PageRequest.of快速构建，pageNum从0开始。
PageRequest pageRequest = PageRequest.of(pageNum, pageSize);

//排序以及分页
Sort sort = Sort.by(Sort.Direction.DESC, "xx");
PageRequest pageRequest = PageRequest.of(pageNum, pageSize，sort);
```

?> _DEMO_ [PagingAndSortingRepository](https://github.com/LvanLiu/spring-boot-demo/blob/master/jpa-demo/src/test/java/com/lvan/jpademo/repository/PagingAndSortingRepositoryTest.java)

## QueryByExampleExecutor详解

按示例查询（QBE）是一种用户友好的查询技术，具有简单的接口。它允许动态查询创建，并且不需要编写包含字段名称的查询。

它所提供的功能如下：

```java
public interface QueryByExampleExecutor<T> {

	<S extends T> Optional<S> findOne(Example<S> example);
	<S extends T> Iterable<S> findAll(Example<S> example);
	<S extends T> Iterable<S> findAll(Example<S> example, Sort sort);
	<S extends T> Page<S> findAll(Example<S> example, Pageable pageable);
	<S extends T> long count(Example<S> example);
	<S extends T> boolean exists(Example<S> example);
}
```

`QueryByExampleExecutor`提供了以`Example`作为入参的查询方法，需要掌握该接口的用户，需要先了解 `Example`。

!> 使用 `QueryByExampleExecutor` 可以实现动态查询。

### ExampleMatcher使用

- <font color=#42b983>指定查询条件连接方式</font>

使用`and`/`or`对查询条件进行连接，API接口如下：

```java
public interface ExampleMatcher {

	static ExampleMatcher matching() {
		return matchingAll();
	}

	static ExampleMatcher matchingAny() {
		return new TypedExampleMatcher().withMode(MatchMode.ANY);
	}

	static ExampleMatcher matchingAll() {
		return new TypedExampleMatcher().withMode(MatchMode.ALL);
	}
}
```

- <font color=#42b983>matching/matchingAll:</font> 使用 `and` 来对查询条件进行连接
- <font color=#42b983>matchingAny：</font> 使用 `or` 来对查询条件进行连接

!> 不支持过滤条件分组，只支持简单一层的用 `and` 或者 `or` 连接

----

- <font color=#42b983>NULL值处理</font>

`ExampleMatcher`提供了空值处理选项，源码如下：

```java
default ExampleMatcher withIncludeNullValues() {
	return withNullHandler(NullHandler.INCLUDE);
}

default ExampleMatcher withIgnoreNullValues() {
	return withNullHandler(NullHandler.IGNORE);
}

ExampleMatcher withNullHandler(NullHandler nullHandler);

//定义空值处理方式
enum NullHandler {
	INCLUDE, IGNORE
}
```

根据以上源码，ExampleMather 提供了两种 NULL 值处理方式：

- <font color=#42b983>INCLUDE：</font>包括
- <font color=#42b983>IGNORE：</font> 忽略 （默认）

它们的作用标识作为条件的实体对象，一个属性值(条件值)为 `NULL` 时，表示是否参与过滤。当该选项值是 `INCLUDE` 时，表示仍参与过滤，会匹配数据库表中该字段值是 `Null` 的记录；若为 `IGNORE` 值，表示不参与过滤。

----

- <font color=#42b983>字符串匹配</font>

`ExampleMatcher`提供了字符串匹配方式选项，源码如下：

```java
public PropertySpecifier withStringMatcher(StringMatcher stringMatcher) {

	Assert.notNull(stringMatcher, "StringMatcher must not be null!");
	return new PropertySpecifier(this.path, stringMatcher, this.ignoreCase, this.valueTransformer);
}

enum StringMatcher {
	DEFAULT,
	EXACT,
	STARTING,
	ENDING,
	CONTAINING,
	REGEX;
}
```

`StringMatcher`中定义了6个可选值：

- <font color=#42b983>DEFAULT：</font>默认，效果同EXACT
- <font color=#42b983>EXACT：</font>相等
- <font color=#42b983>STARTING：</font>开始匹配
- <font color=#42b983>ENDING：</font>结束匹配
- <font color=#42b983>CONTAINING：</font>包含，模糊匹配
- <font color=#42b983>REGEX：</font>正则表达式

当我们使用`withStringMatcher`来匹配时，那么该配置对所有字符串属性过滤有效（封装条件类实体对象中的所有字符串），除非该属性在 `propertySpecifiers` 中单独定义自己的匹配方式。

当我们需要指定字段来进行字符串匹配时，可以采用以下两个方法：

```java
ExampleMatcher withMatcher(String propertyPath, GenericPropertyMatcher genericPropertyMatcher);
default ExampleMatcher withMatcher(String propertyPath, MatcherConfigurer<GenericPropertyMatcher> matcherConfigurer)

//A matcher that specifies StringMatcher string matching and case sensitivity. 
class GenericPropertyMatcher {
	public static GenericPropertyMatcher of(StringMatcher stringMatcher, boolean ignoreCase){..}
	public static GenericPropertyMatcher of(StringMatcher stringMatcher) {....}
	public GenericPropertyMatcher ignoreCase() {....}
	public GenericPropertyMatcher ignoreCase(boolean ignoreCase) {....}
	public GenericPropertyMatcher caseSensitive() {}
	public GenericPropertyMatcher contains() {....}
	public GenericPropertyMatcher endsWith() {....}
	public GenericPropertyMatcher startsWith() {....}
	public GenericPropertyMatcher exact() {....}
	public GenericPropertyMatcher storeDefaultMatching() {....}
	public GenericPropertyMatcher regex() {....}
	public GenericPropertyMatcher stringMatcher(StringMatcher stringMatcher) {....}
	public GenericPropertyMatcher transform(PropertyValueTransformer propertyValueTransformer){..}
}
```

`withMatcher`方法的第一个参数是需要匹配的字段，第二个参数则可以参考源码中`GenericPropertyMatcher`的定义，来选择字符串的匹配方式。

----

- <font color=#42b983>忽略属性列表</font>

通过以下方法，来标识需要忽略的字段：

```java
withIgnorePaths(String... ignoredPaths)
```

它的作用是忽略属性列表，忽略的属性不参与查询过滤。虽然某些字段里面有值或者设置了其他匹配规则，只要放在`ignoredPaths`中，就会忽略此字段的，不作为过滤条件。

----

- <font color=#42b983>忽略大小写</font>

通过以下方法，来选择大小写是否忽略：

```java
default ExampleMatcher withIgnoreCase() {
	return withIgnoreCase(true);
}
withIgnoreCase(true/false),
withIgnoreCase(String... propertyPaths)
```

它的作用是默认大小写忽略方式，布尔型，当值为`false`时，即不忽略，大小不相等。

当我们使用 `withIgnoreCase()` 或 `withIgnoreCase(true/false)` 方法时，该配置对所有字符串属性过滤有效。当我们需要指定特定字段忽略大小写，则可以采用 `withIgnoreCase(String... propertyPaths)` 方法。

### Example详解

Example主要包括三部分内容：

- <font color=#42b983>Probe</font>
  - 实体对象，在持久化框架中与Table对应的域对象，一个对象代表数据库表中的一条记录。在构建查询条件时，一个实体对象代表的是查询条件中的“数值”部分，因此，实体对象也就是查询条件的封装类。
- <font color=#42b983>ExampleMather</font>
  - 匹配器，它是匹配“实体对象”的，表示如何使用“实体对象”中的“值”进行查询，它代表的是“查询方式”，解释了如何去查的问题。
- <font color=#42b983>Example</font>
  - 实例对象，代表的是完整的查询条件。由实体对象和匹配器共同构建。

```java
public interface Example<T> {

	static <T> Example<T> of(T probe) {
		return new TypedExample<>(probe, ExampleMatcher.matching());
	}

	static <T> Example<T> of(T probe, ExampleMatcher matcher) {
		return new TypedExample<>(probe, matcher);
	}

	T getProbe();

	ExampleMatcher getMatcher();

	@SuppressWarnings("unchecked")
	default Class<T> getProbeType() {
		return (Class<T>) ProxyUtils.getUserClass(getProbe().getClass());
	}
}
```

?> _DEMO_ [QueryByExampleExecutor](https://github.com/LvanLiu/spring-boot-demo/blob/master/jpa-demo/src/test/java/com/lvan/jpademo/repository/QueryByExampleExecutorTest.java)

## JpaRepository详解

`JpaRepository`到这里可以进入分水岭了，上面的那些都是Spring Data为了兼容NoSQL而进行的一些抽象封装，从`JpaRepository`开始是对关系型数据库进行抽象封装。

```java
@NoRepositoryBean
public interface JpaRepository<T, ID> extends PagingAndSortingRepository<T, ID>, QueryByExampleExecutor<T> {
    //以下是全量查询功能，能够返回List对象
    List<T> findAll();
    List<T> findAll(Sort sort);
    List<T> findAllById(Iterable<ID> ids);

    //批量保存，能够返回List对象
    <S extends T> List<S> saveAll(Iterable<S> entities);

    //将缓存中的更新，刷新到数据库中
    void flush();
    //save + flush
    <S extends T> S saveAndFlush(S entity);
    //saveAll + flush
    <S extends T> List<S> saveAllAndFlush(Iterable<S> entities);

    void deleteAllInBatch(Iterable<T> entities);
    void deleteAllByIdInBatch(Iterable<ID> ids);
    void deleteAllInBatch();

    T getById(ID id);
    <S extends T> List<S> findAll(Example<S> example);
    <S extends T> List<S> findAll(Example<S> example, Sort sort);
}
```

### flush机制

在一个开启事务的方法中，JPA会将查询结果保存到一级缓存中，我们对这个对象字段进行更新，更新结果也会同步到缓存中。当我们调用 `save`/`saveAll` 方法时，JPA并不会立即将更新结果刷新到数据库中，而是延迟到事务提交时，再进行提交。

因此，当我们需要及早将更新结果刷新到DB中，可以使用调用 `save` 方法后，调用 `flush` 方法，也可以直接调用 `saveAndFlush`/`saveAllAndFlush` 方法。

### getById VS findById

CrudRepository提供了一个 `findById` 方法，为什么 JpaRepository 还需要提供一个 `getById` 方法呢？实际上，他们有以下重要区别：

- <font color=#42b983>getById:</font> 懒加载形式，调用此方法返回的是`entity`的代理类，等到该`entity`真正被使用的时候，才触发 SQL 查询。
- <font color=#42b983>findById:</font> 及早加载形式，调用此方法就会触发 SQL 查询。

使用`getById`需要保证`getById`在事务中，因为 JPA 会将查询到的结果保存到一级缓存中，如果不在事务中，就会抛出异常。当然，开启事务对性能也会有所影响，那如何避免这个问题呢？

我们可以使用在 `Entity` 上使用 `@Proxy(lazy = false)` 注解来关闭延迟加载的特性。

### deleteAllByIdInBatch VS deleteAllById()

- <font color=#42b983>deleteAllByIdInBatch:</font> 使用 `delete from xxx where id in (?)` 的形式来删除
- <font color=#42b983>deleteAllById:</font> 遍历 `delete` 函数来实现批量删除

!> 使用 deleteAllByIdInBatch 的性能较高。

?> _DEMO_ [JpaRepository](https://github.com/LvanLiu/spring-boot-demo/blob/master/jpa-demo/src/test/java/com/lvan/jpademo/repository/JpaRepositoryTest.java)

## JpaSpecificationExecutor详解

`JpaSpecificationExecutor`是JPA 2.0提供的`Criteria API`，可以用于动态生成`query`。Spring DataJPA支持`Criteria`查询，可以很方便地使用，足以应付工作中的所有复杂查询的情况了，可以对JPA实现最大限度的扩展。它提供了以下功能：

```java
public interface JpaSpecificationExecutor<T> {
	//根据Specification条件查询单个对象
	Optional<T> findOne(@Nullable Specification<T> spec);

	//根据Specification条件查询List结果
	List<T> findAll(@Nullable Specification<T> spec);

	//根据Specification条件，分页查询
	Page<T> findAll(@Nullable Specification<T> spec, Pageable pageable);

	//根据Specification条件，带排序地查询结果
	List<T> findAll(@Nullable Specification<T> spec, Sort sort);

	//根据Specification条件，查询数量
	long count(@Nullable Specification<T> spec);
}
```

### Criteria介绍

- <font color=#42b983>Root:</font> 代表了可以查询和操作的实体对象的根。如果将实体对象比喻成表名，那 `root` 里面就是这张表里面的字段。这不过是 JPQL 的实体字段而已。通过里面的  `Path<Y>get(StringattributeName)` 来获得我们操作的字段。
- <font color=#42b983>CriteriaQuery:</font> 代表一个 `specific` 的顶层查询对象，它包含着查询的各个部分，比如：`select`、`from`、`where`、`group by`、`order by`等。
- <font color=#42b983>CriteriaBuilder:</font> 用来构建 `CritiaQuery` 的构建器对象，其实就相当于条件或者是条件组合，以谓语即 `Predicate` 的形式返回。

!> JpaSpecificationExecutor 适用于复杂查询、动态查询场景

?> _DEMO_ [JpaSpecificationExecutor](https://github.com/LvanLiu/spring-boot-demo/blob/master/jpa-demo/src/test/java/com/lvan/jpademo/repository/JpaSpecificationExecutorTest.java)