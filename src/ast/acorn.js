const acorn = require('acorn');
const walk = require('acorn-walk');


walk.recursive(
  acorn.parse(
    `
function test() {
    while (a) {
      foo();
      if (b) {
        continue;
      } else {
        bar();
      }
    }
  }
  `,
    { ecmaVersion: 6 }
  ),
  (node, state) => console.log(node.type, state)
);
