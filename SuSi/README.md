   这片文章发表在14年的NDSS， 引用率很高， 主要是用了SVM（支持向量机）来在Android中区分sink点和source点。
文章主要是针对Android引入的一些API进行Sink， source分类， 测试目标主要是敏感信息类的漏洞。
文章使用SVM进行分类为了两部分，首先是划分为Sources.Sinks和Neither的问题。第二部分比较有意思， 对Source,Sink有进行了进一步的分类(category),如将source来源分类为Account(用户)， Bluetooth(蓝牙)，Browser(浏览器)， Calendar(日历),contact（），database(数据库)， File(文件)， Network(网络) ，NFC, Setting(设置)， SYNC, unique_identifer, no_category.
![Jietu20201028-083211](https://user-images.githubusercontent.com/3693435/97376358-22d0d700-18f8-11eb-8e9a-908b46f4edc7.jpg)
![Jietu20201028-083229](https://user-images.githubusercontent.com/3693435/97376362-25cbc780-18f8-11eb-8b47-1af3884292df.jpg)
