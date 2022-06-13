![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-jeremy-bishop-uqK47SoAiI0-unsplash.jpg)

---

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-024901.png)

本文是www'21上的一篇关于PHP漏洞挖掘的文章。本文针对的是PHP这种weakly-typed语言中提供的 `loose comparisons`引发的安全问题。这是一种由于类型系统缺陷引发的安全问题。PHP中，相对于 `strict comparisons`(===, !==), `loose comparsion(==, !=)会隐式地将操作数的变量进行转化。如("0e12345" == "0e67890") 会比较为True因为PHP将两个字符串转化为了整数0在进行比较。这就会引发所谓`的 `loose comparison bugs`。本文即是针对这种bug进行检查。

---

## Motivation

举个栗子(CVE-2020-8088)，是一个UseBB(1.0.12)中的bug, 发生在登陆模块：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-060037.png)

注意第7行是登陆验证，这里有一个或操作，第一个是从数据库查到的用户id，动不了；而第二个就是一个 `losse comparsion`，显然，密码是通过md5存在数据库的，因此这里的逻辑是：数据库查出的密码与用户输入密码的md5值进行比较，不中就登陆失败。

但是这里用了 `!=`，如md5('QLTHNDT') = "0e40...” 而md5("PJNPDWY") = "0e..." 的松散比较就会想等。这个trick在CTF中很常见的。

---

## Design

本文设计了自动化挖掘 loose comparison bug的工具 LCHECKER。

自动化挖掘loose comparison bug的难点在于：1)需要在大规模中实现上下文敏感的程序分析 2)由于大量的loose comparison与bug无关，因此如何消除误报。

本文采用了一种动静结合的设计：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-062719.png)

### 静态部分

- `Taint Analysis`: LCHECKER的静态分析以常规PHP的source(_GET, _POST)出发，以loose comparison点为sink点进行污点分析。
- `Type Inference: `LCHECKER通过类型推导算法进行，类型推导有两个难点： 1. 动态类型语言的变量的值和类型往往在动态运行时才能知道。 2.动态语言的变量的值和类型可以在程序执行期间不停地变换(赋值不同，类型也会改变)。通过数据流分析，LCHECKER对每一个变量维持一个类型集合包含: Null, Bool, Int, Float, String, Object, Array, Mixed。在数据流上对这个集合进行分析，如果是字面量(x=“1”)，就可以直接确定这个类型，如果是操作，就可以根据操作符转化(x = 1."string")。如果是内置函数，就建模，对于user-defined function，则使用上下文敏感的过程间分析，并对函数进行建模。该分析是路径不敏感的。
- Context-Sensitive Inter-Procedural Analyisis: 对于user-defined function的上线文敏感的过程间分析如下：

  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-074642.png)

  对于上边的例子，LCHECKER进行过程间分析时，第2，3行分别调用了f(),而f会原样的返回参数。在f进行摘要生成时，将参数与返回值对应，这样我们知道第2行实参是数组，那么返回值也是数组。第3行是参数是字符串，返回也是字符串。另一方面，f()函数中有一个loose comparison，他是上下文敏感的，第2行进入就没洞，第3行进入就有洞。所以在对f()摘要时，要把这个loose comparison标出来，供不同的上下文参考分析。
- 漏洞发现：如motivation所示，LCHECKER寻找的是绕过验证的松散检查。 这种检查通常的业务流程是查处数据库的密码，并和用户输入的密码md5后的值进行比较。所以LCHECKER会tag数据库查询和md5操作作为额数据流操作中的额外信息。当一个loose comparison的操作数同时包含了数据库查询的tag和md5的操作的时候，LCHECKER才会报出bug。另外对数据库的tag有时难以找到，或者密码干脆存在文件或者硬编码在代码里。这时候LCHECKER维持一个常见密码变量的list，遇到就会tag成数据库操作(如$pwd)。

### 动态部分

对于静态分析中的大量的误报，LCHECKER使用一个半自动化的方案进行动态验证。这一部分在PHP解释器上实现了一个插件，是的我们可以精确地获得比较操作数的类型和值。如果运行时发现了隐式的类型变化，就会爆出一个bug。由于静态分析已经获得了有限的路径，因此这一步的人工操作不是很多。

## EVALUATION

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-084521.png)

上表包含了26个PHP项目，SC与LC分别表示strong comparison与loose comparison的数量，LCB是loose comparison的bug的数量。作者还与Joern进行了对比(上标为J)。可以看到LCHCKER报出了958个taint，是LC总数的1.92%。又从其中进行类型推导，获得185个结果，筛掉了773(98.08%)。最后经过动态检测报出了185个TP，而Joern只有13个。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-12-085616.png)

如上图所示， J一共报出了759个漏洞，只有13个是正报。其中有16个误报是Joern独有的(G)，另外743个（A，C, E）是两个工具共有的，但是这里边只有13个漏洞是tp(A)。LCHECKER通过后序手段排除了其他的。

B, D,F是LCHECKER独有的，在B中, LCHECKER多发现了一个TP。

---

## 总结

本文是首个针对PHP这种弱类型语言的 `loose comparison bugs`进行检查的工具，通过静态污点分析。类型推导，函数上下文敏感分析+建模，动态验证的方式。本工具发现了42个新的loose comparison bugs，其中包含9个CVEs。