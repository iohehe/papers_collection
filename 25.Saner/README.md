![](https://tva1.sinaimg.cn/large/e6c9d24ely1gzok7y1ur0j20f408umxy.jpg)

# 背景与问题
针对Web应用程序中缺少input validataion的问题，之前的工作往往关注于发现不安全的输入，但是很少有工作研究sanitization process的性能问题。大部分的工作认为只要在污点传播路径上，污点数据被正则表达式或者built-in sanitization function处理了，那么他一定是安全的了。这种看法是不正确的。

问题在于sanitization process本身往往会具有不正确和不完备的问题，这就导致了虽然input数据被sanitization process了，但是安全问题仍然可以绕过现有的sanitization。

一方面，程序员可能使用正则表达式检测输入数据中某类安全无关的事件，这就导致污点数据依然没有被消毒。另一方面，开发者可能意识到了安全问题，也使用了sanitization function，但是保护的不够健壮。 

> 总结下来，sanitization正确性的问题包含一个missing问题和一个incomplete的问题。

本文介绍了一种分析方法，使用动静结合来解决sanitization的正确性问题。使用静态方法捕捉程序中流向sink点的输入是如何在路径上如何被修改的。由于使用了一种保守分析，会引入大量的误报，因此结合动态技术，再从sink点反向model程序中从sink追溯支source的数据是如何变化的，并重构代码程序，使得能够动态执行大量恶意构造的输入值来验证漏洞是否在sanitization process中还存在。

本文贡献:
- 描述了一种静态分析方法，通过对model应用程序如何处理输入值的方式来刻画sanitization proce。
- 描述了一种动态分析方法，通过重构代码，使得能够从source点动态输入恶意攻击载荷并穿过现有sanitization process到达sink点。
- We compose the two techniques to leverage their advantages and mitigate their disadvantages.
- 对方法进行仿真，并在真实项目上得到验证，我们因此在sanitization routines上发现了大量之前未发现的漏洞。

# 挑战与法
为了描述具体的挑战，首先看motivation：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-24-123632.png)

sanitization routine的使用挑战有两个： 
1.不同sink需要匹配不同的sanitization，你SQL注入的sanitization routine对于XSS就不好使。
2.每一种漏洞，结合敏感sink的上下文环境，是不是过滤全了，对于stirng taint analysis, custom过滤方法是使用str_replace(字符串替换)或者eregi_replace（正则替换）这种替换方法，这种一般需要复杂的规则匹配才行，因此好在PHP提供了一些built-in sanitization使用。上例中第3行的过滤使用了built-in是完备的，但是第7行是不完备的，可绕过。

> 注意对于PHP,创建并修改字符串有三种方式：使用string literal, 使用字符串连接运算操作，使用built-in functions

## Sanitization-aware static analysis
本文采取了一种动静结合的方式来验证sanitization的有效性。首先静态方式实在Pixy的基础上进行修改，对于custom sanitzation，Pixy采取的是soundness的方式，即对于input进行了任何的非built-in sanitzation function操作都不敏感。因此本文在此基础上进行了修改。提出了一种`sanitization-aware static analysis`，接下来在此基础上进行动态消除误报操作。

### Sanitization-aware static analysis
1. Basic String Automata 
本文使用了一种有限自动机。因为我们的目的是modeling sanitization routines，因此我们需要*set of values*的信息，即routine要处理的值得集合(不仅仅是抽象成过滤还是未过滤，要包含每一个输入字符)。本文使用了一种有限状态机来评估字符串的值。判断每个program points上的variables里的value是否是一门certain language。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-25-062346.png)

在该自动机表示方法中，每条边代表了一个字符转移(single-character transition). 注意标签<.>代表任何字符。除了对每一个字符进行编码，自动机还需要对整个字符串的taint or untaint状态进行识别。我们希望知道在整个字符串中，哪些部分可污染，哪些部分不可污染 。进而重构这部分字符串的代码，使其能够被input来动态检测。

> 字符串在通过这样一个有限状态机后，就能把被污染的部分子串和不被污染的子串识别出来。

Figunre2中实现字符就是不可被污染的(untainted character)，这些字符串是程序运行时获取的静态字符串(static strings embedded in the program source code)。

> 字符串有两种，一种是嵌入在代码中可预知、不可更改的，一种是运行时由外部随机生成的，一般风险存在于外部随机生成的字符串。


2. **程序依赖图**
本文使用的基础分析工具是Pixy，使用Pixy的程序以来分析来构建程序依赖图:

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-25-064226.png)

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-25-064151.png)

上图是第9行的\$custom的数据流依赖关系。 该分析可以对程序中所有program point中的每一个variable进行分析，找出所有数据相关联的其他program point。


3. **Computing Automata**

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-25-065415.png)

有了依赖图就开始通过上述算法进行有限自动机推导：
注意这是一个递归算法，递归的是`decorate`方法，此方法的原始输入是一个变量依赖图的顶点(无环),之后每一个图上的节点都会对应一个有限状态机。
从Figure4的算法可以看出，对每个节点分5种情况处理： string node, \<intput\> node, operation node, variable node, 与SCC node。

对于每一个状态机都要去计算其可能的字符串值，计算方法是对当下节点的后继节点进行后向遍历拿到所有相关的字符串状态信息，进而得到(decorated)本节点的字符串相关状态并向上递归。

举例来说，如果一个节点的种类是string node,那么就简单的decorated with an automaton that describes exactlyy this string(就是把字符串内容描述清楚)。如果是一个\<input\>，那么就需要分析input的类型。如果是一个operation node,那么就要进行语义分析模拟，判断其是否包含字符串拼接操作。将operations分为了两类，一类是modeled，一类是不modeled。 对于variable node 采取后相关联的方法，


4. **Cyclic Dependence Graphs**

Figure3中的SCC节点表示的是Strongly connected components（强连通分量），使用强连通分量进行去环，对于SCC点，处理方法类似于built-in functions，不进行model。因此作为一个star automation。


5. **Discussion**
总结下来这一部分是对program 中的string进行识别分析， string的创建和修改有三种方法：
1. use of string literals
2. concatenation of two strings
3. the use of built-in functions

对于前两种方法的使用，我们的算法可以很好地识别，对于第三种built-in，需要进行模拟(transducers)。 对于字符串操作不对字符串索引式操作进行模拟(${3},表示一个字符串中第三个字符)，这种操作在PHP中很少。


## Precise Function Modeling
分析custom sanitizatoin 需要精确地model string-modifying functions 与 replacement fucntions。

> string-modifying functions: *str_replace* \
> string replacement functions: *ereg_replace*, *preg_replace*

!!! A suitable algorithm was presented in the natural language processing community.
 
对于程序中字符串的修改一项重要的工作是由NLP领域提出的(Mohri and Sproat), 这个工作是基于`finite state transducers`的。 一个transducers是一个状态机，其transitions与output symbols相关联。这种方式并不只是接受输入字符串，他也能够为每个输入字符串产生出输出字符串。
如使用该算法对Figure1中第7，8行代码进行字符串操作分析，得到如下有限状态自动机:

![](https://tva1.sinaimg.cn/large/e6c9d24ely1gzqn8e3as8j20ny07omxp.jpg)

该自动机描述了一个字符串集合由前缀HELLO开始，之后不包含尖括号(not <)， 但是这个工作不是taint-aware的，因此不能够得知该字符串的tainted和untainted状态。

## Vulnerability Detection Through Intersection
为了检测程序中是否包含可利用的敏感sink,需要探测敏感sink的input是否包含任何的恶意字符。如XSS攻击中类似'<',可以用啦构造标签。我们的方法使用一种交叉自动解的方法(intersecting the automaton)来表示sink input 的target automaton(即sink input中表示是否包含不被允许字符集的状态机)。如果该状态机为空，则说明sink点是safe的。

Figure 6就是一个target automaton,它是由两个automaton交叉而成，一个是至少包含一个'<'的字符集，一个是Figure5的automaton；显然，第一个是一个包含攻击的字符串条件,他需要至少一个'<'，第二个是实际传入的automaton字符集条件，他不能包含任何'<'；因此交叉后，得到的target automaton为空，如此证明，在该点的sensitive sink的参数是安全的。


![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-26-012927.png)


## Implicit Taint Propagation
上述的这种function modeling和vulnerability detection的方法不能够到达很高的精确度。因为传统的automata没有taint相关的转移。也就是说这种算法不能在model functions间传递taint values。(taint values不敏感)。这将会引发误报。以下例子:

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-26-021204.png)

在Figure 7 中，所有的"\n"将被替换为'\<br /\>'，但是在echo \$x出做交叉automaton时，为非空，因为允许"<"的存在，而此处的"<"是硬编码进去的程序内部的static strings，他不可变。因此是一个误报。为了解决这个问题，一种方法是改进现有的算法(Mohri and Sproat),使得它能够做到taint-aware；我们采取了一种更sound,effective,less complex, and error-prone的算法。这种方式与显示地追踪taint,untaint的value不同，是一种相对隐式地方法。我们直接在automata计算时，将这些嵌入的static strings标为空(empty string)。 这样的话，只有tainted strings时显示地被automata encoded。

但是这种方法会引入漏报，如例子Figure 8中的str_replace()，我们的方法会把$s替换为空，因为\$s,此时的值为'a'。为了补全，使得分析sound,加入一个分析str\_replace（）第二个参数的机制，如果第二个参数是taint的，那么整个都是taint的。

## Providing Information to Dynamic Analysis
动态方式给静态方法打辅助的，是在静态结果之上，验证被爆出的sanitization处理路径完不完备。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-26-024930.png)

如上例子中，虽然script标签被移除了。但是可以用html标签嵌入事件。因此动态可以给这个地方利用静态分析的依赖图把source-sink pair给报出来。(这里相交不是empty吗？)

## Testing Sanitization Routines
静态分析阶段是保守的，因此会带来一些误报。 因此我们使用动态分析来弥补这一问题。在动态阶段，我们需要测试的是sanitization routines在source传到sink之前的路径上起了什么样的影响。
也就是说要找到那些可以绕过sanitization functions的输入。

理想状态下，我们们应该在整个程序运行起来的状态下对污点传播路径进行测试，但是存在一些问题就是漏洞的可利用实在一定条件下的(如管理员登录)。这样测试起来为污点行为因素的影响十分复杂。

因此本文采取了一种只关注sanitization process对其他因素进行抽象的动态测试方法(有静态抽象，就有动态抽象，有点意思)。

 ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-26-075519.png)

 动态分析阶段有两个步骤组成: 1. 构建一个sanitization graph(抽象成图)。2. 第二步是对sanitization graph中相关的sanitization code 使用大量的测试案例。

 ## Extracting the Sanitization Graph
通过过程间切片得到sanitization graph, 试图分析并获取污点传播路径上所有的sanitization instructions。这些过滤行为有四大类: 1. built-in的(language provided sanitization routines),2.regular-expression-based substitutions(preg_replace...) 3.string-based substitutions。

Figure 9 是一个客制化的sanitization function, 用户11行的输入可以传到其中。 我们构造过程间数据流，提取线相关的sanitization instructions，构造了Figure 10 的Sanitization Graph。

 ## Testing the Effectiveness of the Sanitization Routines
 为了测试这种方法的有效性，我们使用一个sanitization graph 来获取所有可能的污点路径$P_i$。我们发现构造sanitization graph时，经常有环。因此我们通过只分析一次的方法解环。每个路径$P_i$生成的代码块为$C_i$。

# 实验与评估

# 总结