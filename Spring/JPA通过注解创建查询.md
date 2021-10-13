# :sunrise: JPA从入门到放弃系列——JPA通过注解创建查询

> :pushpin: 千里之行，始于足下。不积跬步，无以致千里。 ——荀子《劝学篇》

## 通过注解创建查询方法

声明式注解来创建查询方法，需要了解以下几个注解：

- @Query
- @Param
- @Nullable
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

Query使用案例