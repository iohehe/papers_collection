   这片文章发表在14年的NDSS， 引用率很高， 主要是用了SVM（支持向量机）来在Android中区分sink点和source点。
文章主要是针对Android引入的一些API进行Sink， source分类， 测试目标主要是敏感信息类的漏洞。
文章使用SVM进行分类为了两部分，首先是划分为Sources.Sinks和Neither的问题。第二部分比较有意思， 对Source,Sink有进行了进一步的分类(category),如将source来源分类为Account(用户)， Bluetooth(蓝牙)，Browser(浏览器)， Calendar(日历),contact（协议？），database(数据库)， File(文件)， Network(网络) ，NFC, Setting(设置)， SYNC, unique_identifer, no_category.（第二部分会将neither忽略）

![Jietu20201028-083211](https://user-images.githubusercontent.com/3693435/97376358-22d0d700-18f8-11eb-8e9a-908b46f4edc7.jpg)
![Jietu20201028-083229](https://user-images.githubusercontent.com/3693435/97376362-25cbc780-18f8-11eb-8b47-1af3884292df.jpg)

# 方法设计
该方法设计由两部分组成， 第一部分给出了SOURCES和SINKS的定义， 算是一个理论补充部分； 第二部分是分类方法介绍
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
 一个比较典型的机器学习框架，包含四层: input, preparation, classification, oand output. 方框代表对象，圆框代表行为。 实现代表框架中数据流向。 虚线代表将第一轮的结果回流到第二轮。
 Susi的第一轮的原始数据来自两个set, 其中，training data为手工标注而成， test data 为需要分类的data。
 第二轮中的training仍然需要手标：
 - sources: *account*, *bluetooth*, *browser*, *calendar*, *contcat*, *database*, *file*, *network*, *nfc*, *settings*, *sync*, *unique-identifer*。
 - sinks: *account*, *audio*, *browser*, *calendar*, *contact*, *file*, *log*, *network*, *nfc*, *phone-connection*, *phone-connection*, *phone-state*, *sms/mms*, *sync*, *system*,*voip*
 
 ### C. Feature Database
 抽取的参数上， SUSI选取了以下几个纬度进行的特征构建，有一些特征会在同一个维度上出现如在method name中的`method name star with get`, `method name star with put`...所以作者说由144个语法语义特征。
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
 
