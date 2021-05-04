# INTRO 
这片文章发表在14年的NDSS， 引用率很高， 主要是用了SVM（支持向量机）来在Android中区分sink点和source点。
文章主要是针对Android引入的一些API进行Sink， source分类， 测试目标主要是敏感信息类的漏洞。
文章使用SVM进行分类为了两部分，首先是划分为Sources.Sinks和Neither的问题。第二部分比较有意思， 对Source,Sink有进行了进一步的分类(category),如将source来源分类为Account(用户)， Bluetooth(蓝牙)，Browser(浏览器)， Calendar(日历),contact（协议？），database(数据库)， File(文件)， Network(网络) ，NFC, Setting(设置)， SYNC, unique_identifer, no_category.（第二部分会将neither忽略）

![Jietu20201028-083211](https://user-images.githubusercontent.com/3693435/97376358-22d0d700-18f8-11eb-8e9a-908b46f4edc7.jpg)
![Jietu20201028-083229](https://user-images.githubusercontent.com/3693435/97376362-25cbc780-18f8-11eb-8b47-1af3884292df.jpg)

另外本文还添加了MOTIVATING EXPAMPLE是一个代码案例，证明确实有一些sink是在之前的分析工具中是被忽略的。

# DESIGN
该方法设计由两部分组成(添加了原理说明部分)， 第一部分给出了SOURCES和SINKS的定义， 算是一个理论补充部分； 第二部分是分类方法介绍
## DEFINITION OF SOURCES AND SINKS
 * Definition 1(Data): A piece of data is a value or a reference to a value. (意会一下)
 * Definition 2(Resource Method): A resource method reads data from or writes data to a shared resource. (resource method就是从共享resource里读或者写的方法)
 * Definition 3(Android Source): Sources are calls into resource methods returning non-constant values into the application code. (注意non-constant值，即不是常量，如每个手机都有自己的IMEI编号)
 * Definition 4(Android Sinks): Sinks are calls into resource methods accept at least one non-constant data value from the application as parameter, if and only if a new value is written or an existing one is overwritten on the resource.(就是将non-constant data作为parameter，添加或者重写已有资源的)。 

## CLASSIFICATION APPROACH
此部分分ABCD, A介绍了一下machine learning方法(感觉这篇文章废话特别多) B才是核心设计 C开始解释我要提取的基本特征 D重点说明数据流特征

 ### A.Machine Learning Primer
SUSI采用了监督学习的方法分来训练一个分类器。使用了SVM的一种更加精确的实现SMO。 由在第一轮有三种类型需要划分(source, sink, neither)，在第二轮有更多类型，因此解决这个问题， 我们采用one-against-all classification.(~~就是把一个类型从所有中提溜出来~~)。 

 ### B. Design of the Approach
 ![Jietu20210113-211719](https://user-images.githubusercontent.com/3693435/104459850-47c81280-55e8-11eb-9e9f-f589fe8d7024.jpg)
 一个比较典型的机器学习框架，包含四层: input, preparation, classification, oand output. 方框代表处理对象，圆框代表行为。 整个流程跑两轮，第一轮分类(classifying)，所有的方法将被分为三类:source, sink, 都不是。 第二轮在此基础上，在对source和sink进行分类(categorizing), 比如sink是文件系统还是网络...图中，实线代表框架中数据流向。 而虚线代表将第一轮的结果回流到第二轮。
 
 一个比较典型的机器学习框架，包含四层: input, preparation, classification, oand output. 方框代表处理对象，圆框代表行为。 整个流程跑两轮，第一轮分类(classifying)，所有的方法将被分为三类:source, sink, 都不是。 第二轮在此基础上，在对source和sink进行分类(categorizing), 比如sink是文件系统还是网络...图中，实线代表框架中数据流向。 而虚线代表将第一轮的结果回流到第二轮。
 一个比较典型的机器学习框架，包含四层: input, preparation, classification, oand output. 方框代表处理对象，圆框代表行为。 整个流程跑两轮，第一轮分类(classifying)，所有的方法将被分为三类:source, sink, 都不是。 第二轮在此基础上，在对source和sink进行语义上的分类(categorizing), 比如sink是文件系统还是网络...图中，实线代表框架中数据流向。 而虚线代表将第一轮的结果回流到第二轮。
 Susi的第一轮的原始数据来自两个set, 其中，training data为手工标注(handle-annotated training examples)而成，而test data 为需要分类的data。 training data要比test data集小很多。
 第二轮中的training仍然需要手标：
 - sources: *account*, *bluetooth*, *browser*, *calendar*, *contcat*, *database*, *file*, *network*, *nfc*, *settings*, *sync*, *unique-identifer*。
 - sinks: *account*, *audio*, *browser*, *calendar*, *contact*, *file*, *log*, *network*, *nfc*, *phone-connection*, *phone-connection*, *phone-state*, *sms/mms*, *sync*, *system*,*voip*
 
 ### C. Feature Database
 抽取的参数上， SUSI选取了以下几个纬度进行的特征构建，有一些特征会在同一个维度上出现如在method name中的`method name star with get`, `method name star with put`...所以作者说由144个语法语义特征。
 (这是大类，比如上面提到的方法名，是一个范型，然后`start with xxx`， 每种xxx算一个特征)
  * Method Name, 方法名包含或者能够头匹配一些关键字： get, put...  
  * Method has Parameters, 方法参数声明中至少包含一个形参，(sink中通常会有一个，source就不一定)
  * Return Value Type, 返回值类型，无返回的函数一般不会是source
  * Parameter Type, 参数类型， 可以是一个具体的类型或者是一个特殊包中的类型，如java.io.*包， 作为参数类型属于这个包中的类型的化就有可能是一个source或者sink
  * Parameter is an Interface， 如果形参是一个接口类型，通常既不是sink,又不是source（？？？接口回调机制）
  * Method Modifiers, 方法修饰符， static通常既不是source又不是sink（？？？为啥）， 
  * Class Modifiers, 类修饰符， protected类既不是source又不是sink
  * Class Name，类名中的关键字， 如Manager.
  * Dataflow to Return， 如果一个方法调用了一个含有某些关键字的方法(read,以source为例)， 而这个方法的返回值流到了return中，那么这个方法有可能是一个潜在的source。(对已知source打包:)
  * Dataflow to Sink, 如果一个方法从参数开始追入一个包含某些关键字的方法(update, 以sink为例)， 那么这个方法有可能就是一个潜在的sink。(对已知sink打包)
  * Data Flow to Abstract Sink, 许多硬件层面的sink通常有一层抽象结构， 如果一个方法的parameter传入这种抽象方法，很有可能就是一个sink点。
  * Required Permission,  调用方法需要特殊权限，Android API. PScout list(???) XD
 其中，虽然“Method name”看起来很naive, 但是是与sink和source最语法相关的，当然需要和其他属性配合使用。
 所有的函数根据以上特征， 划分为true, false和not support。support是不确定该特征(比如发生在当需要检查一个方法体的时候，没有找到)。
 
 然后下一步进行categorizing。
  * Class Name: 类名中的关键信息, 如"Contacts"
  * Method Invocation:  方法调用， 如调用了一个com.android.internal.telephony方法。
  * Body Contents: 函数体，包含特殊类型的对象，如包含了一个android，telephony.SmsManager类型的对象，可能是一个SMS_MMS分类。
  * Parameter Type: 获取特殊类型的参数
  * Return Value Type: 返回值

 ### D. Dataflow Features
  数据流分析通过SOOT实现的一种过程内数据流分析。考虑到数据流只是其中的一个因素， 因此， 足够了。
  * Treat all parameters of m as sources and calls to methods starting with a specific string as sinks. This can hint at m being a sink.（将形参作为source, 将调用点中包含关键字信息的callee作为sink）
  * Treat all parameters of m as sources and calls to abstract methods as sinks. This can hint at m being a sink.(将调用点中callee为抽象方法的定义为sink)
  * Treat calls to specific methods as sources(e.g. ones that start with "read", "get", etc.) and the return value of m as the only sink. This can hint at m being a source. Optionally, parameter objects can also be treated as sinks.(source是一个特殊的callee中return回来的， sink是本方法的return)
  以上初始化定义了一个方法中，数据流追踪的起始和结束。 在听南大课的时候记得老师说过， 控制流是有规范的， 但是数据流的制定没有规范，是按照所需要的效果制定的。 可能这里的起点和终点不同，会导致最终数据流分析结果的不同。
  初始化后，进行不动点迭代(fixed-point iteration)
  * If the right-hand side of an assignment is tainted, the left-hand side is also tainted. (真的是...)
  * If at least one parameter of a well-known transformer method is tainted, its result value is tainted as well.(这里比较有趣， 这里的transformer method应该是那种信息处理函数， 就是把参数进行处理后返回的)
  * If at least one parameter of a well-known writer method is tainted, the object on which it is invoked is tainted as well. （同样有趣， 如果一个写方法的参数被污染，那么调用他的对象也被如染了(这种对象污染技术之前没太涉及过)）
  * If a method is invoked on a tainted object, its return value is tainte as well. (与上衔接， 维护了一个object tainted的结构，如果方法来自此object的调用, 那么也被taint)
  * If a tainted value is written into a field, the whole base object becomes tainted. For arrays, the whole array becomes tainted respectively. (这里好像有些激进了， 但是好用就行, 因为这里是一个很粗粒度的，这里说的taint其实表示做污点分析， 而是通路分析。)
  （这篇文章中， 这个数据流分析的规则是比较复杂了， 但是居然木有给算法）
  因为这是一个特征识别操作，所以发现一条流就到达不动点了。 作者也说这个不精确，但是快
  
  ### E. Implicit Annotations for Virtual Dispatch
  这一部分讲了一些inmplicict annotations, 没太看懂， 应该是同一功能方法注释如何拷贝过去的问题。

# EVALUATION
这篇文章的评估手法是提出五个问题， 然后分别设计实验回答。
