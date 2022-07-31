const parserTTML = require("@byted-lynx/parser-ttml");
const { Attribute } = require("@byted-lynx/parser-ttml/dist/cjs/parser/node");

let {
  parse,
  Element,
  ContentElement,
  Text,
  Mustache,
  ClassAttribute,
  StyleAttribute,
  StyleDeclaration,
  ClassName,
  NodeType,
} = parserTTML;

function parseTemplate() {
  const template = `
    <view class="{{ __globalProps.appTheme }}" style="width: 100%; display: flex;">
        <view class="card container" style="display: linear;">


        </view>
    </view>
  `;

  const parsedValue = parse(template);

  return parsedValue;
}

const stringify = (value) => {
  const cache = [];

  return JSON.stringify(
    value,
    (key, value) => {
      if (key === "parent") return;
      if (typeof value === "object" && value !== null) {
        if (cache.includes(value)) return;
        else cache.push(value);
      }

      return value;
    },
    2
  );
};

const result = parseTemplate();
result.root.walk((node) => {
  // if (/styleDeclaration/i.test(node.kind)) {
  //   console.log(node);
  // }
  console.log(NodeType[node.type]);
});

// 题目1：给每个text节点加上_test尾缀
// result.root.walk((node) => {
//   if (node.kind === "Text" && !/\n/.test(node.text)) {
//     node.text = node.text + "_test";
//     return node;
//   }
// });

// 获取修改过后的result, 用toString instead of toOriginalString
// console.log(result.root.toString());

// TODO: 题目2：在给定模板中新增一些view节点
// 方式一：直接walk -> 在某个父节点下新增，不易于扩展
// result.root.walk((node) => {
//   //   console.log(node.class);
//   if (node.text === "container" && node.parent instanceof ClassName) {
//     const targetView = node.parent.parent.parent;
//     const newViewElement = new Element("view");
//     const textElement = new ContentElement("text", "textElement");
//     (newViewElement.children ?? (newViewElement.children = [])).push(
//       textElement
//     );
//     targetView.children.push(newViewElement);

//     targetView.children = targetView.children.filter((c) => {
//       if (!c instanceof Text) {
//         return true;
//       }

//       // 去除值为全空的节点
//       if (!/^\s+$/.test(c.text)) {
//         return true;
//       }

//       return false;
//     });
//   }
// });

// console.log(result.root.toString());

// 方法二：使用模板语法，节点toString之后append到模板中placeholder
// 这种方法可维护更高，一致性更强，不允许对节点做动态插入/删除，
const fn = template`
<view class="{{ __globalProps.appTheme }}" style="width: 100%; display: flex;">
    <view class="card container" style="display: linear;">
        ${"placeholder"}
    </view>
</view>
`;

function template(strings, ...exps) {
  return (map) => {
    const stringGroup = [strings[0]];

    for (let i = 0; i < exps.length; i++) {
      let value;
      if (exps[i] === "placeholder") {
        value = map[exps[i]].toString();
      }

      stringGroup.push(value, strings[i + 1]);
    }

    return stringGroup.join("");
  };
}

function getPlaceHolder() {
  const newViewElement = new Element("view");
  const textElement = new ContentElement("text", "textElement");
  (newViewElement.children ?? (newViewElement.children = [])).push(textElement);
  return newViewElement.toString();
}

const output = fn({
  placeholder: getPlaceHolder(),
});

// console.log(output);

// 题目3：给定预设的component值，创建mustache并生成模板
const component = {
  name: "component1",
  attrs: {
    style: "width: 18px; height: 18px", // TODO: 生成style
    className: "component", // TODO: 生成className
    value: "$data.data_list", // TODO: 除style和class之外，根据是否^\$来判断是否加mustache
    stringValue: "someFunc",
  },
};
const components = [component];

const getPlaceHolder1 = () => {
  const strings = [];
  components.forEach((c) => {
    const { name, attrs } = c;
    const element = new Element(name);
    element.attrs = [];

    let attr;
    Object.keys(attrs).forEach((key) => {
      if (key === "style") {
        attr = new StyleAttribute();
        attr.children = attrs[key].split(";").map((styleStr) => {
          const [styleKey, styleValue] = styleStr.split(":");
          const styleDeclaration = new StyleDeclaration();
          styleDeclaration.property = [new Text(styleKey.replace(/\s+/, ""))];
          styleDeclaration.value = [new Text(styleValue)];
          return styleDeclaration;
        });
      } else if (key === "className") {
        // split
        const classNames = attrs[key].split(/\s+/);
        attr = new ClassAttribute();
        attr.children = classNames.map((className) => {
          const c = new ClassName();
          (c.children ?? (c.children = [])).push(new Text(className));
          return c;
        });
      } else {
        attr = new Attribute(key);
        const value = attrs[key];

        if (/^\$/.test(value)) {
          attr.children = [new Mustache(value.replace(/^\$/, ""))];
        } else {
          attr.children = [new Text(value)];
        }
      }
      attr.isBooleanAttr = false;
      element.attrs.push(attr);
    });

    strings.push(element.toString());
  });

  return strings.join("\n");
};

// const output3 = fn({
//   placeholder: getPlaceHolder1(),
// });

// console.log(output3);

// TODO: 题目4：给ttml做format!
