- [中文](http://www.google.com "中文")

`A higher order component for loading components with dynamic imports.Support vite and webpack.`

## Install

`yarn add @caixue/react-loadable or npm install @caixue/react-loadable`

## Usage

```javascript
import Loadable from '@caixue/react-loadable';
import Loading from './my-loading-component';

const LoadableComponent = Loadable({
  loader: () => import('./my-component1'),
  loading: Loading,//your personal loading conpontent
  timeout: 20000,//timeout(ms) default 10000
});

//or
const LoadableComponent = Loadable(() => import('./my-component1'));
 
export default class App extends React.Component {
  render() {
    return <LoadableComponent/>;
  }
}

```