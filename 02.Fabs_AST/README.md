# ACSAC2012-Generalized Vulnerability Extrapolation using Abstract Syntax Trees

# 1 
- 这是一篇2012年的ACSAC， 看这篇文章是想看他如何把AST映射到向量空间的。特色是将机器学习与静态分析相结合。
- 这是fabs博士发的， 我是他的小迷弟。

# 2

- 本文也是， 提出一种辅助代码审计工具， 用来发现源码中的漏洞。
- 方法是首先生成AST,然后在树上去找漏洞模式。（为什么要用AST这层, 这层可能好提向量？ 或者这层能够突出代码文本的结构？）（是的， AST保留了语法结构信息与每个节点的内容信息）
- 作者在2011年的woot上发表了一篇[1],这篇文章里就提出了这个`vulnerability extrapolation`的方法，这种方法的描述是:`embedding code in a vector space and automatically determining API usage patterns using machine learning`（就是说将代码嵌入到向量空间中利用机器学习做漏洞匹配）

在方法上， 首先需要明白的是， 这是一种辅助性的手段。 我觉得这可能是fabs博士codeminer的理念(至少在早期)，即自动化辅助人工审计。 本文辅助方法是通过代码相似度匹配的方法， 通过把本项目的一个已知漏洞解析成语法树，再进行一系列的变换后映射到向量空间后。 用同样的方法处理所有函数， 然后去匹配相似度，认为， 相似度高的函数可能包含同样的漏洞。作者在进行相似度匹配的时候既保留了内容信息， 又保留了语法结构。对比于redebug, vuddy这种token化处理比较函数相似度的(plain),我想这种做法的好处可能是比较精细，当然前者是可以跨项目比对的(理论上，实际效果可能还是有联系的项目作用会大一点)。 而本文的方法，内容上不token化，保留原标识符信息比较(因为同项目可能漏洞触发路径上的关键函数都是调用的一个)， 又保留了语法树结构。 精度上应该会更好一些(但是一个项目的漏洞，只能找本项目的)。

简单介绍一下这个方法：
  
- 总流程： 
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-07-060919.png)
  
- 这种方法分了四部：
  - 1. Extraction of AST(获取语法树). 将输入的code base 以函数为单位生成语法树。 利用了一种`island grammars`技术，此技术对于c/c++代码不需要考虑编译环境既可以进行语法解析。实现上使用了ANTLR做为parser。
  生成语法树： 
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-07-060804.png)
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-07-060809.png)
  可以看到，b为代码a的序列结构， 而图3为其图形结构。在图形结构中， 我们看到不光解析成语法树，还对节点进行了分类: 虚线节点在比较中最重要(API nodes)，标明和API调用有关的节点(实参声明， 变量声明， call节点)，而点线是该函数的一些语法信息(syntax nodes), 剩下的实线的是no-syntax nodes。 此种节点类型划分在下一步里有用。
  - 2. Embedding in a vector space. 上一步我们我们有了语法树，要进行机器学习比对，需要将其映射到向量空间。此步骤便是特征化向量的第一步。每棵语法树， 将被映射到空间S中， S空间有三种定义方式：1.是只保留API nodes的节点，其他节点忽略； 2. 保留API nodes和语法结构，即在D层内发现一个API nodes(D在实际使用时为3层), 就包括这棵树，并把所有非API nodes的节点全用占位符代替。3. 与2相同，但是还保留了syntax nodes。
  有了这三种对向量空间集合S的定义， 我们对目标code base中的每一个function都有了三个评估角度，相当于给了三种由简单到复杂的匹配模式。
  有了这个空间S的定义后， 我们就可以定义一个映射I,将每棵树映射到S中。以上树(🌲)为例子，如果映射的API nodes空间(第一种只包含API nodes的)，那么这颗AST就会表示成三个向量x=[param:int, decl: int, call:bar],此时在整个code base的大API nodes空间S中，就可以表示一个矩阵M(s*x)(矩阵在映射时还加了一个TF-IDF权值，还不是很懂，只说是能去掉一些实际相似度不高的)。可以看到这颗AST只有三个维度，因此在整个空间上非常稀疏，因此实际使用时易于比较。
  - 3. Identification of API usage patterns.  简述一下：这一步是为了让功能相近的函数有一个相关度，将矩阵M拆分成了三个，其中一个向量表示了相关度。
  - 4. Assisted vulnerability discovery. 这一步就是找漏洞了。使用上一步的三个矩阵进行比较。


  
> 文章把三类节点分定为`API`: `parameters types, declaration types and function calls`,第二类不是很懂。

## 映射向量空间：
  将语法树映射到向量空间，需要保护好树的内容和结构， 为了做到这一点，文章把每一个function做成子树， 构成一个子树集合。提向量集合s有三个方法：
    1. API node: 只从树上提API点做成集合， 其他点忽略。
    2. API subtrees: 提一个子树，深度D,至少包含一个API点，其他点占位符。
    3. API/S subtrees: 在2的基础上有算上了`syntax node`(API node + syntax node)

# 总结
- 文章中从AST上提一些感兴趣的点然后生成向量的思路感觉还是很好的。
- 最近越发觉得，不管是joern,rips,pixy等等，他们都是先搭一个框架，然后在上面去解决某一个问题点。这中模式可能比较适合我去做。

# reference
[[1] Vulnerability Extrapolation:
Assisted Discovery of Vulnerabilities using Machine Learning](https://www.usenix.org/legacy/events/woot11/tech/final_files/Yamaguchi.pdf)
