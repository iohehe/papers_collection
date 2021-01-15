
# BREACH
breach是一种基于http压缩为侧信道的信息泄漏利用技术， 见于2013年的blackhat上。 我的理解是，通过返回压缩内容大小不一的侧信道来探测那些从用户输入进入body响应体的敏感信息。
# DEBREACH
本文提出了一种针对此中漏洞的静态分析框架：
![Jietu20210115-104447](https://user-images.githubusercontent.com/3693435/104691415-2890c880-5741-11eb-99f9-9c70c6a4d692.jpg)
首先， debreach的输入是程序源码和一些敏感API（例如如果一个API能够获得数据库中的某些敏感信息， 那么就把这个API标记为一个敏感数据的source点）。 在Debreach中有一个污点追踪引擎，追踪敏感数据从source到sink的流动。为了cover所有的敏感信息流， 这个操作是sound的。
那么如何去分析呢， 在获得流信息和标记好敏感位置之后， debreach将这些信息做成了EDB, 形成一个Datalog facts,然后污点分析过程就是对这些facts写rule进行推导。最后， debreach会对去断定标注senstive data 的optimal points(最优点?)
