![image](https://user-images.githubusercontent.com/3693435/124377901-1ac80300-dce1-11eb-8f93-5086fc98fd16.png)

# 介绍
二次注入(second-order)漏洞是web中的一类顽疾， 本文针对二次注入的传播方法首次提出了一种静态分析策略，来对此类多步骤操作的漏洞进行静态分析。 通过分析web server对memroy location的读写，自动化的识别出无过滤的PDS层(persistent data stores)输入和输出点，从而达到二次注入静态污点分析。。。效果是在HotCRP等6个PHP CMS上找到了159个secode-order漏洞。(从效果来看还是蛮好的)

## 动机
基本的污点分析工具其实有一个假设： 所有的存储数据都是安全的，显然这是错误的， 因此引入了这种二次注入问题尚无法得到解决。而且这种多步利用的漏洞往往会造成更大的危害(如存储型XSS一般会比反射型危害大)。因此设计工具发现此类问题十分具有意义。 

## 贡献
- 首次提出了一种静态方法探测second-order data flows, through databases, file names, and session varibales。
- 分析项目中对于second order 的sanitize位置，从而降低漏误报。
- 设计了一个原型系统在6个PHP CMS上发现了159个洞。

---
# 方法

## 挑战:
由于此类问题的污点数据流可能分布在不同的函数或文件里， 而且分不同的步骤触发(Multi-Step exploits)，所以很难被发现。静态分析无法访问程序动态时所访问的资源因此无法得知存储在这些资源上的内容是啥子。

## 2.1 Persistent Data Stores(PDS)
> 本小节介绍啥是PDS

本文提出了PDS层，即持**久数据存储**， 值是保存在WEB服务放在硬盘上的数据，如Database，session和文件名等。
当然其中最主要的就是database了,首先看存储过程:

### **数据库写**:

![image](https://user-images.githubusercontent.com/3693435/124444916-a90bba00-ddb1-11eb-8d99-d190ba92186a.png)

这里分为了 `specified write` 和 `unspecified write` 两种:
- `specified write`: 这种方式现实的将数据将写入的字段名暴露了出来，但是具有默认值的字段将不可知。
- `unspecified write`: 把字段个数(就是对应表的列数啦)暴露出来了。这就会给静态数据库中的字段建模增加难度。

### **数据库读**：
与写同理，分为`specified read`和`unspecified read`:
- `sepcified read`: 包含列名, 如`select name, pass from users`。 
- `unspecified read`:  不包含列名，如`select * from users`,通过星号读取所有字段。
此外，查询后的数据被保存成一个`result resource`在内存中，如何读取他们，也有`numeric fetch` 和 `asscoiative fetch`两种方式（即索引数组或者关联数组）：

![image](https://user-images.githubusercontent.com/3693435/124445226-f1c37300-ddb1-11eb-8841-2097e9cc02e5.png)

- `numerice fetch`: 存在索引数组中，下标信息能够放映列的顺序，但是列名不可知。
- `associative fetch`: 存在关联数组中，下标信息即数据库中对应表单的列名(或者使用object)。

> 总结：本小节介绍了PDS层，重点介绍了数据库的写，读以及访问有哪些方式，以及我们静态对PDS建模时需要考虑哪些地方。而数据库的建模，关键是要还原`database schema`，虽然有一些不确定的可能性存在，在实际中我们仍然有可能对`database schema`进行静态建模。（稍后讨论）
其他的Session Data和File names 就先不展开说了。

---


## 2.2 Second-Order Vulnerabilities
> 本小节介绍啥是二次注入

taint-style类漏洞的外在表现机制来看就是系统中的关键安全操作(security-critical)所需要的外部数据被攻击者控制了。从内部(data-flow model)来看就是污点数据(tainted data)随着程序中至少一条数据流流入了敏感函数(sensitive sink)。

那么对于**二次注入**，他就可以划分为一类taint-style类漏洞。但是比较特殊的是，他所利用的数据流会经过至少一个PDS。因此攻击者的payload就会存储在PDS中；接下来再使这些payload传入senstive sink。
因此，分析这种漏洞，有两类数据流需要被分析:

1) source to PDS
2) PDS to sink

此处有一个分析难点在于：所有source, sink以及PDS的组合都有可能形成潜在漏洞(这里又是一个注入路径组合问题)。
下边给出具体漏洞的motivation example
### Persistent Cross-Site Scripting
我们所谓的 *Persistent Cross-Site Scripting* 就是传说中的*存储型XSS*， 攻击者直接将payload存储到PDS中，然后再通过此程序将他读出来。由于这是一种非反射型XSS(*non-persistent(reflected) XSS*),攻击者不需要将一个值得怀疑的链接发送给受害者。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-20-020729.png)

此例子中下边else语句块中就是一个存操作，将comment和name写入到comments表中的author和text字段。而在上边的submit中读出来。


### Second-Order SQL Injection

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-20-020810.png)

同理而言，二次SQL注入中，if语句块中将payload存到了\$\_SESSION['user']中，在mysql_query中直接使用，这里的PDS是SESSION。

### Multi-Step Exploitation
从上边的漏洞原理我们看出，二次注入的漏洞构成是多段的。 这多段(至少两段)，可分为两次: 第一次是把攻击向量存入pds的过程，不构成漏洞。
第二次是真正利用PDS中的payload构成漏洞的过程。

---

## 3. Detecting Second-Order Vulnerabilities
从上文介绍可知，静态方法检测二次注入最大的挑战就是如何进行静态的数据库建模。
本文在方法介绍中从五个方面进行了介绍: 
1. `Data Flow Analysis`, 介绍数据流分析方法
2. `Context-Sensitive Taint Analysis`, 上下文敏感的污点分析
3. `Array Handling`, 数组处理
4. `PDS-centric Taint Analysis`, 基于持久存储层(PDS)的污点分析
5. `Inter-procedural PDS Analysis`, 将这种方法(4)适配到过程间

### 1. 数据流分析基础(Data Flow Analysis)
本文的数据流分析方法是基于是基于Xie的工作做的，使用三层summary的方法(basic block, function, file)，这种做法号称能在一定程度上缓解脚本语言静态分析的dynamic features的问题。 具体做法是做后向数据流做污点分析形成一个three-tier architecture。 具体是先找块， 然后自顶向下生成块间控制流，然后在块内，从return开始构建数据流。
在生成summary时针对的**data symbol**有五种: (Value, Variable, ArrayDimFetch, ArrayDimTree, ValueConcat, Multiple):
1. `Value`:  其实就是字面量(而不是变量的值)，定义环境中的constant值。
2. `Variable`: 通过变量符号表示一个变量。
3. `ArrayDimFetch`: 表示数组下标访问(使用)，在原有`Variable`符号上扩展dim, 如$array[k], 把k计作`dimension(k)`, 其实就是一个数组下标敏感。如: \$array[k]
4. `ArrayDimTree`: 表示数组声明或者赋值某个数组单元，如: \$arry[k]=\$data。表示为一棵树。
5. `ValueConcat`: 以($a.$b)的形式记录`Value`的合并。
6. `Multiple`: several data symbols的容器, 当一个函数返回值具有多种情况时(依赖于control flow 或者PHP三元操作等)。

污点分析时，会在这些data symbols上打上sanitize标签证明数据被消毒了，另一方面，如果在分析时遇到一个user-defined function, 就去找到他并构建，依据args的不同， 实现上下文敏感的污点分析。这些都是基本污点分析，主要看作者的亮点(但是他提的很少) xD.

### 2. 上下文敏感的污点分析(Context-Sensitve Taint Analysis)
作者声称，在基于以上数据抽象(symbol data)和数据流分析的基础上我们能够进行上下文无关的污点分析。

如果在block simulation是发现一个对sink的调用点，就会去分析他传入的相关实参(arguments)。 
将实参转化成data symbol(上六种)，然后基于这个data symbol开始做后向污点分析。如果污点的定义点在本块中，就引用本块摘要。否则沿数据流后向一块块地找，直到找到定义点所在的基本块为止。特别的对于一个数组变量`ArrayDimFetch`需要找到对应的`ArrayDimTree`。 当数据流分析走到的CFG的起始位置或者成功找到了符号引用的值为止(source)。最终所有分析完的符号都会转化为字符串的形式：Value和Boolean将转化为具体的字符串表示，source点将被转化成一个`TaintID(TID)`。

接下来每一个字符串都会被分析， 如果TID标记点在一句标记语言内部(SQL, HTML)，这时候就回去parse标记语言(厉害了)。 对于每一条路径上的data symbol，都会一一验证是否有*sanitization tags*或者是*encoding information*，做到安全消毒敏感(我编的)。如果一个TID路径上的所有data symbol都无消毒，那么就报出一个vulnerability。 

最后，如果污点来源是parameters或者globals(他拉了fields，所以是默认不支持OO)。就在标这个function的summary上。


### 3. 数组(Array Handling)
PHP的数组是比较辣手的一个东西，由于是动态语言，他只提供Array这一个复合数据结构容器。可用作数组，也可以作哈希表。作者根据经验发现，往数据库写内容时，内容的数据结构通常表现为一个数组(读出来的resource也是存在一个数组里)。 

这有什么用呢？发现一般关联数组的key就是数据表的列名，value就是对应的具体内容，通过PHP中的`implode()`函数将这个数组的key和value分别用逗号连接成字符串(Listing 5, line 1 and line 2)。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-14-023951.png)

显然这种操作是一个`side effect`，如何静态的处理它，作者通过对`implode()`建模，在该函数上标注`ArrayJoin`行为，通过这个符号(`ArrayJoin`)


### 4. PDS-centric Taint Analysis

![image](https://user-images.githubusercontent.com/3693435/124577733-1d149380-de80-11eb-837f-2aab1a9e5cff.png)

全文的精华都在这张图上了。 
这里其实是三个图(a),(b),(c)，常规的(conventional)污点传播就是(a)，second-order就是(b，c)。
b, c的不同在于，(b)的PDS层在code analysis时已知是taintable的了,他存储着污点数据 $\delta$，因此我们就会有一个新的污点数据符号 $\delta^{*}$ 让我们衔接污点数据。

而(c)的情况在于不知道PDS中哪里是taintable的，此时如果后向分析污点来自于PDS，那就报出一个(*temporary vulnerability report*), 这个report是由$\delta^{*}$所连接的。

具体从三类PDS(`database`, `session keys`, `file names`)来说：


#### 1. database
最主要的PDS模型，也是最复杂的挑战。首先当然是尽可能的静态还原`database schema`，然后本文尝试还原了所有的SQL注入时可能的查询(分析了110个built-in查询函数)。最后推断了操作数的类型。
* `Preparation`: 此阶段还原database schema，最直接的方法是读.sql(schema file)后缀的文件。以及在这些文件中搜集所有`CREATE TABLE`命令。如果此文件没有找到，就通过正则表达式在PHP文件中寻找相关信息。
                
* `Writing`: 本文将SQL查询tokenize之后，找`INSERT, UNDATE, or REPLACE`等关键字。以及对应的表名。如果对于一个`unspecified write`，就是用第一步中的database schema来获取这些信息。 如果一个column对应的input value包含一个TID，那么影响列名和表名就标记为*taintable*(并记录其source与sanitization tags)。

* `Reading`: 如果一个SQLparser遇到一个SELECT状态，我们尝试探测他选择的所有表名和列。然后会在每一句SELECT查询的返回值上打标签，包含相关的列名表名(ResourceDB)。

* `Access`: PHP中从数据库查询所获取的资源存储在数组中(这里忽略了对象)并通过built-in fetch function获取内容。 如果一个`ArrayDimFetch`获取了内容，就将`ResourceDB`符号传递给他。如果查询时使用了通配符(*), 此时是全列访问，从`database schema`进行读取。

* `Sanitization`:  在二次注入中，sanitization不光要考虑数据流上的函数消毒， 还要考虑SQL语句中的消毒以及数据库字段消毒，因为PHP这种动态类型语言中没有类型，而数据库的字段会限制类型，如果字段名是数字，就是一个潜在的消毒。还有在SQL查询时，如果WHERE子句中和一个数字常量比，那么也是一个潜在消毒。
这里作者还考虑了存库时引号的消失引起的unsanitization现象。

> 总结：从此处看出，database操作的还原工作上，`database schmea`的还原非常重要，在unspecified写与通配符访问*，这种SQL语句找不到相关列信息的时候，都是从构建的`database schema`中寻找。

#### 2. Session Keys


#### 3. File


#### Multi-Step Exploits
以SQL注入为例，静态扫描器首先标注所有受SQL注入影响的SQL写查询的表名，在污点分析时，如果后向发现一个来源是SQL查询，

### 过程间PDS分析(Inter-procedural PDS Analysis)


---


# 效果评估
本工作的的评估方法是选择了6个real-world web applications。 
second-order vulnerability 包含两个data flows: 
- tainting the PDS(污点传到PDS里)
- tainting the sensitive sink(PDS传到sensitive sink)
评估将分步考虑。


## PDS测试：
### 1. Usage and Coverage:
为了给一个web application对于PDS的使用情况的overview，回答一个web系统在运行时使用多少`memory locations`。
通过作为一个使用者，在运行时向PDS注入\<>'",本文发现在测试集手动发现了841处PDS操作点，有23%是可以taintable的。 
本工作的方法能够发现其中71%的taintable PDS，有6%的误报。

#### database
本方法在六个测试集全部构建成功了`database schema`。
Table1给出了数据库中的VARCHAR和text字段(可污染列)的比率。 发现其实有55%的列是不可用的(如INT或者DATE)。

![image](https://user-images.githubusercontent.com/3693435/124587040-c3b16200-de89-11eb-8d7b-fda7bc2f422b.png)

Table2对可污染列(可存储string)进行手工fuzz，观察哪些列实际可污染。发现有53%是真实可污染的，不过只有24%的真实可污染列没有被过滤(web 应用或者columns' data type).

> 问题: 在发现taintable columns时发现对于大型的现代项目，通常使用loops来动态构建SQL查询，在重建时容易出错。
本工具在发现taintable columns时70%的TP和5%的FP。

![image](https://user-images.githubusercontent.com/3693435/124587240-f9564b00-de89-11eb-86c8-bddfe7da32d4.png)


#### Sessions

下边是session的, 为了获得一个 `ground truth` 给我们evaluation。 我们手工评估应用中所有访问的$_SESSION的key，然后手工分析能够被污染的session keys。*Table 3* 显示了Session中可污染的key只包含12%。可污染session key 中的一个误报来自于从数据库中读出的一个已经消毒的邮件地址。

![image](https://user-images.githubusercontent.com/3693435/124587858-b5177a80-de8a-11eb-86aa-a78226fa2db9.png)

对可污染session探测准确率很高。


#### File Names

 为了探测实际中用户可控制的文件名，本文从三个方面入手: 1. 文件上传， 2. 文件创建， 3.文件重命名，在手工标记完ground truth之后，分析taintable的path，结果如*Table 4*:
 
![image](https://user-images.githubusercontent.com/3693435/124587959-d24c4900-de8a-11eb-9818-d2e49dcf9e0e.png)

这里发现每个项目至少有一个创建新文件的功能。半数应用都进行了防护，改工作的方法可以把他们都找出来，有一个FP是因为OpenConf对路径敏感信息消毒了。

### Second-Order Vulnerabilities

表5是本文工作进行二次注入漏洞挖掘效果评估，共挖到159个合法的二次注入漏洞，误报率21%。者159个漏洞中，97%是存储在数据库中的XSS，有5个是存储在SESSION中的XSS。

![image](https://user-images.githubusercontent.com/3693435/124588110-06c00500-de8b-11eb-9aef-163a56f400da.png)

除了存储型XSS还有一些其他存储型注入漏洞:

#### OpenConf中的Second-Order LFI to RCE

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-013629.png)

我们看到这里没有控制点的，但是printHeader中包含了一个$GLOBALS中变量拼接的路径，如果可控，我们就可以包含一个文件，如果文件中包含PHP代码，就可以RCE了。

那么如何如染呢，我们看到`$OC_configAR[]`的键值皆来自数据库。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-015959.png)

这里有一个updateConfigSetting,是用来更新程序中的配置的。而我们可用通过`$_POST`点对其进行污染。listing7第2行污染后的内容将在listing6的第6行中读出来。

此时我们就可以POST一个叫做'OC——headerFile'的key。


#### NewsPro Second-Order RCE

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-020604.png)

从Listing8的代码中可以看出来，template表中的`unp_template`字段是可污染的。
而在listing9的unp_printTemplate()中，可以讲该内容读取出来，然后在eval中被执行。
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-020936.png)


### Multi-Step Exploits
Multi-Step可以看作是second-order 的一个子类。 因为两次注入都是攻击者有意而为之的。 
本方法成功发现了14个SQl注入和2个任意文件上传。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-022554.png)


#### osCommerce中的Multi-Step RCE

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-022818.png)

此处我们可以看到，如果文件名可控那么$read_from就是一个SQLI。
`攻击者就可以利用这个注入点向configuration表中注入任何内容(无视字段显示)`。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-21-024118.png)

此时就可以污染这些字段进行一个RCE。


### 误报分析
43个误报(21%)的原因是该方法不能够探测路径敏感的sanitization(detect path-sensitive sanitization)。
对于persistent XSS, Scarf and HotCRP通过邮件地址将可控数据存储在数据库，本方法错误的将其识别成了未消毒。
一个user-defined sanitization function造成的路径敏感的过滤造成了29个误报！！！
对于mulit-step exploit, HotCRP报出一个错误的SQL注入，也是由于路径敏感的sanitization没有探测到。 

### 漏报分析
分析漏报是一个error-prone task，因为目标中有多少漏洞是未知的。本工作的目标项目也没有二次注入相关的CVE。本文的方法检测之前手工标注的可污染pds点是否被发现。发现6个数据库1个session key。另外SQL parser需要被改善，miss了concat等情况。