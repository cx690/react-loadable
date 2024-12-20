import React from 'react';

const forwardRefSymbol = React.forwardRef(() => null).$$typeof;
interface LoadingProps {
    isError?: boolean;
    isTimedOut?: boolean;
    isLoading?: boolean;
    retry?: () => any | void;
}

const style: React.CSSProperties = {
    color: '#fff',
    background: '#499af2',
    borderColor: '#499af2',
    cursor: 'pointer',
    lineHeight: '34px',
    padding: '0 10px',
    boxSizing: 'border-box',
    borderRadius: '3px'
}

const lang = window.document.getElementsByTagName('html')[0]?.getAttribute('lang');

const Loading: React.FC<LoadingProps> = (props) => {
    const isZh_CN = lang === 'zh-CN';
    if (props.isError) {
        return <div>{isZh_CN ? '加载错误!' : 'Load error!'} <button style={style} onClick={props.retry}>{isZh_CN ? '重试' : 'Retry'}</button></div>;
    } else if (props.isTimedOut) {
        return <div>{isZh_CN ? '响应时间过长...' : 'Take a long time...'} <button style={style} onClick={props.retry}>{isZh_CN ? '重试' : 'Retry'}</button></div>;
    } else if (props.isLoading) {
        return <div>{isZh_CN ? '正在加载文件...' : 'Loading file...'}</div>;
    } else {
        return null;
    }
}

type asyncCom<T = any> = Promise<{ default: React.FC<T> | React.ComponentClass<T> | React.PureComponent<T> | ((props: T, ...args: any[]) => any) }>;

interface IpProps<T = any> {
    loader: () => asyncCom<T>;
    /** The lazy load time(ms); 延迟加载时间 单位毫秒 */
    delay?: number;
    /** timeout(ms); 超时设置 单位毫秒 */
    timeout?: number;
    /** loading compontent;加载过程组件 */
    loading?: React.FC<LoadingProps> | React.ComponentClass<LoadingProps>;
}

const ALL_INITIALIZERS: (() => asyncCom)[] = [];
const READY_INITIALIZERS: Promise<{ default: React.FC | React.ComponentClass }>[] = [];
declare class AsyncCom<T> extends React.Component<T> {
    constructor(props: T);
    getRef(): Promise<any>;
}
// T is loader component's propsType
export default function Loadable<T = any>(option: IpProps<T> | (() => asyncCom<T>)) {
    let importComponent: () => asyncCom,
        delay: number | undefined,
        loading: React.FC<LoadingProps> | React.ComponentClass<LoadingProps> = Loading,
        timeout: number = 10000;
    if (typeof option === 'function') {
        importComponent = option;
    } else {
        importComponent = option.loader;
        delay = option.delay;
        loading = option.loading || Loading;
        timeout = option.timeout ?? timeout;
    }
    return class AsyncCom extends React.Component<T> {
        state: {
            isLoading: boolean;
            isError: boolean;
            isTimedOut: boolean;
            Component?: React.ElementType;
        };

        /** private property  */
        #refPromise: Promise<any>;
        /** private property  */
        #resolveRef: (value: any) => void;
        constructor(props: any) {
            super(props);
            this.state = {
                isLoading: false,
                isError: false,
                isTimedOut: false,
            }
            this.getComponent = this.getComponent.bind(this);
            this.handleRes = this.handleRes.bind(this);
            this.#refPromise = new Promise(resolve => {
                this.#resolveRef = resolve;
            });
        }
        private async getComponent() {
            const index = ALL_INITIALIZERS.indexOf(importComponent);
            this.setState({
                isLoading: true,
            });
            if (delay) {
                await new Promise(r => {
                    setTimeout(r, delay);
                })
            }
            const p = Promise.race<any>([importComponent().catch(e => {
                process.env.NODE_ENV === 'development' && console.error(e);
                return { isError: true };
            }), new Promise(r => {
                setTimeout(() => {
                    r({ isTimedOut: true })
                }, timeout);
            })])

            if (index === -1) {
                ALL_INITIALIZERS.push(importComponent);
                READY_INITIALIZERS.push(p);
            } else {
                READY_INITIALIZERS[index] = p;
            }
            const res = await p;
            this.handleRes(res);
        }

        async componentDidMount() {
            const index = ALL_INITIALIZERS.indexOf(importComponent);
            if (index !== -1) {
                const res = await READY_INITIALIZERS[index];
                this.handleRes(res);
            } else {
                if (this.state.Component) return;
                this.getComponent();
            }
        }

        componentWillUnmount() {
            this.setState = () => false;
        }

        private handleRes(res: any) {
            const { isTimedOut, isError, default: Component } = res;
            if (isTimedOut) {
                this.setState({
                    isTimedOut: true,
                    isLoading: false,
                    isError: false,
                });
            } else if (isError) {
                this.setState({
                    isError: true,
                    isTimedOut: false,
                    isLoading: false,
                });
            } else {
                this.setState({
                    // component: <Component {...this.props} />,
                    Component,
                    isLoading: false,
                    isError: false,
                    isTimedOut: false,
                });
            }
        }

        /** get resolve component ref  */
        public async getRef() {
            return this.#refPromise;
        }

        render() {
            const Loading = loading;
            const { isError, isLoading, isTimedOut, Component } = this.state;

            return Component
                //@ts-ignore
                ? ((Component.$$typeof === forwardRefSymbol || React.Component.isPrototypeOf(Component)) ?
                    <Component {...this.props} ref={(ref: any) => this.#resolveRef(ref)} />
                    : <Component {...this.props} />
                )
                : <Loading isError={isError} isLoading={isLoading} isTimedOut={isTimedOut} retry={this.getComponent} />
        }
    } as unknown as typeof AsyncCom<T>
}
