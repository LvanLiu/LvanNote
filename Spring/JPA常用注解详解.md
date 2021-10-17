# :sunrise: JPA从入门到放弃系列——JPA常用注解详解

> 工作的最重要的动力是工作中的乐趣，是工作获得结果时的乐趣以及对这个结果的社会价值的认识。——爱因斯坦

## javax.persistence介绍

javax.persistence注意包括以下模块：

![img.png](../img/spring/JPA类层次结构图.png)

模块 | 说明 |
---------|----------
 EntityManagerFactory | 一个EntityManager的工厂类，创建并管理多个EntityManager实例
 EntityManager | 一个接口，管理持久化操作的对象，工作原理类似工厂的查询实例
 Entity | 实体是持久化对象，是存储在数据库中的记录
 EntityTransaction | 与EntityManager是一对一的关系，对于每一个EntityMnager，操作是由EntityTransaction类维护的
 Persistence | 这个类包含静态方法来获取EntityMangerFactory实例
 Query | 该接口由每个JPA供应商实现，能够获得符合标准的关系对象

上述的类和接口用于存储实体到数据库的一个记录，帮助程序员通过减少自己编写的代码将数据存储到数据库中，使他们能够专注于更重要的业务活动代码，如数据库表映射的类编写代码。

## 基础注解

### @Entity

通过Entity的源码了解它的功能：

```java
public @interface Entity {
    
    //可选，默认是此实体类的名字，全局唯一
	String name() default "";
}
```

@Entity定义对象将会成为被JPA管理的实体，将映射到指定的数据库表。

### @Table

@Table用于指定数据库的表名，源码如下：

```java
@Target(TYPE) 
@Retention(RUNTIME)
public @interface Table {
    //表的名字，可选。如果不填写，实体的名字就是表名
    String name() default "";

    //此表的catalog，可选
    String catalog() default "";

    //此表所在的schma，可选
    String schema() default "";

    //唯一性约束，只有创建表的时候有用，默认不需要
    UniqueConstraint[] uniqueConstraints() default {};
    
    //索引，只有创建表的时候有用，默认不需要
    Index[] indexes() default {};
}
```

### @Entity vs @Table

@Entity与@Table中都存在name属性，它们之间有什么区别？

- @Entity中的name用于JPQL查询
- @Table中的name与实际表名对应

### @Id

@Id定义属性为数据库的主键，一个实体里面必须有一个。

### @IdClass

@IdClass用于引入联合主键。源码如下：

```java
public @interface IdClass {
    //联合主键的类
    Class value();
}
```

作为联合主键的类，需要满足以下要求：

- 必须实现Serializable接口
- 必须有默认的public无参数的构造方法
- 必须覆盖equals和hashCode方法。equals方法用于判断两个对象是否相同，EntityManger通过find方法来查找Entity时是根据equals的返回值来判断的

> 扩展：[为什么重写了equals也要重写hashCode](https://juejin.cn/post/6844904005575901191)

### @GeneratedValue

@GeneratedValue为主键生成策略，它的源码如下：

```java

```