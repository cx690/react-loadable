- [中文](https://github.com/cx690/react-loadable/blob/main/README_zh_CN.md "中文")

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
});//please save a LoadableComponent at module top level

//or
const LoadableComponent = Loadable(() => import('./my-component1'));
 
export default class App extends React.Component {
  render() {
    return <LoadableComponent/>;
  }
}

```

## for get component ref
- use getRef can get component ref.
```javascript
//app.tsx
import Loadable from '@caixue/react-loadable';
import React, { useEffect, useRef } from 'react';
const MyInput = Loadable(() => import('./myInput'));

const App: React.FC = () => {
    const myInput = useRef() as React.MutableRefObject<React.ElementRef<typeof MyInput>>;
    useEffect(() => {
        myInput.current.getRef().then((input) => {
            input.current.focus();
        })
    })
    return <MyInput ref={myInput} />
}

export default App;

//myInput.tsx
import React, { forwardRef, useRef, useImperativeHandle } from 'react';

const MyInput = forwardRef((props, ref) => {
    const input = useRef<HTMLInputElement | null>();
    useImperativeHandle(ref, () => {
        return input;
    })
    return <input ref={(el) => { input.current = el }} />
})

export default MyInput;

```