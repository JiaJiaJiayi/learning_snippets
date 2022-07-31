const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babelGenerator = require("@babel/generator").default;
const fs = require("fs");
const t = require("@babel/types");

// Step1: 读取文件，并且生成AST tree
const DEMO_PATH = "./src/ast/acorn.js";
// TO_LEARN: 指定encoding时返回stream encoding后的结果，反之返回buffer
const code = fs.readFileSync(DEMO_PATH, { encoding: "utf-8" });

const ast = babelParser.parse(code, {
  sourceType: "module",
});

// Step2: 可以使用traverse对节点做一定的改造
//   1. append Node
//   2. 改造某些语句，比如修改变量名
// 场景：
//   1. 结合打包工具，例如webpack：对某些js文件做操作
//   2. es-lint/prettier、这种工具都使用了ast traverse -> visiter 去判断是否到了某一个节点
//   3. DefinePlugin, uglify to minimize js/other type of code.
traverse(ast, {
  enter(nodePath) {
    if (nodePath.type === "Program") {
      nodePath.addComment("leading", "try comment"); // 在Program下的children节点append新的节点，并且是在child_list中的leading or trailing
    }
    if (nodePath.isIdentifier({ name: "acorn" })) {
      nodePath.node.name = "anotherAcorn";
    }
  },
  Program(nodePath) {
    // Insert at the beginning a string "Hello World" --> not valid JS code
    nodePath.unshiftContainer("body", {
      type: "BlockComment",
      value: "some comment content",
    });
  },
});

// Step3: 根据AST生成code后写回
const output = babelGenerator(ast, { comments: true });
console.log(output.code);

// const promise = fs.promises.writeFile("./src/ast/acorn.js", output.code, {
//   encoding: "utf-8",
// });

// promise.then((r) => {
//   console.log(r);
// });
