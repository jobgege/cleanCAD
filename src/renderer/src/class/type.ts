interface RectType {
    id: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    tooltip: {
        offsetX: number;
        offsetY: number;
        content: string;
        show: boolean;
    };
    pins: Array<{
        id: number;
        from_offsetX: number;
        from_offsetY: number;
        to_offsetX: number;
        to_offsetY: number;
        connectedId?: number; // 使用 connectedId 来表示连接的引脚ID，如果没有连接则为undefined
    }>;
    type: "rect";
    draw: Function
}

interface TriangleType {
    id: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    tooltip: {
        offsetX: number;
        offsetY: number;
        content: string;
        show: boolean;
    };
    pins: Array<{
        id: number;
        from_offsetX: number;
        from_offsetY: number;
        to_offsetX: number;
        to_offsetY: number;
        connectedId?: number; // 使用 connectedId 来表示连接的引脚ID，如果没有连接则为undefined
    }>;
    type: "triangle";
    draw: Function
}


export type {
    RectType,
    TriangleType
}