# 作者信息
   ![Jietu20210620-190534](https://user-images.githubusercontent.com/3693435/122671810-ff49fc00-d1fa-11eb-8f37-353a324fc430.jpg)


# 动机
   2009年， Esser展示了代码复用类攻击在PHP-based的web程序中的应用。之后5年里许多发序列化漏洞被发现。这种PHP object injection(POI)漏洞是一类注入型漏洞，但是目前的静态分析工具没有覆盖此类注入漏洞的。其中一个是此类漏洞，需要在代码中找到攻击者能够触发的gadgets。 此外， 对于object-oriented programming(OOP), 比分析命令式编程手法有一定的复杂性。 在当时，还没有一个好的静态分析工具可以cover OOP。
   
   
# 贡献
   本文提出了一个过程间， field-sensitive, object sensitive data flow analysis 能够对OOP相关特性进行探测。 
   - 提出一个系统的探测PHP object injection(POI)漏洞的方法， 并证明可以通过该工作生成利用Property-Oriented Programming(POP)链完成攻击。
   - 第一个找自动化找POI的工具。
   - 在10个app上进行了测试, 发现30个漏洞并生成28条利用链。



# 背景
## 1. 魔术方法
   * __construct(): 构造函数
   * __destruct(): 析构函数
   * __call(): 访问不可访问的方法是调用
   * __callStatic(): 同__call, 静态
   * __get($name): 访问不可访问(或者不存在)的属性时调用
   * __set($name, $value): 不可访问属性赋值
   * __isset(): 当对不可访问属性调用isset()和empty()时调用
   * __unset(): unset() is used on non-existent properties
   * __sleep(): an object 被序列化时调用
   * __wakeup(): 反序列化时调用
   * __toString(): 当object用在string上下文环境中
   * __invokie(): 当object用在dynamic functin name时(e.g., $obj())
   * __set_state($porperties): objec做为var_eport()的参数时， 来确定被打印的属性。
   * __clone(): 使用clone命令时调用。

其中，作者将__wakeup()和__destruct列为context-independent的， 其他像__toString()或者__call()依赖上下文的列为context-dependent的。

## 2. 序列化
PHP支持将所有数据类型序列化反序列化(包括object), 序列化字符串具有统一的格式：
   * a: passed paramenter is an array, a:后边跟的数字时数组大小
   * i: numerical value, e.g., i:8
   * b: specifies a boolean value, e.g., b:0 or b:1
   * s: defines a constant string. s:后边跟的是字符串长度
   * S: defines a constant string in encoded format
   * O: represents an object in its serialized form.（重点，object）,一个object的属性可以是其他的object

## 3. Property Oriented Programming(POP)
PHP想要触发POI需要条件有二：
1. 至少又一个魔术方法
2. 选在构造的class需要在unserialize(黑暗之门:> )的作用范围内(被加载)。



# 方法与挑战
方法: 静态污点分析

流程: 
1. 搜集OO信息。
2. 定位objects，访问其属性。 


## 3.1 High-Level Overview of Taint Analysis
首先本质上还是做静态污点分析， 那么sinks点还是要捕捉污点链的， 后向算法: sensitive sinks->affected parameters->unsanitized sources

