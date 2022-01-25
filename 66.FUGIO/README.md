![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-16-024026.png)


## 背景&动机

本文的主要工作是从PHP Web applications 中发现POI漏洞(PHP Object Injection), 并在此基础上实现AEG（automatic exploit generation），即自动化生成漏洞利用链POP(Property-oriented programing)。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-16-024855.png)

上图中就是一个通过POP链构早的任意文件删除的漏洞，左边是两个目标程序中无关联合法函数调用栈，而右边就是通过POP链把两个栈拼接在了一起，从而形成一条能发动任意文件删除的stack trace。轨迹上的每个点都是一个gadgets。

因此可以看到找出用户可控的反序列化注入点(POI)只能说明存在一个潜在的威胁， 而要真正的能够产生注入效果需要进一步考虑攻击向量中实际可利用的gadgets的位置(POP链)。

> 动机: 本文是在RIPS 14年在CCS的基础上进行的，已有工作只能够去发现潜在的POI漏洞注入点，并分析出可能的POP，但是不能生成EXP，而人工验证对象注入需要手工构造Object，开销非常大。 

- 本文贡献: 提出了工具FUGIO,  第一个在发现POI之后并自动AEG生成POP的工作。

FUGIO通过静态分析搜集源码中的class和functin信息，对于运行时生成的class和function，FUGIO通过动态分析收集，使得该工具可以获得全部的POP链所需的信息。

FUGIO拿到所有程序中的信息后，生成可行的POP链并生成PUT(program under testing)，就是提取所有的gadgets，生成一个漏洞利用环境。


## 方法&挑战

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-17-124816.png)

本工作面临如下挑战:
1. `分析POP链`: POI入口，探测出所有的可利用的POP链，需要分析动态生成的class的静态声明的class,并且需要对实际出发POI无用的gadgets(track trace中的function或者method)进行剪枝。

    - C1-1: PHP的动态特性问题(*the dynamic nature of PHP*）使得很难确定可加载的class和他们中的gadgets, 如通过__autoload()这种奇葩函数。继续现在每个PHP项目都在用，这样就没有办法去静态分析了。因此不考虑这些动态加载的class和function会引来漏报。

    - C1-2: gadgets拼接空间大的问题， Listing1中，控制流跳入__destruct()后我们可以通过控制$this->object属性跳入当前环境中可利用的class所包含的所有clear()和save()中，如果随想项目的增大这个拼接POP链的空间会随指数式增长。
     
2. `生成EXP`: EXP模块的目的是在判定出POP链的gadgets顺行后，构造一个可利用漏洞的对象。

    - C2-1: 大型WEB程序FUZZ起来通常比较慢，原因之一是会执行一些与POI漏洞不相关的模块。而且这些模块可能会对程序的状态产生副作用。
    
    - C2-2: FUZZ直接生成Exploit object with multiple property values很难。

针对以上挑战， 本工作设计了动静结合的POI漏洞探测并生成利用的工具FUGIO:

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-16-033823.png)

从上图我们可以看出FUGIO的OverView， 改工作大致分为三个阶段： 动静结合的POI漏洞分析阶段，POP链构造阶段以及POP链FUZZ。


## POI Detector
本阶段的目的是探测POI注入点以及收集可用的gadgets元素。

## 静态分析(Static Analyszer)

静态分析工具计算 *static summaries*，每个文件出一个summaries,包含其中的function和class summaries。做法还是使用AST-Parser分析AST并分析所有的functions, classes, interfaces, and traits的definitions。 
数据流只做了一个流不敏感的过程哪分析，从每个function或者method的parameters和属性追到body内的call-site的argument中。并将这些flow写入到summaries中。


## 动态分析(Dynamic Analyszer)
对于静态不可得的*function summaries*与*class summaries*，使用动态分析的方式获取，这些summaries为后续的POP和PUT构造提供资料。 是用`class_exists`验证哪些能够autoload的函数和方法。动态分析还会收集globals和enviroment的信息。


## POP Chain Identifier
POP链探测，此阶段进行POP链和PUT的构造。

### POP Chain Identifier
本方法首先找到所有的sink点，然后分析实参判断是否可控(污点变量，属性可传入)。对于每一个sink点深度遍历所有魔术方法，生成所有可能的POP路径。然后用一颗递归树表示。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-25-034235.png)

此树root是sink调用点所在的节点,下边每一层是他的caller。叶子节点是potential callers(也就是POP的入口)，人为设置最大层数是7层，这样即使有环也能停机。

### PUT Generation
PUT包含所有生成EXP的gadgets，对于同名class和function，都各自生成一个file。一个PUT包含head和body,head设置所有变量符号信息,body包含所有包含gadgets的文件。body的入口点是unserialize()反序列化点，FUZZ生成序列化字符串会喂给PUT。 

对于每一歌注入的object, 都要做三种记录:
1. execution trace中执行的条件表达式和调用的函数。
2. POP chain中执行了多少gadgets。
3. 来自条件表达式的属性值提示。

对于前两个，FUGIO会在每个function entry，before and afeter conditional expression，user-defined function调用点处进行插桩记录。

## POP Chain Fuzzer
拿到一个PUT和一条POP链，fuuzer就开始对PUT进行feedback-driven fuzzing。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-25-064906.png)

输入: 一个PUT和一个POP

种子池中选种子， 种子编译，生成execution执行。
进行结果分析， 如果发现了新的路径，


# 实验评估
在30个PHP应用中进行FUGIO评估。其中8个应用是RIPS评估使用的，21个从PHPGGC中拿的。本工作成功发现了CVE-2018-20148，CVE-2019-6339。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-25-070802.png)

上图实验数据中，第三列表示识别的POP链数量，第四列表示FUZZ能够形成EXP的，第五列是覆盖的sink点。
Exploitable Chains表示FUZZ后生成的利用链。而Probably Exploitable Chains表示FUGIO可以生成没有通过Oracle测试的利用链。注意这两列做了五次实验，中括号是最小值到最大值，圆括号是所有不一样的链加起来。