`实现 react 动态组件引用，支持vite与webpack`

## 安装

`yarn add @caixue/react-loadable 或者 npm install @caixue/react-loadable`

## 用法

```javascript
import Loadable from '@caixue/react-loadable';
import Loading from './my-loading-component';

const LoadableComponent = Loadable({
  loader: () => import('./my-component1'),
  loading: Loading,//自定义加载过程的展示组件
  timeout: 20000,//超时设置 默认10000
});

//或者使用以下简单方式（将会使用内置默认加载过程组件，如果html的lang属性为zh-CN，默认组件内部为中文描述，否则为英文。）
const LoadableComponent = Loadable(() => import('./my-component1'));
 
export default class App extends React.Component {
  render() {
    return <LoadableComponent/>;
  }
}

```
