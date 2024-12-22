interface ComponentType{
    type:"Component";
    id:number|undefined;
    centerX:number;
    centerY:number;
    toolTip: {
        offsetX: number;
        offsetY: number;
        content: string;
        show: boolean;
    };
    pins:Array<{
        id: number|undefined;
        from_offsetX: number;
        from_offsetY: number;
        to_offsetX: number;
        to_offsetY: number;
        connectedId: number | undefined; // 使用 connectedId 来表示连接的引脚ID，如果没有连接则为undefined
    }>;
    symbols:Array<BasicSymbol>;
    draw:Function
}


interface BasicSymbol{
    centerX:number;
    centerY:number;
    draw:Function;
}

interface RectType extends BasicSymbol{
    type: "Rect";
    width: number;
    height: number;
}

interface LineType extends BasicSymbol{
    type: "Line";
    from_X: number;
    from_Y: number;
    to_X: number;
    to_Y: number
}

interface TriangleType extends BasicSymbol{
    type: "Triangle";
    width: number;
    height: number;
}


interface TextType extends BasicSymbol{
    type: "Text";
    offsetX: number;
    offsetY: number;
    show:boolean;
    content:string;
}


export type {
    RectType,
    TriangleType,
    LineType,
    ComponentType,
    TextType
}