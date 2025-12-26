import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 定义全局状态的类型
export interface GlobalState {
    user: {
        token: string;
        username: string;
        role: string;
    } | null;
    theme: 'dark' | 'light';
    settings: Record<string, any>;
}

// 初始状态
const initialState: GlobalState = {
    user: null,
    theme: 'light',
    settings: {},
};

class GlobalStateManager {
    private actions: MicroAppStateActions | null = null;
    private state: GlobalState = initialState;

    // 初始化全局状态
    public init(state: GlobalState = initialState) {
        this.state = state;
        this.actions = initGlobalState(state);

        // 监听状态变更
        this.actions.onGlobalStateChange((newState, prev) => {
            console.log('[GlobalState] State changed:', newState);
            this.state = newState as GlobalState;
        });
    }

    // 获取当前状态
    public getState(): GlobalState {
        return this.state;
    }

    // 设置状态
    public setGlobalState(newState: Partial<GlobalState>) {
        if (this.actions) {
            this.actions.setGlobalState(newState);
        } else {
            console.warn('[GlobalState] Actions not initialized');
        }
    }

    // 获取 Actions 对象 (用于传递给子应用)
    public getActions() {
        return this.actions;
    }
}

export const globalStateManager = new GlobalStateManager();
