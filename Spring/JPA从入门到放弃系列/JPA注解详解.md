# :sunrise:JPA注解详解

> 工作的最重要的动力是工作中的乐趣，是工作获得结果时的乐趣以及对这个结果的社会价值的认识。——爱因斯坦

## 持久化上下文

持久化上下文就是一个被命名的实体（entity）的 session。如果检索的对象已存在于持久性上下文中，则返回持久性上下文中的实体对象，而不从数据库中进行查询。

持久化上下文特点：

- 持久化上下文的生命周期与物理事务一致
- 持久化上下文提供自动脏检查
- <font color=#42b983>持久化上下文是一级缓存</font>

> [!tip]
> **自动脏检查**
>
> 在事务提交的时候，JPA会执行一个脏检查机制，会检查持久化上下文中的对象状态和数据库中的状态是否一致，如果不一致，就会根据持久化上下文中的状态对数据库进行更新。（该操作只会在数据库的事务提交的时候才会执行，如果事务回滚，则不会执行）。

## JPA生命周期

Entity 的生命周期有以下几个状态：

- transient：瞬态
- managed：受管
- removed：删除
- detached：分离

Entity 的状态有持久化上下文管理，状态切换图如下：

![](../../img/spring/jpa-states.png)

### transient

新实例化的实体对象的生命状态为 transient ，在这种状态下，对象还没有与持久化上下文关联，不表示任何数据库记录。

> 可以将这个状态的实体对象当作普通的 Java bean

### managed

一旦实际对象与持久化上下文关联上，那么它就处于 managed 态，这就意味着持久化代码将检测对象的任何更改，并在刷新持久化上下文时，根据变更的生成生成 update/insert 语句，将更新提交到数据库中。

### detached

当一个处于 managed 状态的实体对象，脱离了持久化上下文的关联，那么它就是处于 detached 状态。一般在持久化上下文关闭时，所获得的实体对象都是处于 detached 状态，也可以手动将实体对象转换为该状态。

当然，当对 detached 状态的实体对象进行 update 操作时，该实体对象又与持久化上下文关联上了，变为 managed 状态。

### removed

当一个处于 managed 状态的实体对象被删除时，该操作并不会立即删除该实体对应的数据库中的记录，改变的仅仅是该实体的状态，转换为 removed 态。

在持久化上下文刷新时，再根据 removed 态的对象生成 delete sql 语句。

### 小总结

熟悉 JPA Entity 的生命周期与持久化上下文，当我们进行 CRUD 操作的时候，可以清晰知道对象的状态，哪些会被刷新，哪些不会被刷新，这会让我们少踩很多坑，也对数据的持久化做到心中有数。

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

> [!attention]
> @Entity 与 @Table 中都存在 name 属性，它们之间有什么区别？
>
> - @Entity 中的 name 用于 JPQL 查询
> - @Table 中的 name 与实际表名对应

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
public @interface GeneratedValue {
    //指定ID的生成策略
    GenerationType strategy() default AUTO;
    //通过Sequences生成ID，常见的是Oracle数据库ID生成规则，需要配合@SequenceGenerator使用
    String generator() default "";
}
```

其中GenerationType提供了以下几种策略：

```java
public enum GenerationType {
    //通过表产生主键，框架由表模拟序列生成主键，使用该策略可以使应用更易于数据库迁移
    TABLE, 
    //通过序列产生主键，通过@SequenceGenerator注解指定序列名，MySQL不支持这种方式
    SEQUENCE, 
    //采用数据库ID自增长，一般用于MySQL数据库
    IDENTITY, 
    //JPA 自动选择合适的策略，是默认选项
    AUTO
}
```

其中，当我们使用 GenerationType.TABLE 策略时，JPA 默认会帮我们创建一个 hibernate_sequences 表（当然，需要开启启动时创建表配置）, 如果我们需要自定义生成主键的表，则可以配合 @TableGenerator 注解来使用。

### @Basic

@Basic表示属性是到数据库表的字段的映射。如果实体的字段上没有任何注解，默认即为@Basic。源码如下:

```java
public @interface Basic {
    //加载数据策略，有两个值选择，分别为：LAZY延迟加载 EAGER立即加载
    FetchType fetch() default EAGER;
    //设置这个字段是否可以为NULL，默认是true
    boolean optional() default true;
}
```

### @Transient

@Transient表示该属性并非一个到数据库表的字段的映射，表示非持久化属性，与@Basic作用相反。JPA映射数据库的时候忽略它。

### @Column

@Column定义该属性对应数据库中的列名。源码如下：

```java
public @interface Column {
    //数据库中表的列名，可选，如果不填写认为字段名和实体属性名一样
    String name() default "";

    //是否唯一，默认false, 可选
    boolean unique() default false;

    //数据字段是否允许为空，可选，默认false
    boolean nullable() default true;

    //执行insert的时候，是否包含此字段，默认true
    boolean insertable() default true;

    //执行update的时候，是否包含此字段，默认true
    boolean updatable() default true;

    //columnDefinition属性表示创建表时，该字段创建的SQL语句，一般用于通过Entity生成表定义时使用
    String columnDefinition() default "";

    //当前列所属的表的名称。
    String table() default "";

    //列的长度，仅对字符串类型的列生效。默认为255。
    int length() default 255;

    //列的精度，表示有效数值的总位数。默认为0。
    int precision() default 0;

    //列的精度，表示小数位的总位数。默认为0。
    int scale() default 0;
}
```

### @Temporal

@Temporal用来设置Date类型的属性映射到对应精度的字段。源码如下：

```java
public @interface Temporal {

    TemporalType value();
}
```

那么TemporalType有以下几种类型：

```java
public enum TemporalType {

    //映射为日期
    DATE, 

    //映射为时间
    TIME, 

    //映射为日期时间
    TIMESTAMP
}

```

举个栗子：

```java
@Temporal(TemporalType.DATE)
private Date createDate;
```

如果createDate不使用@Temporal, 默认的createDate则包含日期和时间

### @Enumerated

@Enumerated很好用，直接映射enum枚举类型的字段。源码如下：

```java
public @interface Enumerated {

    //枚举映射类型，默认时ORDINAL（枚举字段的下标）
    EnumType value() default ORDINAL;
}
```

EnumType有以下两个选项：

```java
public enum EnumType {
    //映射枚举字段的下标
    ORDINAL,
    //映射枚举的Name
    STRING
}
```

举个栗子：

```java
public enum EmployeeStatus {FULL_TIME, PART_TIME, CONTRACT}

@Entity
public class Employee {

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;
}
```

### @Lob

@Lob 将属性映射成数据库支持的大对象类型，支持以下两种数据库类型的字段。

- Clob（Character Large Ojects）类型是长字符串类型，java.sql.Clob、Character[]、char[]和String将被映射为Clob类型。
- Blob（Binary Large Objects）类型是字节类型，java.sql.Blob、Byte[]、byte[]和实现了Serializable接口的类型将被映射为Blob类型。
- Clob、Blob占用内存空间较大，一般配合@Basic(fetch=FetchType.LAZY)将其设置为延迟加载。

## 关联关系注解

### @JoinColumn

@JoinColumn用于定义外键关联的字段名称。源码如下：

```java
@Repeatable(JoinColumns.class)
@Target({METHOD, FIELD})
@Retention(RUNTIME)
public @interface JoinColumn {

    //目标表字段的名称
    String name() default "";

    //本实体的字段名，非必填，默认是本表ID
    String referencedColumnName() default "";

    //外键字段是否唯一
    boolean unique() default false;

    //外键字段是否允许为空
    boolean nullable() default true;

    //是否跟随一起新增
    boolean insertable() default true;

    //是否跟随一起更新
    boolean updatable() default true;

    //指定为列生成DDL时使用的SQL片段。
    String columnDefinition() default "";

    //指定该列对应的表名
    String table() default "";

    //用于指定或控制表生成时外键约束的生成
    ForeignKey foreignKey() default @ForeignKey(PROVIDER_DEFAULT);
}

```

@JoinColumn主要配合@OneToOne、@ManyToOne、@OneToMany一起使用，单独使用没有意义。

> @JoinColumns定义多个字段的关联关系。

### @OneToOne

@OneToOne用户描述关联表字段的一对一的关系。源码如下：

```java
public @interface OneToOne {
    //关系目标主体，非必填，默认该字段的类型
    Class targetEntity() default void.class;
    //指定级联操作策略
    CascadeType[] cascade() default {};
    //加载数据策略
    FetchType fetch() default EAGER;
    //是否允许为空
    boolean optional() default true;
    //关联关系被谁维护，非必填，一般不需要指定
    String mappedBy() default "";
    //是否级联删除，和CascadeType.REMOVE的效果一样，只要配置了两种中的一种就会自动级联删除
    boolean orphanRemoval() default false;
}

```

其中，CascadeType有几下类型：

```java
public enum CascadeType {
    //包括以下所有项 
    ALL, 
    //级联新建
    PERSIST, 
    //级联更新
    MERGE, 
    //级联删除
    REMOVE,
    //级联刷新
    REFRESH,
    //级联脱管/游离操作,如果你要删除一个实体，但是它有外键无法删除，你就需要这个级联权限了。它会撤销所有相关的外键关联
    DETACH
}
```

关于mappedBy的使用，需要注意以下点：

- 只有关系维护方才能操作两者的关系，被维护方即使设置了维护方属性进行存储也不会更新外键关联。
- mappedBy不能与@JoinColumn或者@JoinTable同时使用
- mappedBy的值指的是另一方的实体里面属性的字段，而不是数据库的字段，也不是实体的对象的名字

OneToOne需要配合@JoinColumn一起使用。注意：可以双向关联，也可以只配置一方，需要视实际需求而定。

### @OneToMany & @ManyToOne

@OneToMany：一对多关系
@ManyToOne: 多对一关系

@OneToMany与@ManyToOne可以相对存在，也可只存在一方。它们的源码如下：

```java
public @interface OneToMany {

    Class targetEntity() default void.class;
    CascadeType[] cascade() default {};
    FetchType fetch() default LAZY;
    String mappedBy() default "";
    boolean orphanRemoval() default false;
}

public @interface ManyToOne {

    Class targetEntity() default void.class;
    CascadeType[] cascade() default {};
    FetchType fetch() default EAGER;
    boolean optional() default true;
}
```

### @OrderBy

@OrderBy关联查询时排序，一般和@neToMany一起使用。源码如下：

```java
public @interface OrderBy {
    //要排序的字段， 默认是ASC
    String value() default "";
}
```

### @JoinTable

如果对象与对象之间有一个关联关系表的时候，就会用到@JoinTable，一般和@ManyToMany一起使用。源码如下：

```java
public @interface JoinTable {
    //中间关联关系表名
    String name() default "";
    String catalog() default "";
    String schema() default "";
    //主连接表字段
    JoinColumn[] joinColumns() default {};
    //被连接表的外键字段
    JoinColumn[] inverseJoinColumns() default {};
    ForeignKey foreignKey() default @ForeignKey(PROVIDER_DEFAULT);
    ForeignKey inverseForeignKey() default @ForeignKey(PROVIDER_DEFAULT);
    UniqueConstraint[] uniqueConstraints() default {};
    Index[] indexes() default {};
}
```

### @ManyToMany

@ManyToMany用于描述多对多的关系,和@OneToOne、@ManyToOne一样也有单向、双向之分。单向双向和注解没有关系，只看实体类之间是否相互引用。源码如下：

```java
public @interface ManyToMany {
    Class targetEntity() default void.class;
    CascadeType[] cascade() default {};
    FetchType fetch() default LAZY;
    String mappedBy() default "";
}

```

### 扩展：N+1问题

当使用@ManyToMany、@ManyToOne、@OneToMany、@OneToOne关联关系的时候，SQL真正执行的时候是由一条主表查询和N条子表查询组成的。这种查询效率一般比较低下，比如子对象有N个就会执行N+1条SQL。

可以采用以下方法进行优化：

- 减少 N+1 SQL 的条数
- 使用 @Fetch 来改变获取数据策略
- 使用 @EntityGraph

#### 减少N+1的SQL条数

通过在 application.properties 中可以新增以下配置：

```javascript
spring.jpa.properties.hibernate.default_batch_fetch_size=2
```

或者，也可以使用 @BatchSize 注解， 如：

```java
@OneToMany(fetch = FetchType.EAGER)
@JoinTable(
        name = "department_user_mapping",
        joinColumns = @JoinColumn(name = "department_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"))
@BatchSize(size = 2)
private List<User> users;
```

关于 size 的值配置，可以根据实际数据量来评估，不必设置的过高。

> @BatchSize 的使用具有局限性，不能作用于 @ManyToOne 和 @OneToOne 的关联关系上，那样代码是不起作用的。

#### 使用 @Fetch 来改变获取数据策略

Hibernate 提供了一个 @Fetch 注解，用来改变获取数据的策略。API如下：

```java
// fetch注解只能用在方法和字段上面
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Fetch {
    //注解里面，只有一个属性获取数据的模式
    FetchMode value();
}
//其中FetchMode的值有如下几种：
public enum FetchMode {
    //默认模式，就是会有N+1 sql的问题；
    SELECT,
    //通过join的模式，用一个sql把主体数据和关联关系数据一口气查出来
    JOIN,
    //通过子查询的模式，查询关联关系的数据
    SUBSELECT
}
```

其中，它们之间都有一些限制：

- <font color=#42b983>FetchMode.SELECT：</font> N+1 SQl问题
- <font color=#42b983>FetchMode.JOIN：</font> 只支持类似 findById(id) 的方法，只能根据 ID 查询才有效果
- <font color=#42b983>FetchMode.SUBSELECT：</font>虽然不限使用方式，但是只支持 OneToMany 的关联关系

#### @EntityGraph

JPA 2.1推出来的@EntityGraph、@NamedEntityGraph用来提高查询效率，很好地解决了N+1条SQL的问题。两者需要配合起来使用，缺一不可。@NamedEntityGraph配置在@Entity上面，而@EntityGraph配置在Repository的查询方法上面。

____

> [!attention]
>
> - 所有的注解要么全配置在字段上，要么全配置在get方法上，不能混用，混用就会启动不起来，但是语法配置没有问题。
> - 所有的关联都是支持单向关联和双向关联的，视具体业务场景而定。JSON序列化的时候使用双向注解会产生死循环，需要人为手动转化一次，或者使用@JsonIgnore。
> - 在所有的关联查询中，表一般是不需要建立外键索引的。@mappedBy的使用需要注意。
> - 级联删除比较危险，建议考虑清楚，或者完全掌握。
> - 不同的关联关系的配置，@JoinClumn里面的name、referencedColumnName代表的意思是不一样的，很容易弄混，可以根据打印出来的SQL做调整。
> - 当配置这些关联关系的时候建议大家直接在表上面，把外键建好，然后通过后面我们介绍的开发工具直接生成，这样可以减少自己调试的时间。


> [综合实例](https://github.com/LvanLiu/spring-boot-demo/blob/master/jpa-demo/src/test/java/com/lvan/jpademo/repository/MappingTableQueryTest.java)