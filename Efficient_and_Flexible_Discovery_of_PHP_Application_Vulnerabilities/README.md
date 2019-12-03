# EuroS&P 2017-Efficient_and_Flexible_Discovery_of_PHP_Application_VUlnerabilities

不知不觉， 一个趁手的控制流和数据依赖分析工具成了我的刚需。 但是在PHP这种动态语言上，我没有找到一个比较趁手的工具，看了fabs的cpg(属性图)那篇文章，我是比较看好的joern的。这篇文章就是在joern的基础上去做了php的cpg。 但是他这个版本问题比较多，新版的joern已经不支持了， 貌似还不能用gremlin跑。 于是又把论文再看上一遍。

## 1
本文解决的问题是web Application 安全问题（PHP语言的一般都这么干）。本文主要贡献在于把fabs博士的属性图引入到了php语言当中。（作者把属性图描述成： a canonical representation of code incorporating a program's syntax, control flow, and data dependencies in a single graph structure）。
但是对于PHP这种`high-level`,`dynamic scripting language`如何去使用，其实还是面临着许多问题。本文就尝试着生成php的属性图，然后在上面匹配常见web漏洞模式。从Github上爬了1854个项目，从中分析出78个SQLi,6个命令执行，105个代码执行，6个文件遍历，然后生成了一堆xss报告，从中发现了26个（2%)(xss这种洞跨语言，太灵活可能误报率比较高）。

## 2 
本文先介绍了AST, CFG和PDG, 还介绍了`Call Graph`, 貌似还可以interprocedural analysis。
这个工具如何使用呢？
https://github.com/malteskoruppa/phpjoern，
这个程序会默认跑出两个csv文件， 一个nodes（点）一个rels(变)。然后把这两个文件扔给joern(https://github.com/octopus-platform/joern) 生成cpg_edges.csv。在把它导入到neo4j当中就是一张属性图了。

看它项目中的入口文件`Parser.php`：
1. 解析参数， 拿到目标文件，与结果到处目录
2. 默认是调用Exporter.php，生成一个对象
3. 调用php-ast生成ast(https://github.com/nikic/php-ast)

## 3
代码：
`Parser.php`
```php
$path = null; // file/folder to be parsed
$format = Exporter::JEXP_FORMAT; // format to use for export (default: jexp)
$nodefile = CSVExporter::NODE_FILE; // name of node file when using CSV format (default: nodes.csv)
$relfile = CSVExporter::REL_FILE; // name of relationship file when using CSV format (default: rels.csv)
$outfile = GraphMLExporter::GRAPHML_FILE; // name of output file when using GraphML format (default: graph.xml)
$scriptname = null; // this script's name
$startcount = 0; // the start count for numbering nodes

```
这是一堆设置， `$format`定义了三种模式， 默认叫`jexp`是这个项目定义的一种neo4j导入格式(https://github.com/jexp/neo4j-shell-tools) 现在好像没什么用处了。
一波扔进
```php
      $exporter = new CSVExporter( $format, $nodefile, $relfile, $startcount;
```
ha?
```php
  /**
   * Constructor, creates file handlers.
   *
   * @param $format     Format to use for export (neo4j or jexp)
   * @param $nodefile   Name of the nodes file
   * @param $relfile    Name of the relationships file
   * @param $startcount *Once* when creating the CSVExporter instance,
   *                    the starting node index may be chosen. Defaults to 0.
   */
  public function __construct( $format = self::NEO4J_FORMAT, $nodefile = self::NODE_FILE, $relfile = self::REL_FILE, $startcount = 0) {

    $this->format = $format;
    $this->nodecount = $startcount;

    foreach( [$nodefile, $relfile] as $file)
      if( file_exists( $file))
        error_log( "[WARNING] $file already exists, overwriting it.");

    if( false === ($this->nhandle = fopen( $nodefile, "w")))
      throw new IOError( "There was an error opening $nodefile for writing.");
    if( false === ($this->rhandle = fopen( $relfile, "w")))
      throw new IOError( "There was an error opening $relfile for writing.");

    // if format is non-default, adapt delimiters and headers
    if( $this->format === self::JEXP_FORMAT) {
      $this->csv_delim = "\t";
      $this->array_delim = ",";

      fwrite( $this->nhandle, "id:int{$this->csv_delim}labels:label{$this->csv_delim}type{$this->csv_delim}flags:string_array{$this->csv_delim}lineno:int{$this->csv_delim}code{$this->csv_delim}childnum:int{$this->csv_delim}funcid:int{$this->csv_delim}classname{$this->csv_delim}namespace{$this->csv_delim}endlineno:int{$this->csv_delim}name{$this->csv_delim}doccomment\n");
      fwrite( $this->rhandle, "start{$this->csv_delim}end{$this->csv_delim}type\n");
    }
    else {
      fwrite( $this->nhandle, "id:ID{$this->csv_delim}:LABEL{$this->csv_delim}type{$this->csv_delim}flags:string[]{$this->csv_delim}lineno:int{$this->csv_delim}code{$this->csv_delim}childnum:int{$this->csv_delim}funcid:int{$this->csv_delim}classname{$this->csv_delim}namespace{$this->csv_delim}endlineno:int{$this->csv_delim}name{$this->csv_delim}doccomment\n");
      fwrite( $this->rhandle, ":START_ID{$this->csv_delim}:END_ID{$this->csv_delim}:TYPE\n");
    }
  }
```

这里初始化了nodes.csv和rel.csv文件，并根据选定格式生成表头。然后，将其带入到ast生成中，这已经比较明显了， 这就是在生成php代码的ast然后打成边和点，其他内容由joern去生成。

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-03-%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-12-03%20%E4%B8%8B%E5%8D%885.27.32.png)

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-03-%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-12-03%20%E4%B8%8B%E5%8D%885.27.26.png)

php代码部分生成的功能。 parser部分，不细究。
```php
/**
 * Parses and generates an AST for a single file.
 *
 * @param $path     Path to the file
 * @param $exporter An Exporter instance to use for exporting
 *                  the AST of the parsed file.
 *
 * @return The node index of the exported file node, or -1 if there
 *         was an error.
 */
function parse_file( $path, $exporter) : int {

  $finfo = new SplFileInfo( $path);
  echo "Parsing file ", $finfo->getPathname(), PHP_EOL;

  try {
    $ast = ast\parse_file( $path, $version = 30);

    // The above may throw a ParseError. We only export to the output
    // file(s) if that didn't happen.
    $fnode = $exporter->store_filenode( $finfo->getFilename());
    $tnode = $exporter->store_toplevelnode( Exporter::TOPLEVEL_FILE, $path, 1, count(file($path)));
    $astroot = $exporter->export( $ast, $tnode);
    $exporter->store_rel( $tnode, $astroot, "PARENT_OF");
    $exporter->store_rel( $fnode, $tnode, "FILE_OF");
    //echo ast_dump( $ast), PHP_EOL;
  }
  catch( ParseError $e) {
    $fnode = -1;
    error_log( "[ERROR] In $path: ".$e->getMessage());
  }

  return $fnode;
}
```
