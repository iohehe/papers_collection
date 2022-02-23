![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-01-15-093053.png)

# 0x01 背景&动机

本文通过黑盒+ML的方法来探测CSRF这种漏洞。
CSRF是WEB应用中的一个常见的漏洞。这种洞的主要危害是攻击者可以伪造任意表单来欺骗受害者提交。 自动化检测这个洞有两个难点: 
1. 如何自动化的识别出敏感的表单提交（敏感请求）
2. 识别验证是否充分(我猜的)
对于之前的工作，Deemon是第一个解决CSRF的工作，使用了白盒技术，因此喷了他只适用于PHP应用的检测。
其他的黑盒工具多是启发式去找敏感请求的，存在大量的误报，因此大家通常还使用Burp之类的代理去找。
因此本文提出了一个基于机器学习的黑盒CSRF探测工具:Mithch

> 本文贡献：
1. 构建了一个包含5,828个HTTP request,并标记了939个敏感请求，公开了一个ground truth。
2. 基于这个数据集，分析了敏感与不敏感请求之间的差异，做了一个特征工程分析，构建了一个classifiers。
3. 使用classifer构建了Mitch，一个黑盒CSRF漏洞自动检测工具。
4. 在20个网站中发现了35个CSRF，从Deemon的中发现了

# 0x02 设计&挑战
##  CSRF攻击描述(Attack Description)
    1. Alice登陆不安全网站A，并该通过身份验证。
    2. Alice使用当前浏览器访问了攻击者伪造的网站B，"不小心"触发了一个攻击者设计的跨站请求(即B网站嵌入了一个A网站的请求表单)。
    3. Alice虽然是从B站(不是那个B站)的页面发送给A站的服务器，但是A站只知道这个请求是Alice的浏览器发来的啊(Session)。 这样，只要攻击者在B站伪造A站的任何表单请求都可以让A点。相当于攻击者通过B站操纵了Alice在A站的账户。

## 如何防护(Current Fixes and Mitigations)
    1. 通过Referer头或Origin头检查请求来源(可伪造)
    2. 功过检查是否包含X-Requested-With，来检测同源请求。
    3. 表单内加token(最常用)

## 数据集构造
收集一个请求数据集，表明哪些是敏感请求，哪些是不敏感请求。首先定义一下敏感请求：
<!--  -->
__敏感请求:__ 1. 会导致处理它的web程序与安全相关的状态改变。(如修改账户密码) 2. 一定是在已注册用户登录后的上下文中处理该表单(即用户的私有区域，如你的个人页面)。

> 挑战： 只有在识别敏感请求后才能制造csrf攻击表单，而识别敏感请求的难点在于既要理解web程序的语义信息，又要观察服务器的变化

针对这一挑战，构造数据集，进行敏感请求识别。
1. 收集请求：
    此步骤获取数据， 由于没有现成的数据集，需要自己生成，因此收集目标数据--请求。使用插件存储每一个同源站点的请求，包括： method，URL, 参数。插件区分GET,POST方法， POST需要处理body数据，通过*Content-Type*获取数据类型。
    POST:

    ```json
                {
                "comment": "registration", 
                "flag": "y", 
                "req": {
                    "method": "POST", 
                    "params": {
                        "app": [
                            "web"
                        ], 
                        "csrftoken": [
                            ""
                        ], 
                        "email": [
                            "<email>"
                        ], 
                        "fullname": [
                            "<username>"
                        ], 
                        "g-recaptcha-response": [
                            "03AO6mBfzWW1Z0QcsflroTZvgsk4eGznWsho90N30txgCrF6N0ehHlOg3BCn6kugmVALBHu9-y9jdBjCTOtgDfYM3j17_X83dKUdBFuLM2DR_Xu5quBFifxc2xzKrND7eBXd5XLW6bEj_gIRJU5KWJDDg6eG5rCCQRe0KA1fpbHF8nquipMky1XbqcXWSxmX28c3dmah50T5VQkM-mbAoSYgmHmISV4PgHmA_2LwkvCnf5BKfA5hOTgVtT3nqlG8H79GegdlPzQbiAWUl-hyN6iZHpz9mBYsSLL6_fuZQo7pyFd1iGxJ_IbLsuoi5srpN7xMpm8-jaaS-m"
                        ], 
                        "next": [
                            "", 
                            "https://9gag.com/"
                        ], 
                        "password": [
                            "<password>"
                        ], 
                        "ref": [
                            ""
                        ], 
                        "src": [
                            ""
                        ], 
                        "tzo": [
                            "1"
                        ]
                    }, 
                    "reqId": "36205", 
                    "url": "https://9gag.com/member/email-signup"
                }
    ```

    GET:

```json
        {
            "comment": "", 
            "flag": "n", 
            "req": {
                "method": "GET", 
                "params": {
                    "includeReadState": [
                        "1"
                    ]
                }, 
                "reqId": "36250", 
                "url": "https://9gag.com/notifications"
            }
        }
```

2. 数据标注：将一个网站$w$中的所有请求先设置为insensitive, 手工对进行web application语义的理解进行敏感标注(如上传图片的请求， liking content的请求)。 

本文数据量6，312个达标的请求，洗掉了除了GET与POST的所有请求。洗掉7.7%留下了5,828个请求，其中敏感请求939个。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-18-122339.png)

## 特征工程
有了dataset之后我们需要进行特征工程，根据需求不同，选择模型不同，我们需要找出合适的刻画我们需要解决问题的特征集合。
解决这个问题，通常需要我们的领域知识。 

本工作的特征空间$x$由49个维度构成，分为三个大类: *Structural*, *Textual*, *Functional*.

1. Structural: 结构维度的特征
    - numOfParams: 参数总个数个数
    - numOfBools: 绑定bool的参数
    - numOfIds: 绑定identifier的参数
    - numOfBlobs: 绑定blob的参数
    - reqLen: 请求中characters总数，包括parameter names和values.

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-18-124643.png)

2. Texual: 文本维度的特征, 这个比较多，依赖于经验化的关键字。主要两部分
   - wordInPath, where word $\in$ V, 表明这个关键字在请求路径中
   - wordInParams, where word $\in$ V, 表明这个关键字在参数名中

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-18-125040.png)

3. Functional: This category of features indicates the HTTP method associated to the request. We consider just the following two binary features:
- isGET: the HTTP request method is GET
- isPOST: the HTTP request method is POST

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-18-130129.png)

可以看到大部分是GET
## Data Exploration
现在有了数据集，也提好了特征，在训练机器学习模型之前，先行以下数据集分析，来看看我们数据集的准确性。
1. 结构验证(Structural), 对于这个维度的特征，使用numOfParams(参数个数)与reqLen(请求字符数)这个特征进行分布验证。我们来看两个箱图：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-02-19-032346.png)
