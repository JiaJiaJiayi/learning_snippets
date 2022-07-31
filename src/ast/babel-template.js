const template = require("@babel/template").default;
const generate = require("@babel/generator").default;

const t = require("@babel/types");

const source = "my-module";

// 往一段代码里加一段代码的方法
// 1. 使用@babel/template中template函数，往里面加node(ast node)，然后generate(ast)可以 -> 适用于预先知道模板
// 2. 使用acorn-walker/babel-traverse，traverse到某个节点时往前或者往后加node -> 适用于非预先知道，但知道前节点或后节点
// 3. 直接在模板语法内使用`${statement}`来填充，但是这样不会有生成ast的过程，所以不一定valid -> 预先知道模板，且比较简单
// Q:
//    1. webpack 有一个define plugin, 其中做的事情和这些有些一致？
//       - JSPARSER -> walker -> 监听expression/evaluate等语法特征，并阻塞换值
//       - // TO_LEARN: runtime是干啥的？
//    2. 方法1和方法2debug
const fn = template`
  var IMPORT_NAME = require('${source}');
`;

const ast = template.statements("foo;foo;")();

// const ast = fn({
//   IMPORT_NAME: t.identifier("myModule"),
// });

ast.forEach((statement) => console.log(generate(statement).code));
