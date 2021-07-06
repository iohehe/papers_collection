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

session就是$_SESSION,File Names就是文件名， 为啥只说文件名不说文件内容呢？ 我觉得其实文件名是比较容易被开发者missing check的一个点， 当然file_get_contents等操作也能引发二次，可能比较少见，嗯？(作者放到future work中了)。


## Detecting Second-Order Vulnerabilities



# 效果

# 总结
