# 作者信息
   ![Jietu20210620-190534](https://user-images.githubusercontent.com/3693435/122671810-ff49fc00-d1fa-11eb-8f37-353a324fc430.jpg)


# 动机
   2009年， Esser展示了代码复用类攻击在PHP-based的web程序中的应用。之后5年里许多发序列化漏洞被发现。这种PHP object injection(POI)漏洞是一类注入型漏洞，但是目前的静态分析工具没有覆盖此类注入漏洞的。其中一个是此类漏洞，需要在代码中找到攻击者能够触发的gadgets。 此外， 对于object-oriented programming(OOP), 比分析命令式编程手法有一定的复杂性。 在当时，还没有一个好的静态分析工具可以cover OOP。
   
   
# 贡献
   本文提出了一个过程间， field-sensitive, object sensitive data flow analysis 能够对OOP相关特性进行探测。 
   - 提出一个系统的探测PHP object injection(POI)漏洞的方法， 并证明可以通过该工作生成利用Property-Oriented Programming(POP)链完成攻击。
   - 第一个找自动化找POI的工具。
   - 在10个app上进行了测试, 发现30个漏洞并生成28条利用链。


# 方法与挑战
方法流程: 
1. 搜集OO信息。
2. 定位objects，访问其属性。 
3. 
