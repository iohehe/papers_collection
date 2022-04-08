   ![Jietu20210620-190534](https://user-images.githubusercontent.com/3693435/122671810-ff49fc00-d1fa-11eb-8f37-353a324fc430.jpg)


# 背景&动机

2009年，Esser展示了代码复用类攻击(code-reuse)在PHP-based的web程序中的应用。之后5年里许多发序列化漏洞被发现(Joomla, Wordpress, Piwik)。这种PHP object injection(POI)漏洞是一类注入型漏洞。

目前大部分的静态工具能够通过污点分析发现POI漏洞，但是一个POI是否真的是一个可触发的漏洞，还取决于他所利用的gadgets(即sink点处的可用源码)，然而还没有工具能够找到攻击者能够触发的gadgets。 

> 挑战：模仿攻击者利用所有gadgets组合来操作控制流和数据流，最终到达利用效果。

要达到此目的，分析工具需要很好的理解PHP的OOP理解，然而还没有一个好的静态分析工具可以cover OOP。

 > 贡献: 本文提出了一个`inter-`， `field-sensitive`, `object sensitive` 的data flow analysis能够对OOP相关特性进行探测。 

   - 提出一个系统的探测PHP object injection(POI)漏洞的方法， 并证明可以通过该工作生成利用Property-Oriented Programming(POP)链完成攻击。
   - 第一个找自动化找POI的工具。
   - 在10个app上进行了测试, 发现30个漏洞并生成28条利用链。

---  

# PHP OBJECT INJECT(POJ)
PHP通常使用`serialization`和`deserialization`机制进行序列化和反序列化操作。 序列化会将PHP中的任何类型的数据存为统一的字符串格式，从而方便进行传输存储等。而反序列化就是序列化的反过程。由于PHP允许对任何object进行反序列化，因此攻击者就可以注入一些objects并对其属性进行任意赋值(控制)，从而劫持控制流，数据流，达到攻击效果。

一个PHP对象注入发生在无消毒用户输入被反序列化的时候，而这个注入有没有危害，还需要看当前program scope中的gadgets。基于一个注入上下文，攻击者可以通过所能控制的对象属性，来触发 *魔术方法*。(一个个的自动出发的魔术方法就好像对象中的一个个中转站，来让攻击者进行code reuse)...

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

其中，作者将__wakeup()和__destruct()列为`context-independent`的(只要注入该类型的Object，必会触发)， 其他像__toString()或者__call()依赖上下文的列为`context-dependent`的(需要特殊的条件才能触发)。

## 2. 序列化
PHP支持将所有数据类型序列化反序列化(包括object), 序列化字符串具有统一的格式：
   * a: passed paramenter is an array, a:后边跟的数字时数组大小
   * i: numerical value, e.g., i:8
   * b: specifies a boolean value, e.g., b:0 or b:1
   * s: defines a constant string. s:后边跟的是字符串长度
   * S: defines a constant string in encoded format
   * O: represents an object in its serialized form.（重点，object）,一个object的属性可以是其他的object

## 3. Property Oriented Programming(POP)

Listring 2中给出了一个POI漏洞的利用，首先观察注入点(18)行，可控->POI，然后看有哪些可以跳的魔术方法，由于Object发序列化后$data的数据流没有了，因此只能去看一些`context-independent`的魔术方法作为入口，此时有一个__destruct()，构造Database对象跳过去，然后进入__destruct()内部控制流，发现一个shutdown()方法调用，注入一个File的话可以跳过去，但是走向的是fclose()//harmless(Line 6)的，不构成实际利用。所有去构造他的子类TempFile的对象，我们就可以跳到子类的close方法中，从而触发一个任意文件删除漏洞(Line 10)。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-22-015216.png)

我总结一些构造这个POP链的重点:
> 1. 知道当前scope中有哪些方法可跳(有哪些对象)。
> 2. 如何分析类层次，找到正确的(有危害的)跳转位置(应该跳到哪些对象)。

---


# 方法&挑战
本文的重点在于证明POP链静态探测的可行性。
因为静态探测POP链对分析工具的OO分析能力要求很高(Filed, object,类层次)，当前对PHP的分析工作都不能很好的完成这项任务。

## 3.1 High-Level Overview of Taint Analysis
这似乎是每篇RIPS都强调的他们的污点分析技术： 找到所有的sink API，标记影响的arguments，然后沿着数据流路径，一路分析到unsanitized sources。

在提升精确度上，还是沿用了PHP built-in function行为模拟(静态建模)技术，以及block,function,file(三层摘要)技术。

本文采取了分析力度是AST(但是开源版本没有构建AST)。

- 做法： 对每个PHP文件解析成AST， 然后在初始化阶段，每棵AST标识class与function。通常的操作流程, AST split BB, 得到CFG。对每一个BB间数据流(3.2)，最后将数据流分析的内容存在block summary。RIPS会用许多定义为class的结构体来存储一些summary,有block summaries, function summaries, file summaries,并将分析数据存储到这些suammaries中。


## 3.2 Data Flow Analysis
这里就是RIPS的污点分析思路，描述了一个以basic block为单位的数据流分析方法。


## 3.3. OOP Analysis
重点来了，开始设计OOP分析部分，这是一个针对POP探测的OO分析，因此需要首先收集`object-orientd code`,然后收集相关的`the allocation of objects` 以及 `the access to object propertires`。这里的一挑战是对OO的summary, 某个data的上下文是与整个object里的属性方法相关的。本文使用一个`forwards-directed object-oriented`分析来辅助`backward-directed dataflow`分析。

### 3.3.1 初始化分析(Initialization)
分析初始化时，从目标中收集`class definitions`, 分析predefined properties and class constants，并转化为data symbols。 接着，创建`class hierarchy`类层次图，这里利用了一个双向分析(谁继承谁，谁被谁继承)。所有的方法被作为一个user-defined function存储，但是连接到他们的originating class上。 然后尽可能的收集parameters。

### 3.3.2 Object-sensitive Analysis
对象敏感是OO语言特性静态分析的基础，通常需要做指针分析。 本文的做法是在基本块内分析时增加一个新的data symbol `OBJECT`，通过new 关键字识别。 此data symbol关联实例化的类名，通过一个map来关联相关属性。

其次构造函数会被分析，并将属性赋值语句在`OBJECT`的data symbol中标出。

#### **Object Propagation**
对象的传播时一个需要分析的重点，本文中还是基于block summary，在每一个基本块结束的地方都会有汇合传递给后续基本块，这里提了`object cached`，即图一中箭头所传播的内容。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-22-070256.png)

后边还有类型判断语句的分析($o instaneof MyClass)来补充class信息，以及object分析到CFG出口后对__destruct()方法的分析。

(总之我认为这里都是吹嘘)。

#### **Object-sensitive Magic Methods**
在对象传播的基础上，分析工具还能够根据object cache的特殊操作探测到跳到的相关魔术方法。
这里说的挺容易，其实实际实现并不容易。

### 3.3.3 Field-sensitive Analysis
#### **Property Writes**
当检测到赋值语句$loc := <assigned\ data>$时，如果是一个sotre操作，如$\$o->p$这样一个filed,此时更新当前块中的object cache。 

过程内的基本块中的object cache沿着数据流更新；而过程间的话，此时$o可能来自于全局变量或者参数或者是$this，此时receiver是不确定的($o指向的object)，因此又增加一个符号`PROPERTYWRITE`来保存receiver的名字，属性的维度(数组)，赋值。

#### **property Access**
加入`PROPERTYFETCCH`符号

#### **Field-sensitive Magic Methods**
对于`PROPERTYFETCH`操作调用对应的魔术方法，举例如果探测到`PROPERTYFETCH`传入`isset()`或者`unsset()`，如果不可访问就调用`__isset()`或者`__unset()`方法来分析。


# 3.5 POP Chain Generation

纯静态分析POP链，从unserialize()的return返回一个`object symbol`，标记在基本块上级数据流分析，在数据流分析的同时还要进行magic method分析。
首先， 所有的`__wakeup()`方法被作为`initial gadgets`进行分析。如果一个object-senstive magic method被调用，所有相关的魔术方法将要被分析。所有的敏感属性

# 4. EVALUATION
本文的仿真实验在已知的POP链上进行:

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-25-063802.png)

## 4.1 POI点探测
本工具在测试集十个项目中的八个，均发现了至少一个POI点。对POI点的寻找偶没有漏报，且意外发现之前CVE没有的POI点。本工具漏报了Wordpress和Open Web Analytics中的POI。OWA中的漏报由于对反射认识不足导致的;WP中的漏报是因为二次注入。
## 4.2 可用gadgets

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-25-065226.png)

- set与get最多但是通常没什么用
- destruct: 也很多因为他是上下文无关，所以很好用
- callStatic, invoke在我们标的ground truth中没有找到


## 4.3 POP链分析

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-25-065859.png)
