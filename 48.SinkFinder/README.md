本文改进和继承susi(14 ndss)的工作， 是一篇通过机器学习的方式在源码中识别出安全敏感函数的(security-sensitive functions)的工作。 susi是做在安卓上， 本文做在C上。
## 0x01
- susi有哪些不足？ 
susi是基于SVM的sources, sinks分类器。他是直接用的监督学习，因此需要标记足够多的样本集。 说susi中标记了770个安卓框架的API作为训练集，如果迁移方法到别的平台，工作量也是很大的。因此本文像通过很少的训练集，得出一个可用的classifier。
- 本文的贡献
本文提出了一个sinkFinder的方法， 通过无监督学习，只依赖于甚少的前验，就能提从目标中提取足够量的正负样本集， 从而使用它们来训练一个高效率的classifier。

## Motivation 
略

## Design
首先去拿源码中的frequent function pairs, 找这种函数对的依据是两类数据流关系，data dependence(DATADEP) and data sharing(DATASHARE)。 
- data dependence: 函数g如果依赖于函数f, 如果f的output value 传入了g的一个参数。(f->g)
- data sharing:  如果函数g1与函数g2，获取了同样的变量值作为其参数，并且至少有一条控制流上的变贯穿两者。这条控制流必须是feasible的(分支条件可满足，静态咋判断呢？)

