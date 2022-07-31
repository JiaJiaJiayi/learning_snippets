import ts, { PropertySignature } from "typescript";
import fs from "fs";
import path from "path";

// 题目：替换文本内值，修改 number => string
const source = `
  const two = 2;
  const four = 4;
`;

// 方案一：使用ts.transpileModule, 在transformer中加上
function numberTransformer() {
  return (context) => {
    const visit = (node) => {
      if (ts.isNumericLiteral(node)) {
        return ts.factory.createStringLiteral(node.text);
      }
      return ts.visitEachChild(node, (child) => visit(child), context);
    };

    return (node) => ts.visitNode(node, visit);
  };
}

let result = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
  transformers: { before: [numberTransformer()] },
});

// console.log(result.outputText);

/*
  var two = "2";
  var four = "4";
*/
// 方案二：使用ts-morph
const tsConfigPath = path.join(process.cwd(), "tsconfig.json");
const filePath = "src/ast/materials/ts-file.ts";
// project.addSourceFileAtPath(filePath);

// const sourceFile = project.getSourceFileOrThrow(filePath);
// const Props = sourceFile.getInterface("Props").getMembers();

// for (let i = 0; i < Props.length; i++) {
//   console.log(Props[i].getNodeProperty());
// }

const sourceFile = ts.createSourceFile(
  filePath,
  fs.readFileSync(filePath).toString(),
  ts.ScriptTarget.ES2015,
  /*setParentNodes */ true
);

const propsStructure = {};

function getPropertySigKind(node: ts.Node) {
  const kind = node.kind;
  console.log(ts.SyntaxKind[kind]);
  switch (kind) {
    case ts.SyntaxKind.StringKeyword:
      return "string";
    case ts.SyntaxKind.UnionType:
      return (node.types || [])
        .map((type) => getPropertySigKind(type))
        .join(" | ");
    case ts.SyntaxKind.ArrayType:
      return `${getPropertySigKind(node.elementType)}[]`;
    case ts.SyntaxKind.TypeReference:
      return `object`;
    case ts.SyntaxKind.LiteralType:
      return getPropertySigKind(node.literal);
    case ts.SyntaxKind.StringLiteral:
      return node.text;
    default:
      return "";
  }
}

export function delint(sourceFile: ts.SourceFile) {
  delintNode(sourceFile);

  // Step1: 找到Props interface

  // Step2: get Kind
  function delintNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertySignature:
        const key = (node as PropertySignature).name.escapedText;
        propsStructure[key] = getPropertySigKind(node.type);
    }

    ts.forEachChild(node, delintNode);
  }
}

delint(sourceFile);
console.log(propsStructure);
