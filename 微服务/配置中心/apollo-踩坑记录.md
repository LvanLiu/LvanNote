# Apollo 配置中心部署-踩坑记录

## 1. 部署坑

### 1.1 环境

|   环境   |   版本    |
| :------: | :-------: |
| 操作系统 | CentOs 7  |
|  数据库  | Mysql 5.7 |
|   JDK    |    1.8    |

### 1.2 部署方式

通过从[Apollo Github Release](https://github.com/ctripcorp/apollo/releases)下载预先打好的安装包进行安装，安装包版本为1.8.2。

### 1.3 部署配置

参考[分布式配置指南](https://www.apolloconfig.com/#/zh/deployment/distributed-deployment-guide)进行配置，配置完数据库url相关信息后，就可以启动各个服务了。

### 1.4 问题产生

通过startUp.sh脚本启动apollo-configservice，console log显示如下：

```
Sun Jun 20 22:12:57 CST 2021 ==== Starting ====
Application is running as root (UID 0). This is considered insecure.
Started [5919]
Waiting for server startup.....
pid - 5919 just quit unexpectedly, please check logs under /opt/logs/100003171 and /tmp for more information!
```

很明显，启动失败，接着到/opt/logs/100003171下查看apollo-configservice.log日志，发现以下两个异常：

- hibernate.dialect未设置

```
Caused by: org.hibernate.HibernateException: Access to DialectResolutionInfo cannot be null when 'hibernate.dialect' not set
```

- SSL处理出现了异常

```
Caused by: javax.net.ssl.SSLHandshakeException: No appropriate protocol (protocol is disabled or cipher suites are inappropriate)
```

其他的异常，基本都是由这两个异常引发的异常链。

### 1.5  问题解决

1. hibernate.dialect未配置异常

   编辑apollo config的application-github.properties配置文件，加上hibernate.dialect的设置，配置如下：

   ```properties
   spring.datasource.url = jdbc:mysql://127.0.0.1:3306/ApolloConfigDB?characterEncoding=utf8
   spring.datasource.username = root
   spring.datasource.password = root
   # 设置db dialect
   spring.jpa.database-platform=org.hibernate.dialect.MySQL5Dialect
   spring.datasource.hikari.maximum-pool-size=10
   ```
> [!tip]
> apollo-adminserice、apollo-portal都需要添加spring.jpa.database-platform才可以运行

2. 调用SSL异常

   参考[SSLHandShakeException 没有合适的协议](https://stackoverflow.com/questions/38205947/sslhandshakeexception-no-appropriate-protocol)进行解决

### 最后

对于以上出现的SSL处理等异常，其实这些都涉及到网络原理，熟悉的，就可以很快的发现问题，不熟悉的，就只能各种google了，因此，网络的知识是要抽时间补足的。

