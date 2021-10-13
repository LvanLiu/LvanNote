# :sunrise: JPA从入门到放弃系列——JPA通过注解创建查询

> :pushpin: 千里之行，始于足下。不积跬步，无以致千里。 ——荀子《劝学篇》

## 通过注解创建查询方法

声明式注解来创建查询方法，需要了解以下几个注解：

- @Query
- @Param
- @Modifying
- @QueryHints
- @Procedure

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

