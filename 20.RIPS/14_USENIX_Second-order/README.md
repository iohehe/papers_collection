![image](https://user-images.githubusercontent.com/3693435/124377901-1ac80300-dce1-11eb-8f93-5086fc98fd16.png)


# 摘要
二次注入(second-order)漏洞是web中的一类顽疾， 本文针对二次注入的传播方法首次提出了一种静态分析策略，来对此类多步骤操作的漏洞进行静态分析。 通过分析web server对memroy location的读写，自动化的识别出无过滤的PDS层(persistent data stores)输入和输出点，从而达到二次注入静态污点分析。。。效果是在HotCRP等6个PHP CMS上找到了159个secode-order漏洞。(从效果来看还是蛮好的)


# 动机
基本的污点分析工具其实有一个假设： 所有的存储数据都是安全的， 显然这是错误的， 因此引入了这种二次注入问题尚无法得到解决。 而且这种多步利用的漏洞往往会造成更大的危害(如存储型XSS一般会比反射型危害大)。 因此设计工具发现此类问题十分具有意义。 


# 贡献
- 首次提出了一种静态方法探测second-order data flows, through databases, file names, and session varibales。
- 分析项目中对于second order 的sanitize位置，从而降低漏误报。
- 设计了一个原型系统在6个PHP CMS上发现了159个洞。


# 方法与挑战
由于此类问题的污点流可能分布在不同的函数或文件里， 而且分不同的步骤触发，所以很难被发现。静态分析无法访问程序动态时所访问的资源因此无法得知存储在这些资源上的内容是啥子。

## Persistent Data Stores(PDS)
本文提出了PDS层， 就是将web处理的放在硬盘上的数据， 由Database, session和文件名。
当然最主要的就是database了,首先看存。
![image](https://user-images.githubusercontent.com/3693435/124444916-a90bba00-ddb1-11eb-8d99-d190ba92186a.png)
这里分为了specified write 和unspecified write两种， 第一种暴露了部分字段名字，第二种没有暴露字段名，但是把字段个数(就是对应表的列数啦)暴露出来了。 再看读：
![image](https://user-images.githubusercontent.com/3693435/124445226-f1c37300-ddb1-11eb-8841-2097e9cc02e5.png)
也没啥好说的，索引数组和关联数组。

session就是$_SESSION,File Names就是文件名， 为啥只说文件名不说文件内容呢？ 我觉得其实文件名是比较容易被开发者missing check的一个点， 当然file_get_contents等操作也能引发二次，可能比较少见，嗯？(作者放到future work中了)


## Detecting Second-Order Vulnerabilities
还是介绍了一些常见的静态分析手法。同检测OBI那篇一样，作者用了大篇幅讲述基础技术。。。

使用的方法是Xie提出的三层summary的方法(basic block, function, file)， 使用后向数据流做污点分析。具体是先找块， 然后自顶向下生成块间控制流。 在块内,从return开始构建数据流， 识别五种data symbols: (Value, Variable, ArrayDimFetch, ArrayDimTree, ValueConcat, Multiple), 污点分析时，会在这些data symbols上打上sanitize标签证明数据被消毒了，另一方面，如果在分析时遇到一个user-defined function, 就去找到他并构建，依据args的不同， 实现上下文敏感的污点分析。这些都是基本污点分析，主要看作者的亮点(但是他提的很少)：
还有一个亮点就是提出了Array Handling, 就是作者根据经验发现，往数据库写内容时， 内容的数据结构通常表现为一个数组。 这有什么用呢？ 发现一般关联数组的key就是数据表的列名，value就是对应的具体内容.
![image](https://user-images.githubusercontent.com/3693435/124577733-1d149380-de80-11eb-837f-2aab1a9e5cff.png)
全文的精华， 好吗， 都在这张图上了。 
在基本的污点分析之上，作者构造了PDS层， 可以看到，在此层的帮助下， 作者提出了 PDS-centirc taint analyisis. 即以PDS层为核心去寻找污点注入。
 以数据库为例： 分为四个阶段：
 （1.准备，从目标中尝试还原数据库表，列信息。 通过寻找.sql文件，如果没有就正则找每个PHP文件


# 效果

## PDS测试：

![image](https://user-images.githubusercontent.com/3693435/124587040-c3b16200-de89-11eb-8d7b-fda7bc2f422b.png)
只关心数据库中的VARCHAR和text字段。 发现其实有一半的列是不可用的。

![image](https://user-images.githubusercontent.com/3693435/124587240-f9564b00-de89-11eb-86c8-bddfe7da32d4.png)
通过手工FUZZ去测试可污染列，观察真实可污染列。 发现有一半以上是可污染的，无sanitized的占可污染列的24%.

下边是session的，
![image](https://user-images.githubusercontent.com/3693435/124587858-b5177a80-de8a-11eb-86aa-a78226fa2db9.png)
对可污染session探测准确率很高。

下边是file name 的:
![image](https://user-images.githubusercontent.com/3693435/124587959-d24c4900-de8a-11eb-9818-d2e49dcf9e0e.png)
准确率也很高


## 漏洞测试:
![image](https://user-images.githubusercontent.com/3693435/124588110-06c00500-de8b-11eb-9aef-163a56f400da.png)

![image](https://user-images.githubusercontent.com/3693435/124588225-22c3a680-de8b-11eb-870c-3a38d765f92f.png)


下边是file name 的:
