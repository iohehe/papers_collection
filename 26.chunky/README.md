# Chunky
- 作者: Fabian Yamaguchi
- 会议: 2013 CCS


## 介绍
本文是Fabs博士期间的一个点， Fabs博士的开题是基于Pattern Match(模式匹配)的漏洞挖掘， 在属性图之前，做了基于AST相似度匹配的辅助人工挖掘和这个。总之，都是在尝试做自动化辅助人工漏洞挖掘。
正如Fabs博士所言，在实际漏洞挖掘中， 还是靠正则找点手工挖掘， Fabs博士的思路很实用。 我觉得。模式匹配很像是做出一个模子来， 然后用这个模子卡，卡上了就是有漏洞(或者没有漏洞)。 而这个模子，通常使用机器学习的方式制作出来的， 至少Fabs博士，就是这样一种思路。

这个工具叫做chucky, 旨在寻找源代码中的insufficient input validation。他抓住的漏洞线索是omitted checks， 如何从source code中找到这些特征，然后利用他们发现漏洞。
作者基于一个假设： 在成熟的目标对象中， missing or faulty checks的情况，不多。基于这一思想， 就可以在很少误报下找到一些少有的missing checks(在Pidgin和LibTIFF中发现了12个0day)
本文的贡献：
  - Identification of missing checks. 提出了一种挖掘missing checks的创新型方法
  - Anomaly detection on conditions.  该方法以函数为单位，嵌入到向量空间，然后利用模型自动化探测条件异常。
  - Top-down and bottom-up analysis.  讨论了两种方向的污点分析。
  - Suggestion of corrections.  还能给出修复建议？？


## Design
该工具分五个流程：
- 1. Robust Parsing, 代码进行解析，提取关键信息(如source, sink等)
- 2. Neighborhood discovery, 根据目标函数的解析结果， 根据自然语言处理， 在整个code base中， 找和他具有相同上下文用法的其他函数，形成一个带筛选漏洞函数集合。
- 3. Lightweight tainting, 对他们进行一个污点分析，提取路径。
- 4. Embedding of function, 将其结果嵌入到， 向量空间之中。
- 5. Anomaly detection, 异常检测。

### Robust Parsing
对与missing check的分析器，需要对语法的深度理解。 作者使用了基于ANTLR开发的Joern来实现。
*  Sources and Sinks, 一个函数中， 潜在的sources和sinks有哪些呢？parameters, local variables, globals variables(oo还有field)，这些都是潜在的sources和sinks需要在结构图中把他们给标出来。 而这些点的所在函数中的位置， 都有可能和一些安全检测联系在一起(可能都有一些独一无二的安全相关的条件需求满足，才能触发)。
*  API symbols, 文章提到了，标出函数中的API是找到neighborhood的前提。
*  Assignments, assign点的标明，能够把信息流在变量之间的传递表露出来。通过该条脉路，我们就可以制定所谓的lightweight tainting, 把流到sink点出的条件信息给抓出来。
*  Conditions, 搜集source点或者sink点触发时路过的所有conditions, if, for, while以及其条件表达式。

### Neighborhood discovery
这里的neighborhood 思想基于，安全check与上下文具有很高的相关度。 如一个configure的读取，往往不会进行安全check（本地写好了的，相对安全）。而一个外部输入，如network data进到程序后往往就需要检查了。chuncky通过检测函数的使用上下文的相似性来辨认neighborhood。 前面也提到过了， 以来与API symbols. 作者使用了bag-of-words model，即自然语言处理中的词袋技术来进行识别。 将函数映射到向量空间，维度以划分
这里的neighborhood 思想基于，安全check与上下文具有很高的相关度。 如一个configure的读取，往往不会进行安全check（本地写好了的，相对安全）。而一个外部输入，如network data进到程序后往往就需要检查了。chuncky通过检测函数的使用上下文的相似性来辨认neighborhood。 前面也提到过了， 以来与API symbols. 作者使用了bag-of-words model，即自然语言处理中的词袋技术来进行识别。 将函数映射到向量空间，维度系API标识符号，这样张开的空间，就能很好的将包含相同API功能的函数划分到一起。

### Lightweight Tainting
一个常规的函数，只有一部分的流同sink与source相关， 想要把相关的信息切出来,才能把不相关的check丢弃掉。为此， 此步骤进行一个lightweight tainting， 分两步：
- Dependency modelling, 此步骤中， 将产生一个directed graph. 此图讲明一个函数中，变量间的依赖关系，这也是为啥前面需要提取Assignments(还有param)的原因。
- Taint progagation, 沿着此图，做污点传播(可)，从source走是前向传播， 从sink走是后向传播。在函数边界处停止(过程内)，拎出与sink与source相关的数据流。

### Embedding of Functions
前面三步， 信息提取和整理齐了。此时，在进行异常探测之前需要把这些以函数为单位的信息嵌入到 向量空间。我们会将之前提取的， 与source, sink相关的条件进行规范化处理(机器学习的常规套路来了)。
- Removal of negations， 否定移除(我还不确定)， 一些符号如<变为$CMP, 数字变为$NUM。
- Normalization of arguments and return values, 参数与return的范化。
将规范化的函数们嵌入到向量空间里。

### Anomaly Detection
溜了溜了
这里的neighborhood 思想基于，安全check与上下文具有很高的相关度。 如一个configure的读取，往往不会进行安全check（本地写好了的，相对安全）。而一个外部输入，如network data进到程序后往往就需要检查了。chuncky通过检测函数的使用上下文的相似性来辨认neighborhood。 前面也提到过了， 以来与API symbols. 作者使用了bag-of-words model，即自然语言处理中的词袋技术来进行识别。 将函数映射到向量空间，维度系API标识符号，这样张开的空间，就能很好的将包含相同API功能的函数划分到一起。xing实话， 
