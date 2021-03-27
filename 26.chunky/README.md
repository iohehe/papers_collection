# Chunky
- 作者: Fabian Yamaguchi
- 会议: 2013 CCS


## 介绍
本文是Fabs博士期间的一个点， Fabs博士的开题是基于Pattern Match的漏洞挖掘， 在属性图之前，做了基于AST相似度匹配的辅助人工挖掘和这个。总之，都是在尝试做自动化辅助人工漏洞挖掘。
正如Fabs博士所言，在实际漏洞挖掘中， 还是靠正则找点手工挖掘， Fabs博士的思路很实用。 我觉得。
tedious auditing of source code...

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
