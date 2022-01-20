![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-16-024026.png)

## 背景&动机
本文的主要工作是从PHP Web applications 中发现POI漏洞(PHP Object Injection), 并在此基础上实现AEG（automatic exploit generation），即自动化生成漏洞利用链POP(Property-oriented programing)。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-16-024855.png)
上图中就是一个通过POP进行任意文件删除的漏洞， 左边是两个应用中的合法函数调用栈形式，而有变就是通过POP链把两个合法调用栈拼接在了一起，从而形成了一条能发动任意文件删除的调用链(这种新拼接出的stack trace就叫做POP链)。

因此可以看到找出用户可控的反序列化调用点只是一个潜在的威胁， 而要真正的能够产生漏洞效果需要进一步考率攻击向量中实际可利用的object的摆放位置。
> 动机: 目前一有的探测工具只能够去发现潜在的POI漏洞注入点， 而生成实际的POP仍需要人工操作。 

- 本文贡献:
1. 本文提出了工具FUGIO,  第一个在发现POI之后自动AEG生成POP的工作。
2. 
3. 

## 方法&挑战

FUGIO选择动静结合的分手法来对POI进行自动化利用生成。

有如下挑战:

1. `识别POP链`: POI入口，探测出所有的可利用的POP链，需要分析动态生成的class的静态声明的class,并且需要对实际出发POI无用的gadgets(track trace中的function或者method)进行剪枝。
    - C1-1: PHP的动态特性问题(*the dynamic nature of PHP*）使得很难确定可加载的class和他们中的gadgets, 如通过__autoload()这种奇葩函数。继续现在每个PHP项目都在用，这样就没有办法去静态分析了。因此本工作之考虑静态定义的class(为减少误报)。
    - C1-2:  
    ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-17-124816.png)
    在本例中，__destruct()既可以调用\$this->log->clear(), 又可以调用\$this->log->save()。 
     
     
    
2. `生成EXP`: 在此基础之上生成漏洞利用对象。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-16-033823.png)


