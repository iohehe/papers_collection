![image.png](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-13-085252.png)
本文发表在WWW'2021年由KAIST发表，今年USENIX上的FUGIO也是这里搞的。

利用代码属性图进行漏洞挖掘是一种粗粒度(coarse-grained)的方式，这种方式只能探测到 missing sanitization check 而不能发现faulty sanitization checks。 要发现此种类型的漏洞，需要进行细粒度(fine-grained)的漏洞发现。本文通过将已知漏洞片段表示成子图，并通过代码相似度比对的方式在目标程序中寻找具有相同表达的代码片段从而发现漏洞。

这种技法(代码克隆比对)通常包含了四个粒度：

- Type-1: Exact clones: 除空格、布局、注释外，语法等价。
- Type-2: Renamed clones: 除Type-1中的元素以及标识符、字面量、类型信息外，语法等价。
- Type-3: Near-similar clones: 除Type-2中的元素外，还包含了插入删除修改statement等操作，语法等价。
- Type-4: Semantic clones:  语义等价，具有相同语义但是实现语法不相同的代码片段。

  本文提出了HiddenCPG, 在PHP中覆盖了Type1-Type3，利用代码克隆寻找PHP代码中的漏洞。

## 代码属性图

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-011919.jpg)

代码属性图使用将源代码通过图进行存储的数据结构，其中包含了抽象语法树(AST), 控制流图(CFG)，数据依赖图(PDG)以及函数调用图(CG)。

上图中的左边是一个XSS漏洞的源代码， 右边就是他的属性图表示， 其中绿色的边是AST边，红色的边是控制流边，蓝色的边是数据依赖边，黄色的边是调用边。

有了这些边的信息，我们就可以把整个图存到图数据库中，并通过图数据所提供的查询语言(DSL)来挖洞了。只需一次构图，多次使用，而且不管什么语言，都用一套DSL来分析，可以说是非常的棒了。

## Motivation

这篇文章要干的活是解决过滤错误引发的漏洞， 这种对于之前phpjoern的污点分析是无法发现的。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-011953.jpg)

上图中就是这样的一个例子， 我们可以看到，这里已经使用了 `htmlspecialchars`()这一个过滤器， 但是问题是这个漏洞的触发环境是在一个href中，这就尴尬了。因为这个点我们输入的字符串是以下形式：

```html
<p> <a href="你的输入">Content</a></p>
```

这个时候你使用htmlspecialchars()将敏感字符"<", ">", "'", '"'转化成HTML实体编码就不好用了，原因在于这个地方是使用了href属性，在浏览器端渲染时，发现了href属性后会自动调用url解析器先，所以你可以构造一下payload:

```html
javascript:alert(/xss/);
```

这里就是用了javascript伪协议，在url解析器解析时看到了javascript:..就会去调用js解析器执行了。

所以说这里是有漏洞的，但是传统的已静态分析器发现了过滤行为 `htmlspecialchars()后就不在追究他到底对不对了(有就行)，所以这里就会产生一个漏报。即所谓的粗粒度。`👀️

但是如上例这种trick是很多的，我们很难通过专家经验进行逐一建模处理(其实我觉得也行)。

本文就是通过了子图同构的概念，将已知已知漏洞的属性图子图提取出来，并进行相同模式的子图匹配，从而发现新的漏洞。

## Design

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-012024.jpg)

文章的流程分为三个阶段：

1. 生成已知漏洞片段与目标程序的代码属性图表示
2. 对代码属性图进行优化与剪支
3. 子图匹配

整个过程有两个难点：

1. 子图的规模问题，如何刻画匹配子图的大小
2. 子图的表示形式问题，如何能够识别两张相同语义但是不同表示的子图

### Step1: 生成表示（Building CPGs）

这里有一个例子：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-055240.png)

左边是一个faulty sanitization的 例子，我们需要手工标出sourde点在第4行，sink点在第12行。

首先第一步是将这段代码在属性图上normalizing:

1. 规定将所有的source(_GET, _POST, _REQUEST...)抽象成 `norm_source`，sink（echo, print...）抽象成 `norm_sink。`
2. 如果变量传播的终端包含与HTML标签之中，记录标签环境，如第11行的输出在一个a标签内的href属性之后，抽象成节点 `norm_a_href`。这一招是为了找faulty santization的洞。
3. 将变量标识符，字符串常量以及user-defined functions抽象成节点 `norm`，不要抽象built-in functions(为了检测API重用？)和字符替换规则如正则表达式(为了找到定制的过滤规则)。
4. 边抽象，两种边，蓝色的是数据依赖边。红色的是CFG上的控制边。

接下来做Exracting, 我们只要漏洞相关的边，去掉那些与sink无关的边，只留下相关的。然后就可以比对了。

### Step2: 优化表示(Pruning CPGs)

现在响应的数据结构有了，下一步就要进行子图比对了。然而这是一个NP完全问题。

我们现在又Pair$(T, Q),其中$$T$是目标程序的图表示， $Q$是已知漏洞的图标表示，我们需要设计在子图匹配前进行优化表示，从而能够降低搜索空间。

这里使用了一个叫做 `Cloned Buggy Code Detector(CBCD)`的优化方案，该方案能够提高子图匹配问题的效率。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-065829.png)

具体有三种优化方案：

1. 从$T$中排除不相关的边和节点: 如上图所示，我们现在有已知漏洞Q，我们在目标图T中排除那些不存在Q中的有向边和节点。如木有节点E，木有一条由B流向C的红边(控制流)。
2. 将 $T$拆成小图：图Q中出现最少的节点是C，我们称为VKmin。然后再T中定位所有的VKmin，计算VKmin在图中到其他点的最大步长db(忽略方向)，这里是3，因为C最远到达B是3。然后以3为半径划分子图。
3. 排除无关的子图，这里可以看到最后一个图排除了下方子图，原因在于这张子图只有一个B，子图中每个节点的数量要大于等于Q中对应节点的数量。

### Step3: 子图匹配 （Matching Subgraphs）

子图匹配使用了VF2算法。

## EVALUATION

### 漏洞发现

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-071618.png)

HiddenCPG发现了2,464个漏洞(tql)，漏洞有四种，XSS(就是XSS), UFU(无限制文件上传，这帮人很喜欢搞文件上传), SQLi(SQL注入)和LFI(本地文件包含)。

数据集是从GitHub上下载下来的7,174个PHP源程序。为了更好地发现漏洞分为wild，purpose。其中purpose是一类专门设计有漏洞靶场。可以看到，果然还是XSS给涨的脸。

而且大部分是w/o san.即缺少消毒而不是w/faulty san.即错误消毒。 错误消毒的化感觉靶场会比较多，因为会玩各种花。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-073301.png)

这里看到大部分的洞还是前两类克隆出来的。

能探测前两种主要得益于工具对点和边的抽象能力。

HiddenCPG发现了35个,Type-3，以往工作来看这种技术对于时空开销和准确率都有很大的挑战。HiddenCPG能发现得益于程序图表示和树表示的对比能力。

之所以没有找Type-4是因为属性图的表示还是太"高级"了，AST上做语义匹配粒度有点高，会有很多误报，需要进一步研究更好地表示方法。

### 性能表现

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-05-29-074315.png)

VF2算法+三种优化+匹配，在7，174各项目上一共花了16天又12个小时的时间。每个项目平均用时3分19秒。

可以看到图匹配算法占了大头。

# 总结

本文在CPG的基础上，在PHP项目中的进行代码克隆比对的漏洞寻找，经过图表示(抽象，剪枝)、图优化(排除边和节点、拆分子图、排除子图)、图匹配(VF2算法)三个步骤，在7,174个项目中发现2,464个潜在漏洞，并证明能够发现更细粒度的过滤使用错误问题。
