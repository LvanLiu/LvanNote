# :cyclone:volatile专题

> 哪里有阴影，哪里就有光. -雨果

## volatile初步了解

Java编程语言允许线程访问共享变量，为了确保共享变量能被准确和一致地更新，线程应该确保通过排他锁单独获得这个变量。Java语言提供了volatile，在某些情况下比锁要更加方便。如果一个字段被声明成volatile，Java线程内存模型确保所有线程看到这个变量的值是一致的。

如果volatile变量修饰符使用恰当的话，他比synchronized的使用和执行成本更低，因为它不会引起线程上下文的切换和调度。

## volatile在双重检查单例中的应用

根据 [单例模式](../程序设计/设计模式—单例模式.md) 的学习，可以知道双向检查型单例可以实现单例的懒加载，避免了系统启动的时候，加载了太多的单例，造成大量内存被占用的问题。

我们看下双重检查单例模式的代码：

```java
public class LazySingleton {

    private static volatile LazySingleton instance;

    private LazySingleton() {
    }

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}
```

以上instance变量，使用了volatile来声明了，为什么使用了双重检查，还需要加上volatile呢？

如果去掉了volatile，那么这一行代码就会产生问题：

```java
instance = new LazySingleton();
```

构造函数实际上包括了以下三个操作：

```java
memory = allocate();    //给对象分配内存空间
ctorInstance(memory);   //初始化对象
instance = memory;      //设置instance指向刚分配的内存地址
```

那么上面的操作，可能会被重排序，最后的执行时序如下：

```java
memory = allocate();    //给对象分配内存空间
instance = memory;      //设置instance指向刚分配的内存地址
ctorInstance(memory);   //初始化对象
```

以上的重排序，遵循了as-if-serial规则，不会改变单线程程序执行的结果，也就是重排序仅仅是为了提供性能而作的优化而已，但这个只能保证在单CPU的情况下不出问题，如果换成多线程呢？

假设存在两个线程，分别为线程A，线程B，线程A正在构造对象，这时候，线程B立即访问这个对象，示意图如下：

![](../img/编程语言/双重检查重排序.png)

当设置instance指向分配的内存地址，这个时候instance就不为空，那么线程B就可以访问到这个对象了。

## volatile原理


## volatile内存语义

## volatile与原子性问题