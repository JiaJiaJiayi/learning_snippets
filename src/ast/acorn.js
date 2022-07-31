const acorn = require("acorn");
const walk = require("acorn-walk");

const ast = acorn.parse(`
  function test() {
      let x = 10;
      while (a) {
        x++;
        if (b) {
          continue;
        } else {
          bar();
        }
      }
    }
`);

// walk.simple(
//   ast,
//   {
//     ...walk.base,
//     ecmaVersion: 6,
//   },
//   (node, state) => console.log(node.type, state)
// );

// walk.ancestor(acorn.parse("foo('hi')"), {
//   Literal(_, ancestors) {
//     console.log(
//       "This literal's ancestors are:",
//       ancestors.map((n) => n.type)
//     );
//   },
// });

// walk.findNodeAt();

// The walker calls a method for each node type on a “base” before calling
// the method on our visitor object. The default base doesn’t handle
// dynamic import. Here we create a copy of the original base
// using `make()` and put add an empty handler for dynamic imports
// ourselves. Seems to work :shrug:
// const newBase = walk.make({
//   Import(node) {
//     console.log(node);
//     return node;
//   },
// });

// walk.simple(
//   ast,
//   {
//     Literal(node, state) {
//       console.log(`Found a literal: ${node.value}`);
//     },
//     FunctionDeclaration(){
//       const stack
//     },
//     FunctionExpression(){

//     },
//     ArrowFunctionDeclaration(){

//     },

//   },
//   newBase,
//   {
//     stack: [],
//   }
// );

// walk.recursive(
//   acorn.parse(`
//   function fun(){
//     let b = 12;
//   }
// `),
//   { stack: [] },
//   {
//     FunctionDeclaration(node, state, c) {
//       console.log(node.body.body, state, c);
//       c(node.body.body[0], state); // 对是否要进行recursive有所决定。walk哪几个点纯粹取决于自己选择。
//     },
//     VariableDeclaration(node, state, c) {
//       console.log(node, state, c);
//     },
//   }
// );

// 题目1： 如何使用acorn-walk，recursive实现scope, context + vars 记录
// 问题： 1. 怎么退出scope? 使用recursive 可以自主控制是否要进！！
// scope + vars记录可实现，context怎么实现？
class Scope {
  constructor(parent) {
    if (parent) {
      this.parent = parent;
      (parent.children ?? (parent.children = [])).push(this);
    }
  }
}

const fun = `
  const a = 12;
  const b = 22;
  function sum() {
    const d = 22;
    return a + b;
  }
  console.log(sum());
`;

const state = {
  top: null,
  scopeVars: new Map(),
  parent: null,
};
walk.recursive(acorn.parse(fun), state, {
  Program: function (node, state, c) {
    const scope = new Scope();
    state.top = scope;
    node.body.forEach((n) => c(n, { ...state, parent: scope }));
  },

  BlockStatement: function (node, state, c) {
    const { parent } = state;
    const currentScope = new Scope(parent);

    const { body } = node;
    body.forEach((bodyNode) => {
      switch (bodyNode.type) {
        case "VariableDeclaration":
          c(bodyNode, { ...state, parent: currentScope });
        case "FunctionDeclaration":
          c(bodyNode.declarations[0].init, { ...state, parent: currentScope });
      }
    });
  },

  VariableDeclaration: function (node, state) {
    const { parent, scopeVars } = state;
    const variable = node.declarations[0].id;

    const values = scopeVars.get(parent);
    if (values) {
      values.push(variable);
      scopeVars.set(parent, values);
    } else {
      scopeVars.set(parent, [variable]);
    }
  },
});

console.log(state.scopeVars);
