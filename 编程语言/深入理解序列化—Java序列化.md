# 深入理解序列化——Java序列化

> :pencil2: 一个不注意小事情的人，永远不会成功大事业。——戴尔·卡耐基

## Java序列化的实现方式

实现Java序列化有三种方式：

- 自定义类实现`Serializable`，不包含`readObject`和`writeObject`方法，使用默认的序列化和反序列化方式进行数据写入和读取操作。

```java
public class Person implements Serializable
```

- 自定义类实现`Serializable`，同时包含`readObject`和`writeObject`方法，使用自定义的序列化和反序列化方式进行数据写入和读取操作。`readObject`方法和`writeObject`方法的可见性没有限制，可以是`private`、`protected`、`default`、`public`。

```java
public class Person implements Serializable {

    private void writeObject(ObjectOutputStream outputStream) throw Exception {}
    private void readObject(ObjectInputStream inputStream) throw Exception {}
}
```

- 自定义类实现`Externalizable`，通过覆盖`readExternal`方法和`writeExternal`方法来实现序列化和反序列化功能。`readExternal`方法和`writeExternal`方法的可见性没有限制，可以是`private`、`protected`、`default`、`public`。此外，还需要定义无参构造函数。

```java
public class Person implements Externalizable {

    public Person() {
    }

    private void writeObject(ObjectOutputStream outputStream) throw Exception {}
    private void readObject(ObjectInputStream inputStream) throw Exception {}
}
```

## Java序列化的核心类

### Serializable

`Serializable`是一个空接口，表明了实现自该接口的子类具有序列化行为特征，所有要支持序列化的类都应该实现这个接口。

### Externalizable

实现`Externalizable`接口的类，必须覆盖`writeExternal`和`readExternal`方法。

`writeExternal`的参数是`ObjectOutput`，表示输出对象的抽象，它继承自`DataOutput`，能支持基本类型、String、数组、对象的输出。实际应用中，会使用它的实现类`ObjectOutputStream`。

`readExternal`的参数是`ObjectInput`，表示输入对象的抽象，它继承自`DataInput`，能支持基本类型、String、数组、对象的输入。实际应用中，会使用它的实现类`ObjectInputStream`。

!> 自定义的类必须包含无参构造函数。

### ObjectOutputStream

`ObjectOutputStream`是实现序列化的关键类，它可以将一个对象转换成二进制流，然后通过`ObjectInputStream`将二进制流还原成对象。

`ObjectOutputStream`支持缓冲功能，序列化的时候，都是先把待写的数据写到缓冲区，直到缓冲区满后再执行真正的写入操作。它具有非阻塞与阻塞两种模式，阻塞模式每次将缓冲区数据写入之前会写入一个阻塞标记头部。

同时，`ObjectOutputStream`还能够处理多个对象引用同一个对象的情况，避免了重复写入的问题。

### ObjectInputStream

`java.io.ObjectInputStream`是实现Java反序列化的关键类，和`ObjectOutputStream`是对应的.

## Java序列化的高级特性

### transient关键字

Java序列化可以通过`transient`关键字来控制字段不被序列化。

### static关键字

`static`字段属于类全局共有，不会被序列化。在反序列化得到的结果里，静态变量的值依赖类对该静态字段的初始化操作以及是否在同一个JVM进程内。

### serialVersionUID

`serialVersionUID`用来实现类版本兼容，在实际开发中能满足类字段变化的需求。`serialVersionUID`字段必须是`static`+`final`类型，否则`serialVersionUID`字段不会被序列化。

如果不定义`serialVersionUID`字段，Java序列化会根据类字段和其他上下文计算一个默认值。但是，使用默认值的情况，如果类更新了，那么之前序列化的类再反序列化，就会出现异常。

### 序列化/反序列化hook

- **writeReplace方法**

`writeReplace`方法用于序列化写入时拦截并替换成一个自定义的对象。由于`writeReplace`方法调用是基于反射来执行的，所以作用域限定符不受限制，可以是`private`、`default`、`protected`、`public`中的任意一种。

- **readResolve方法**

`readResolve`方法用于反序列化拦截并替换成自定义的对象。但和`writeReplace`方法不同的是，如果定义了`readResolve`方法，`readObject`方法是允许出现的。

`readResolve`方法的工作原理为：

- 首先调用`readObject0`方法得到反序列化结果
- 如果`readResolve`方法存在，则会调用该方法返回自定义的对象
- 将自定义的对象作为`ObjectInputStream`的`readObject`的返回值

### 数据校验

Java序列化机制在反序列化时支持对数据进行校验。这是因为Java序列化后的数据是明文形式，有可能被修改。在反序列化过程中，为了安全起见，可以对读取到的数据进行校验。默认的Java反序列化是不会校验数据的。

使用数据校验特性，需要让自定义的序列化类实现`java.io.ObjectInputValidation`接口，通过调用回调函数`validateObject`来实现数据验证。

## Java序列化的安全性

Java序列化后的数据是明文形式，而且数据的组成格式有明确的规律。当这些数据脱离Java安全体系存在磁盘中时，可以通过二进制数编辑工具查看，甚至修改。如果这些数据注入了病毒，应用程序的表现行为将无法预计。为了保障数据的安全性，引入`SealedObject`和`SignedObject`对序列化数据进行加密。

## Java序列化编程规范

### 谨慎地实现Serializable接口

为什么要谨慎实现`Serializable`接口，有以下几点原因：

- 实现`Serializable`接口而付出的最大代价是，一旦一个类被发布，就大大降低了“改变这个类的实现”的灵活性。
- 实现`Serializable`接口的第二个代价是，它增加了出现Bug和安全漏洞的可能性。
- 实现`Serializable`接口的第三个代价是，随着类发行新的版本，相关的测试负担也增加了。

!> 内部类不应该实现Seriallizable。

### 考虑使用自定义的序列化形式

当你决定要将一个类做成可序列化的时候，需要仔细考虑应该采用什么样的序列化形式。只有当默认的序列化形式能够合理地描述对象的逻辑状态，才能使用，否则就要设计一个自定义的序列化形式，通过它合理地描述对象的形态。

当一个对象的物理表示法与它的逻辑数据内容有实质性的区别时，使用默认序列化形式会有以下几个缺点:

- 它使这个类的导出API永远地束缚在该类的内部表示法上
- 它会消耗过多的空间
- 他会消耗过多的时间
- 它会引起栈溢出

### 保护性编写readObject方法

`readObject`相当于另一个共有的构造函数，入参为字节流。由于字节流可伪造，导致反序列化产生不安全的实例，因此编写`readObject`可以参考以下建议:

- 对于对象引用域必须保持私有的类，要保护性地拷贝这些域中的每个对象。不可变类的可变组件就属于这一类别。
- 对于任何约束条件，如果检查失败，则抛出一个`InvalidObjectException`异常。这些检查动作应该跟在所有的保护性拷贝之后。
- 如果整个对象图在被发序列化之后必须进行验证，就应该使用`ObjectInputValidation`接口。
- 无论是直接方式还是间接方式，都不要调用类中任何可覆盖的方法。

### 对于实例控制，枚举类型优先于readResolve

你应该尽可能地使用枚举类型来实施实例控制条件的约束，这是因为枚举天然单例的特性。如果做不到，同时又需要一个既可序列化又是实例受控的类，就必须提供一个`readResolver`方法，并确保该类的所有实例域都为基本类型或者`transient`。

### 显示声明UID

显示声明`UID`可以避免对象不一致，但尽量不要以这种方式向JVM“撒谎”。

### 注意final变量的赋值

在反序列化`final`变量时，存在以下情况不会重新被赋值：

- 通过构造函数为`final`变量赋值
- 通过方法返回值为`final`变量赋值
- `final`修饰的属性不是基本类型
