# :sunrise: JPA从入门到放弃系列——JPA通过注解创建查询

> :pushpin: 千里之行，始于足下。不积跬步，无以致千里。 ——荀子《劝学篇》

## 通过注解创建查询方法

声明式注解来创建查询方法，需要了解以下几个注解：

- @Query
- @Param
- @Modifying
- @QueryHints

## @Query

先看一下语法及源码：

```java
public @interface Query {
	//指定JPQL的查询语句。(nativeQuery=true的时候，是原生的SQL语句)
	String value() default "";

    //定义一个特殊的count查询，用于分页查询时，查找页面元素的总个数。如果没有配置，将根据方法名派生一个count查询。
	String countQuery() default "";

	//根据哪个字段来count，如果没有配置countQuery和countProjection，将根据方法名派生count查询
	String countProjection() default "";

	//默认是false，表示value里面是不是原生的Sql语句
	boolean nativeQuery() default false;

	//可以指定一个query的名字，必须是唯一的。如果不指定，默认的生成规则是：{$domainClass}.${queryMethodName}
	String name() default "";

    //可以指定一个count的query名字，必须是唯一的。如果不指定，默认的生成规则是：{$domainClass}.${queryMethodName}
	String countName() default "";
}
```

### 注意事项

> 使用JPQL查询有一个好处，就是启动的时候知道语法正确与否

- 使用like查询，需要手动写上%关键字

```java
@Query(value = "select d from Department d where d.name like %?1")
List<Department> listByNameLike(String name);
```

- 使用原生SQL，不支持直接使用Sort来排序，需要手动将排序参数拼接到SQL中。分页也是如此

```java
@Query(value = "select * from department order by ?1", nativeQuery = true)
List<Department> listAllAfterSortBy(String sortField);
```

- 使用JPQL,可以直接使用Sort、Pageable来进行分页和排序

## @Param

默认情况下，参数是通过顺序绑定在查询语句上的。这使得查询方法对参数位置的重构容易出错。为了解决这个问题，你可以使用@ Param注解指定方法参数的具体名称，通过绑定的参数名字做查询条件。

举个栗子：

```java
@Query(value = "select d from Department d where d.id = :id")
Department getByDepartmentId(@Param("id") Integer id);
```

## @Modifying

当我们需要自定义更新或者插入SQL时，那就要使用@Modifying和@Query注解来完成来了，先看下@Modifying的源码：

```java
public @interface Modifying {

	boolean flushAutomatically() default false;
	boolean clearAutomatically() default false;
}
```

通过源码，可以看出Modifying提供了两种策略，默认为false，它们的作用是：

- clearAutomatically: 如果配置了一级缓存，并且我们在同一个接口更新了对象，接着查询这个对象，如果该参数为false, 那么查询到的这个对象就是没有更新前的一个状态，为了解决这个问题，就需要将clearAutomatically设置为true，相当于清除缓存，那么下次查询就会从数据库去查询。
- flushAutomatically： 如果清除缓存前，更新entity还没刷新到数据库中，为了避免配置clearAutomatically为true时导致缓存丢失，需要配置flushAutomatically为true，保证将更新的entity刷新到数据库中。

使用案例：

```java

```