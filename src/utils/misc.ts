/**
* Sees If Youre In Dev mode / google chrome etc
* isEnvBrowser() is how you call
*/
export const isEnvBrowser = (): boolean => !(window as any).invokeNative

export const noop = () => {}