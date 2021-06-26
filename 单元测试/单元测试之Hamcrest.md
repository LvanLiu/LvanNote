# 单元测试之Hamcrest

> 由于最近在阅读Spring源码，避免不了需要阅读Spring的单元测试，这可以更快帮助我理解一个类的作用以及使用，也是基于此原因，我发现了Spring的单元测试基本都是搭配[**Hamcrest**](http://hamcrest.org/)一起使用的，功能比Junit自带的断言更加强大。

## Hamcrest简介

Hamcrest是Java生态系统中用于单元测试的著名框架，捆绑在Junit中，简单的说，它是使用谓词（也称之为匹配器）进行断言的。

## Hamcrest与Junit自带的断言比较

Junit原生断言器Assertions总体只是提供了以下几种比较简单的断言：

- assertAll：用于将多个测试语句放在一个组中执行
- assetArrayEquals： 比较数组是否相等
- assetEquals：比较对象或者数据类型是否相等
- assertNotNull：断言对象是否为空

总体来说，Junit的原生断言器是比较简单的相等语义的断言。

而Hamcrest提供的断言功能更加灵活，提供了大量丰富的[匹配器](http://hamcrest.org/JavaHamcrest/javadoc/2.2/org/hamcrest/Matchers.html)，甚至可以自定义匹配器，能够让断言可读性更高，断言样板代码量更少，更容易维护。

## 实战

### 1. 引入Maven依赖

- springboot项目
  
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
  </dependency>
  ```
  
  springboot项目只需添加以上依赖即可，以上的依赖包已经包含了Hamcrest。
  
- 非springboot项目

  ```xml
  <dependency>
    <groupId>org.hamcrest</groupId>
    <artifactId>hamcrest</artifactId>
    <version>2.2</version>
    <scope>test</scope>
  </dependency>
  ```

### 2. 使用内置的匹配器

匹配器的使用比较简单，可以参考以下连接进行学习和使用：

- [Testing with Hamcrest](https://www.baeldung.com/java-junit-hamcrest-guide)
- [Using Hamcrest for testing - Tutorial](https://www.vogella.com/tutorials/Hamcrest/article.html#exercise-using-hamcrests-built-in-matchers)