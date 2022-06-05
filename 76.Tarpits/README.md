![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-04-1f6489ff93123623d398f52cb576c2dc_3x3.jpeg)

# 0x01 基本信息

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-04-061135.png)

本文发表在2022年的NDSS，其中有代码属性图的作者Yamaguchi博士，他现在在shiftleft，致力于打造Joern。

本文针对的是PHP，JS这种动态类型语言，在污点分析的时候，会有很多动态特性的问题，使得这些静态分析工具失效，本文将代码中的这些patterns称之为 Tarpits。

那他们有什么呢? 当我们在静态污点分析的时候，遇到很多奇奇怪怪地程序特性如反射、回调函数、动态赋值等等，再加上OO特性和三方库调用(本文指出OO用的越多越难分析、本文不分析三方库缺失导致的分析问题)...

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-012413.png)

本文的核心思路就是，使用专家经验人为地总结这些模式，然后写查询在目标程序中找到这些模式，并将他们转化为可以检测的形式，从而使得分析完整、流畅。

# 0x02 流程

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-04-072020.png)

本文分三个步骤：

1. 建立pattern，通过专家经验与分析PHP，JS相关的文档后总结常见的tarpits的patterns，然后用实际的SAST工具进行测试，如果有至少一个工具工作发生问题，就把其定义为实际的selected patterns(tarpits)。
2. 制作了一个原型工具(查询语句)，在实际项目中对这些tarpits的patterns进行发现。
3. 进行patter transofrm 使得目标程序更加容易被检测。

下面分别讲解

## 1. pattern creation and selection

这样一步分为两个大部分：

1. pattern creation: 通过专家经验总结patterns(candidate patterns)。
2. pattern selection: 使用真实的SAST工具进行扫描，如果至少有一个patterns发生了预期的问题，就将其纳入selected patterns。

### pattern creation

1. Core language features vs built-in internal APIs.

- 对于语言特性

下面这个例子就是一个地址引用造成的XSS，\$$myV和$\$obj->getV地址绑定了，所以污点从\$a污染了\$obj->v后也就污染了\$myV;

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-014028.png)

> 作者构造了96个PHP的， 153个JS的。

- 对于built-in internal APIs
  由于PHP这种语言的内置API都是由C语言写的。因此静态工具往往无法分析这些API，过去的方法只能建模，让工具知道输入输出是什么。
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-020025.png)
  如PHP这个经典的 `extract()`他会把参数中的数组中的每个键值对在当前作用域中注册成局部变量。如数组中的"A" => \$aaa就成了$A = \$aaa。
  这种API只由动态建模了。

  作者构造26个PHP的，22个JS的。

  2. Security related
     就是测试静态分析工具污点分析能力的。我看就是测试speicifcation(source, sink, sanitizer)找的全不全的。

     ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-020834.png)

  如这里的exit其实是一个XSS漏洞的sink。

  > 作者构造了16个PHP的,22个JS的。
  >

3. Static vs Dynamic features

这里是重点，为了细化SAST工具探测动态特性的能力。 作者分了四个级别(D1-D4):

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-021233.png)

虽然这里的 `call_user`\_func\_arrray("Func", \$b)，关键参数(调用的函数名)被硬编码在了参数中。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-021402.png)

D2加了一个常量分析的过程，就能得到和D1一样的效果。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-021504.png)

D3就开始是战斗级了，我们只能恢复关键参数的部分信息(调用的函数是"Func"开头的)。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-021739.png)

D4就是静态无法拿到的情况了。

> 作者构造了52个PHP的patterns, 52个JS的patterns

4. Positive vs Negative Test Cases

针对动态特性无法静态计算的问题， SAST工具采取两种策略:

over-approximate: 会增加误报

under-approximate: 会产生漏报

> 作者构造了7个PHP, 20个JS的negtive的例子来测试工具是over-approximate还是under-approximate

5. Functional vs Object-Oriented

开发者使用越多的OO特性，静态分析就越难以分析。

> 构造了39个PHP的patterns和40个JS的patterns

作者一共收集到了122个PHP的patterns和153个JS的patterns，在下一步里需要在真实的SAST工具上进行测试。

对于PHP作者选择了4个开源工具和2个商业工具(Comm\_1, Comm_2)

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-024654.png)

在这张图中我们可以看到， 果然商业工具的效果是最好的，单价对SECURITY支持最好，本来就是做污点分析的啦。对于OO的支持开源工具只有Progpilot这个工具做的比较好。

这里也验证了我之前的一个直觉就是大家论文里都说自己是sound的，都是动态特性惹的祸，但其实还有一个很大的因素是OO，尤其是对于脚本语言，OO分析是个大问题。

值得讽刺的是PHPsafe标榜了他是第一个支持OO的分析工具，然而毛线都没有测输出来。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-025501.png)

JS阵营的效果会好一点，这里不再阐述。

经过此步测试，会构造一个tarpits的library，将那些难住了SAST Tools的patterns拿出来。

## 2. PATTERN DISCOVERY

这一步就是如何在真实的项目中找到这些patterns。这里好像是在给代码属性图打广告

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-030046.png)

如这里如何在代码中找到引用赋值...

为了证明这些patterns 在真实项目中的流行度， 作者在Github上clone了1000个star数在20-70之间的项目， 1000个star数在200-700之间的项目和1000个star数在1000以上的项目($G_L$, $G_M,$$G_H$)。

然后做了两张好看的图：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-030555.png)

散点图中的每一个点表示一个PHP项目， Y轴是patterns数量，  X轴是规模(使用的是opcodes来衡量， 因为joern支持了opcode 的分析)

（有没有想过按时间来画这张图？）

我们看到star数目高的项目其patterns数目会多一点，其安全性也理所当然更高一些。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-030604.png)

这里好像吧Comm_1和Comm_2的真实姓名暴露了XD。

这张图对两个工具在项目中发现的patterns进行了测试。发现似乎Fortify比Checkmarx好用一点。而且通常这些patterns超过20个以上工具就不太好用了。

本文分析了state-of-art的静态分析工具的瓶颈：第一个是OO, $G_H$中97\% 是OO写的。 但是对于OO特性如魔术方法的调用静态分析工具都没有很好地解决。第二个是动态特性，不详细说了。


## 3. MANUAL PATTERN TRANSFORMATION

这个地方也对测试目标中的tarpits进行transformation。

作者选了10个项目(PHP, JS各五个)，满足以下条件:

1. PHP, 或者JS的项目
2. 存在已知的有CVE的漏洞，而且其代码片段还在
3. 存在tarpits在漏洞的污点传播路径上
4. 现有静态分析工具因为这些tarpits不能发现这些漏洞

怎么办呢，作者就开始了神奇的转化。经过这种refacoring后的代码使得原来的污点分析工具不仅发现了所有的CVE还再多找到了一些漏洞。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-070234.jpg)

经过作者的手工探测， 在十个项目中发现了9个unique PHP和17个unique JS tarpits阻碍了静态分析工具(CheckMarx 和Fortify)。

作者使用了三种转化策略。

1. __T1 - Semantic-preserving Transformations__
   语义等价转化。 如 `call_functions`这个函数如果在项目中是 `D1`级别的就直接转化为显示调用，使得tarpit消失。
2. __T2 - Over-approximations__
   这是一个降漏报转化，如下面这个例子：

   ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-071732.png)

   这种模版赋值会使得所有工具都失去效果，本文通过将{\$lc}转化为include($lc)来让静态分析工具识别这个点。
   这个将分析工具转化的over approximations的方法可能会引发误报。
4. __T3 - Developer - Assisted Transformations__

这是重点(不是)，T1, T2可以自动化的进行，但是作者发现有一些tarpits不能自动化去掉需要一些开发者的辅助。

如上边提到的extract(),让分析工具知道这里进行了赋值操作就可以加一段注释给SAST工具看：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-073030.png)这个手工添加以后，SAST工具就可以知道这里有一个值传播。

> 我认为这三种转化才是本文的重点，但是这里一共用了差不多半页就讲完了，所以我觉得这里其实做的并没有很细致，但是效果还是不错的

经过以上三种转化以后，多报了503个新的潜在注入漏洞，经过手工确认224个是TP。


# 0x03 EXPERIMENT


本文选出了5个简单的tesability tarpits(R1-R5)，然后再Github爬下来的项目中进行测试，他们分别是：


![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-074511.png)

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-074613.png)

测量结果如下表：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-074248.png)

其中occ就是R1-R5他们出现的次数，而prj就是包含他的project的数量。

可见TP还不是很高。但是本文号称通过这种手段多找到了370个洞。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-06-05-075247.png)

这张表描述了transform后的测试结果。发现不仅引入了TP还引入了FP，原因在于使用了T2转化方法，即进行了over-approximation。


# 总结

针对现有静态污点分析工具无法啃动的技术难点，如动态特性、OO特性，作者并没有和选择他们硬干。

与以往制造强大的武器打败强大的敌人不同。

作者的思路是我的武器不强，但是我可以让“敌人"也变成弱鸡。

具体就是找到敌人身上比较硬的地方然后将他们转化掉(变羊)。
