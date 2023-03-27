# TCHECKER

![image-20230304093721252](../../Library/Application%20Support/typora-user-images/image-20230304093721252.png)



本文尝试在PHPJoern的基础上解决PHP静态分析的基本问题，从而加强PHP静态分析工具发现污点分析漏洞的功能。

- PHP的特性主要问题有：
  1. 方法调用(Method Calls): 由于PHP是一门动态类型语言，很难静态推断出receiver object对应的类型。
  2. 变量方法(Variable Functions): 这个算是PHP独有的特性，即使用变量作为标识符调用函数，如\$f = "g", 此时使用\$f()即等同于使用g()。 这样为过程间分析增加了难度。(本文将这种变量称为\function name variables\)。
  3. 动态包含(Dynamic Includes)： 这个点我也只在PHP中看过，使用变量名加载代码。如require \$a。\$a为一个资源访问路径。需要计算出来才能得到对应的代码。
  4. 对象属性(Object Properties)： 对象属性和全局变量类似(全局变量的作用范围是全局，而对象属性作用范围使整个对象)。



针对这些PHP中的特性问题，增加了静态分析的难度：

1. 函数调用关系分析(Call Relationship Analysis) 难: 

   由于污点往往会跨越多个过程，因此过程间的污点分析是有必要的。

   分析过程间的前提，就是要分析调用关系。

   这就涉及到了两种调用： 1. 函数调用（函数名为标识符，函数名为表达式） 2. 方法调用(其中receiver object为表达式)。 其中难得就是分析注入\$obj->f()和\$f()这种包含了表达式的调用。 主要难在：

   - 1. PHP是弱类型语言
     2. PHP是动态类型语言
     3. PHP可以动态调用(spl_autoload_register)

   因此分析一个调用一定是需要上下文敏感的(context-sensitive data flow analysis)。

    

2. 数据流分析难: 

   	1. receiver object的数据流追踪难
   	1. PHP特性分析难： 如动态常量(dynamic constances(constant($con))), 动态变量($$var)。



针对以上难题，对现有工具进行了分析:

1. 函数名匹配(Matching of Function Names)： 分析过程间调用是为了使得污点分析能够跨越函数边界。

   ​																			其中一种方法是吧receiver objects忽略，直接匹配函数名(RIPS)。

   这种做法是会有误报的，如\$obj->f(), RIPS会去匹配code base中的所有f函数声明处。

   而PHPJoern用了另一种做法，他会忽略重名的，只有唯一匹配到f()才会构造调用关系(?)。

   这样造成了大量的漏报。

   

2. 数据流分析(Data Flow Analysis)：

   商业版的RIPS-A已经能够支持receiver object的分析了(\$obj->f())，而且还能分析变量调用(\$f())，但是做的还不够深入，因为缺少过程检的信息，这些调用函数信息的还原只局限于在过程内。因此RIPS-A无法推导位于其他函数作用范围内的变量的类型和取值信息。

3. 函数摘要(Function Summary)：使用函数摘要意味着提升性能，牺牲精度。因为建立了函数摘要意味着每个函数只分析一次而不考虑精度。

   

   

   ## Motivation

   ```php
     <?php
     <img ... src = "<?= base_url('attachments/blog_images/
     							.$_POST['image'])?>">
     function base_url($uri='', $protocol=NULL) {
         ...
         return get_instance()->config->base_url($uri, $protocol);
     }
   
     //system/core/Config.php
     class CI_Config {
         ...
         public function base_url($uri='', $protocol=NULL) {
             ...
             return $base_url.$this->_uri_string($uri);
         }
         protected function _uri_string($uri) {
             ...
             return $uri;
         }
     }
   ```

   

在这个例子中，如果我们要建立第6行到第12行的调用关系，我们就必须识别出get\_instance()->config这个receiver object指向了哪个类。



# TCHECKER 

TCHECKER是一个能够进行上下文敏感的过程间分析的PHP静态污点分析工具。

 它显示进行调用关系分析并构建调用图。在每次分析函数调用的时候，都会重新计算函数调用点到可能得函数集合的映射：

![image-20230304105656148](../../Library/Application%20Support/typora-user-images/image-20230304105656148.png)

## 构造调用图

如上所述，构造调用图最难的问题在于找__目标函数__时PHP面临着方法调用和变量函数此类的问题。

### 0x01 识别调用点处的函数名（function name）

分析调用点的目标函数如果基于上下文不敏感可能会引起过估问题(Over-approximation problem)。

TCHECKER设计了一个两段式的调用图构造方式。首先进行搜集receiver objects和variable function names，然后进行后向数据流分析，去找他的函数名。接着在第二段中，根据找到的函数名去与函数调用点进行连接。为了尽可能多的找到新的目标函数，TCHECKER迭代进行两段分析。

如发现了base_url()的调用点之后，TC先找到了第3行的目标函数，此时连接其第2行到第3行的调用边，之后，再分析receiver object  `get_instance()->config`由此连接新的target function。

#### Receiver object 推导

那么receiver object是如何推导的呢(我也不知道╮(╯▽╰)╭)？

因为一个方法调用，回去查询整个对象所属的类的继承关系(子类可以调用父类的方法)。如果一个对象是子类类型，而所调用的方法是其父类中的方法，那么就构成了类继承关系图的分析。

为此，TC使用了一种迭代式(又是迭代)的分析手法来判定一个recevier object所属的类型。

假设recevier object的表达式为\$rec, \$rec有两种可能， 一个是表达式中的变量可能是过程内赋值，一个是过程间赋值(external variables)。

如果TC在过程内找到了new A语句，那么就会把recevier object的类型设置为A，否则继续找过程间。此处记为\$ev。

> 过程间的四大来源： 参数， 对象属性，全局变量，返回值

1.  如果追$ev到了函数参数(很可能是对象注入了)，TC就返回参数中\$ev的声明类型(但是参数是弱类型啊)。所以大多数没有声明类型的情况下，TC搜索当前函数的所有调用点f()（因为f()的参数中包含着reciver object)。 通过后向数据流分析指定的参数，来推断参数\$ev可能得类型。
2. 如果\$ev是一个函数调用的返回值的话(\$ev = \$obj->func())。TC后向从return进入调用函数去搜索。
3. 如果\$ev是对象属性的话，那么$ev的值一定是在某个类中，如\$ev = \$o->p，此时TC先搜寻\$o的类型c， 建立了两个约束： 1. 类型C必须包含属性p, 2. (TODO)
4. 如果$ev是全局量的话，TC后向追踪f()的caller们，以及f()中的callees所有的调用点，企图找到\$ev的复制位置。

#### 变量函数名推导（Variable function）

要求出一个函数名表达式，比求解receiver object还要困难。目前只有RIPS-A支持部分求解能力(还是过程内)。

TC在上万个调用点中出现了几十个漏报。另外TC还是用了近似处理，如$y()追踪到('get'.\$x)()，此时我们无法推测\$x的取值，因此只能去匹配仅有的信息-以'get'开头 的函数调用。



### 0x02 连接目标函数Connectin Call Targets(target function)

TC在解析到目标函数名后，进行调用点与目标函数名的连接。

首先，一个调用点的被调用的目标函数名与会去匹配所有符合得函数声明，接着做过滤， 将那些不符合要求的目标函数声明过滤掉。

- Determining Called Function Names:

  由于函数调用关系的存在，被调函数名可能不等于目标函数声明的字面量(例子)。 为此，TC使用了extends keywords进行目标函数声明匹配， 并且构造了继承树。

  如果是类内部调用，使用parent或者\$this， TC会使用类型名代替掉这些关键字。

  

- Validating Call Targets. 

  1. 静态调用了非静态的方法
  2. 参数不匹配
  3. 访问限定符冲突(private)
  4. 访问限定符冲突(protected)



### 0x03 模拟文件包含(Simulating File Includes.)

TC将文件包含表达式当做是函数调用对待，其包含的目标文件看做是user-defined functions。

TC使用了与推导变量函数名相似的方法去推导文件包含的路径表达式。





举个例子， 在Listing 1中有三个call site, 其中，第二行的base_url很自然的匹配到第三行的目标函数。

```php
 <?php
  <img ... src = "<?= base_url('attachments/blog_images/.$_POST['image'])?>">
  function base_url($uri='', $protocol=NULL) {
      ...
      return get_instance()->config->base_url($uri, $protocol);
  }

  //system/core/Config.php
  class CI_Config {
      ...
      public function base_url($uri='', $protocol=NULL) {
          ...
          return $base_url.$this->_uri_string($uri);
      }
      protected function _uri_string($uri) {
          ...
          return $uri;
      }
  }
```

此时，为了解第5行的get_instance()->config->base_url(\$uri, \$protocol);

这个有点难了。

解这个方法调用的目标函数就需要先解这个receiver object，他是一个属性（get_instance()->config），而且这个属性的对象是一个函数的返回值。手工审计的思路是:

> 找到get_instance()返回的对象类型 -》从改类中找到config属性的object类型-》找该类型的函数调用

自动化的话发现了第九行的CI_Config就是get_instance()->config的唯一receiver object，理由是:

1) 已被实例化为一个对象属性，其属性名为config（怎么看出来的？）
2) 有一个base\_url方法

基于以上观察，就需要不对get_instance()的返回值进行类型分析。

因此就可以确立第5行的调用点的目标函数是第11行的base_url。

最后为了分析第13行的调用关系(\$base\_url.\$this->\_uri\_string($uri));

> 理论上需要分析base_url的值，然后在进行字符串拼接，但是这里是\$this比较奇怪

在这个点，作者的意思是找到了子类中重写的方法Sub::\_uri\_string()



## 污点分析

TCHECKER可以发现三类漏洞: XSS, SQLi, 以及DoS漏洞。

- XSS污点汇聚点： mysql_query
- XSS污点汇聚点： echo
- DoS污点汇聚点: 循环条件

### 0x01 过程内分析

TC分析污点路径上的赋值语句，对于复合语句(复合分为嵌套和组合)\$a = f(func($b))， 拆成三条：

- the parameter of func() => $b
- the parameter of f() => return value of func()
- the value of \$a => the return value of f()

TC从上向下进行递归解析。

对于污点标签的处理，TC首先分析赋值操作，如果其中有消毒动作，污点标签消除。污点标签打在污染源，被污染变量，被污染数组成员，以及返回值上。TC还能进行跨属性的污点追踪(厉害了)。



### 0x02 过程间分析

TC的过程间分析如下:

- 选择目标函数(Selecting Target Functions.) 

  TC首先选择可能在此上下文中被访问的目标函数。在TC的Call Graph上可能出现一个调用点连接多个目标函数的情况。然而，在一个上下文中，一个调用点只能调用一个目标函数。

  TC使用启发式的方法来选择目标调用函数。我们观察到，有多个候选目标函数的情况多数是动态调用造成的(non-static)method calls。

  对于有数据依赖的关系，如\$this->config->f()，TC会在同文件下找包含方法f()的对象，然后扩大到在子文件夹里去找。

  虽然这种方法理论上会带来一些误报，但是TC在实验中找到了所有现有工具能够发现的漏洞。

  

- 预处理目标函数(Preprocessing Target Functions.)

​		TC预处理一个目标函数，如f(), 为了找到他是否包含了污点传播因素，选择了可选择性污点分析(selective taint analysis)。 

            1. asg_global: 搜集所有潜在的可被污染变量，用作传播污染源
            2. func_global: 函数中的一类callee, 用作传播污染源
            3. func_source: 函数中的一类callee,  用作source  

以上三类，在构造CPG时被一次性分析完毕。



- 分析目标函数(Analyzing Target Functions.)： 涉及到了去环，TChecker模拟了函数调用过程中的上下文切换，并将受污染的局部变量初始化为任何受污染的函数参数。



## 实现

基于PHPJoern实现了TC, TC强化了DDG的字段敏感。

- Built-in Functions. 内置函数建模。

- Conditional Statements and Loops. 优化条件和循环，合并所有分支中的污点，over-tainting。

- Arrays. PHP中只有一种复合数据结构那就是array, 他的实现是一个hash table。而且，数组的引用既可以用标识符也可以用表达式(\$arr[\$key]=\$val)。而且对于一些函数array\_push()可以在运行时动态修改数组。

  常用的做法是使用数组元素的具体值。TC做了两个特殊处理: 1. \$arr\['a'][\$var]在\$arr['a']被标记为污点是也会标记为污点。2. 对于索引是变量的情况，有可能指向任何元素，我们不分析\$i而是依据\$arr['a']是污点，直接标记\$arr\[\$i]。





## EVALUATION

![image-20230305164150304](../../Library/Application%20Support/typora-user-images/image-20230305164150304.png)

测试集中共有17个项目， 并且和PHPJoern和RIPS进行了比较。

TC报出了284个漏洞（UP, UN, NP指的是TC特有的）。

与RIPS比较，TC发现了50个RIPS没有发现的漏洞，其中有27个漏洞通过复杂的对象属性传播。

 TC的精确率达到了46.1\%，RIPS为6\%。

与PHPJoern比， PHPJoern的精度虽然高(47.9\%)，但是发现的漏洞是最少的(77个)。



### 误报情况 :

1. Incomplete Sanitizers(不完全的消毒)
2. Intended Fetures(特殊更能)
3. Implementation Issues(实现问题)
4. Dead Code(死代码)



### 漏报

1. 过滤绕过
2. 。。。



### Case Study

![image-20230305180210649](../../Library/Application%20Support/typora-user-images/image-20230305180210649.png)

![image-20230305180228033](../../Library/Application%20Support/typora-user-images/image-20230305180228033.png)