import type { NodePath } from '@babel/traverse';
import type { JSXElement, JSXFragment, JSXOpeningElement } from '@babel/types';
import * as pathModule from 'path';

interface BabelPlugin {
  name: string;
  visitor: {
    JSXElement: (path: NodePath<JSXElement>) => void;
    JSXFragment: (path: NodePath<JSXFragment>) => void;
  };
}

function addLocationAttribute(openingElement: JSXOpeningElement, locationString: string) {
  const attrs = openingElement.attributes;
  const hasDataLoc = attrs.some(attr => 
    attr.type === 'JSXAttribute' && 
    attr.name.name === 'data-loc'
  );
  
  if (!hasDataLoc) {
    // 添加data-loc属性
    openingElement.attributes.push({
      type: 'JSXAttribute',
      name: {
        type: 'JSXIdentifier',
        name: 'data-loc'
      },
      value: {
        type: 'StringLiteral',
        value: locationString
      }
    });
  }
}

function getLocationString(path: NodePath<JSXElement | JSXFragment>): string {
  let locationString = '';
  let filePath = '';

  const hubFilename = (path as any).hub?.file?.opts?.filename;
  const contextFilename = (path as any).context?.filename;
  const scopeFilename = (path as any).scope?.path?.hub?.file?.opts?.filename;
  
  // 选择第一个有效的文件名
  const filename = hubFilename || contextFilename || scopeFilename || '';
  
  if (filename) {
    // 获取相对于项目根目录的路径
    const projectRoot = process.cwd();
    filePath = pathModule.relative(projectRoot, filename);
  }
  
  if (path.node.type === 'JSXElement') {
    const element = path.node as JSXElement;
    const openingElement = element.openingElement;
    const closingElement = element.closingElement;
    
    // 获取开始标签的位置信息
    const startLoc = openingElement.loc;
    let startLine = startLoc?.start.line;
    let endLine: number | undefined;
    
    if (openingElement.selfClosing) {
      // 自闭合标签（如 <img />）
      endLine = startLoc?.end.line;
    } else if (closingElement && closingElement.loc) {
      // 有结束标签的元素（如 <div>...</div>）
      endLine = closingElement.loc.end.line;
    } else if (element.loc) {
      // 没有结束标签但有整体位置信息
      endLine = element.loc.end.line;
    }
    
    if (startLine && endLine !== undefined) {
      if (filePath) {
        locationString = `${filePath}:${startLine}`;
      } else {
        locationString = `${startLine}`;
      }
      
      locationString += `-${endLine}`;
    }
  } else if (path.node.type === 'JSXFragment') {
    const fragment = path.node as JSXFragment;
    const loc = fragment.loc;
    
    if (loc && loc.start && loc.end) {
      const startLine = loc.start.line;
      const endLine = loc.end.line;
      
      if (filePath) {
        locationString = `${filePath}:${startLine}`;
      } else {
        locationString = `${startLine}`;
      }
      
      locationString += `-${endLine}`;
    }
  }
  
  // 如果没有位置信息但有文件路径，只显示文件路径
  if (!locationString && filePath) {
    locationString = filePath;
  }
  
  return locationString;
}

export default function(): BabelPlugin {
  return {
    name: 'jsx-dom-loc',
    visitor: {
      JSXElement(path: NodePath<JSXElement>) {
        const locationString = getLocationString(path);
        if (locationString && path.node.openingElement) {
          addLocationAttribute(path.node.openingElement, locationString);
        }
      },
      JSXFragment(path: NodePath<JSXFragment>) {
        // JSX Fragment 没有属性，跳过
      }
    }
  };
};
