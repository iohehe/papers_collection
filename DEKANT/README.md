基本信息
发表会议
ISSTA 2016
作者信息
作者：Iberia Medeiros, Nuno Neves, Miguel Correia
单位：Lisboa University
研究方向：system security, static analysis, machine learning

论文内容
动机
在web应用程序当中，注入型漏洞仍然是一类很常见的危害， 此类漏洞通常表现为从用户可控处输入危害信息，经过一系列的传播到达到关键函数。通常开发者的防御方式是在传播路径上添加sanitization函数对输入内容进行过滤或者添加validataion函数对输入内容进行合法性验证。开发者通常使用静态分析工具来自动化探测此类漏洞，但是开发这些工具需要足够专业的知识去自动化识别每一种具体漏洞。
技术问题与挑战
开发者通常使用传统的静态分析工具来自动化地探测此类漏洞，但是开发这些工具往往需要足够专业的知识去自动化地识别每一种具体漏洞类型，以及是否在传播路径上已经被阻挡。这些知识的不完整或者错误，就会造成工具的不精确性。
解决方案
2.3.1 隐式马尔科夫链
![image](https://user-images.githubusercontent.com/3693435/96080176-10fb3700-0ee9-11eb-8153-fd6d8b159148.png)

一个模型：入=(派，A，B)
两个假设：(1) 齐次马尔可夫假设： 序列中任意位置的状态只依赖于前一位置的状态。
(2) 独立观测假设： 任意位置的观测状态只依赖于该位置的马尔可夫链状态。
三个问题：(1) 评估问题（detect)，（2）学习问题(learn)，(3)预测问题(decode)

2.3.2 工作流程
![image](https://user-images.githubusercontent.com/3693435/96080217-2a03e800-0ee9-11eb-998d-14eec7eb3f17.png)
学习阶段： 
学习阶段的主要任务是构造训练集合，训练HMM模型。为了分类污点链Slices是vulnerable还是non-vulnerable，作者设计了五种目标状态，其中Taint和N-Taint是每个sequence的最终状态，其他三个是中间状态(描述转化原因)。
![image](https://user-images.githubusercontent.com/3693435/96080321-659eb200-0ee9-11eb-8003-f2152578f0a8.png)

为了更好的观测目标状态转化，作者设计了21中观测状态，称为ISL(Intermediate Slice Language)
![image](https://user-images.githubusercontent.com/3693435/96080364-794a1880-0ee9-11eb-8ff2-459bc434d74e.png)

在学习阶段，作者使用从20个项目中提取的510个污点Slices,其中414个vulnerable, 96个non-vulnerable。将他们转化为观测序列，然后标记<Observation, State>形成Corpus进行学习构造HMM。
![image](https://user-images.githubusercontent.com/3693435/96080373-7ea76300-0ee9-11eb-9c2a-5b95347037c5.png)

漏洞探测阶段：
在学习阶段获得HMM参数后，漏洞探测阶段就是一个HMM的decode问题。将污点链的Slices表示成观测序列，就可以根据目标模型求解出对应每个观测状态的最大目标状态。首先，作者提出了几个数据结构来辅助观测：
Variable Map: 用来存储观测序列中，对应有效污点变量token的变量名。
Tainted list(TL): 记录污点传播中有效的污点变量名。
Conditional tainted list(CTL): 记录被条件表达式判断过的污点变量名。
Sanitized list（SL）: 记录被sanitize过的污点变量名。
每一条观测序列的decode过程：
Before: 如果一个变量存在于TL中，切不存在于CTL和SL中，在该序列中为有效污点变量，将token由var改为var_vv。
Decode: 使用Viterbi算法对观测序列进行解码，得到概率最大的目标状态。
After: 根据获得的目标状态序列，获得<Observation, State>，处理TL，CTL,和SL中的内容。
![image](https://user-images.githubusercontent.com/3693435/96080395-8c5ce880-0ee9-11eb-9382-38a1882ad3c8.png)




实验分析
实验一：从10个wordpress插件中探测0day。
  ![image](https://user-images.githubusercontent.com/3693435/96080405-90890600-0ee9-11eb-9f02-9fe37e295f8f.png)

实验效果：从10个插件中获得80条Slices，其中24条分类为vulnerable。其中有16条是0day，8条误报。

实验二：从10个开源项目验证已有的漏洞。
![image](https://user-images.githubusercontent.com/3693435/96080431-a4346c80-0ee9-11eb-828d-117c05561813.png)

实验效果：从10个开源项目中获得310条Slices, 探测到全部 211条有漏洞的Slices,误报12条，全部来自validation条件判断问题。
工具评测：
![image](https://user-images.githubusercontent.com/3693435/96080449-a8f92080-0ee9-11eb-964b-701d1e19ab0a.png)

其中 WAP与PHPMiner是分类工具。Pixy是传统的PHP静态分析工具。


论文评价
创新点
使用机器学习方法结合静态分析的方法，对污点链进行分类(vulnerable or not vulnerable)
从论文中看HMM在污点Slices分类中可以在学习样本量不大的情况下得到很好的分类效果。
问题与不足
对已有的污点链进行分类，取决于对污点链的发现能力。
对于validation条件的内容不能很好的区分，如正则表达式是否真的起到了验证效果。
改进方向：
探测传统静态分析方法中无法直接获取的Slices。
识别validation的规则，对validation条件的有效性进行判断。
