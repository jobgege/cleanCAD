import { RectType, TriangleType, LineType } from "./type";

class Diagram {
  #components
  #ctx
  #centerX
  #centerY
  #componentId
  #pinId

  constructor(ctx) {
    this.#components = [];
    this.#ctx = ctx
    this.#componentId = 1
    this.#pinId = 1
  }

  addComponent(component) {
    this.#components.push(component);
    component.id = this.#componentId
    this.#componentId++
    if(component&&component.pins){
      component.pins.forEach((pin) => {
        pin.id = this.#pinId
        this.#pinId++
      })
    }
  }

  changeSize(newX, newY) {
    this.#centerX = newX
    this.#centerY = newY
  }

  removeComponent(component) {
    if (component&&component.pins) {
      const pinsToUndefined = component.pins.map((pin) => {
        return pin.connectedId
      })
      this.#components.forEach((component) => {
        if (component&&component.pins) {
          component.pins.forEach((pin) => {
            if (pinsToUndefined.includes(pin.id)) {
              pin.connectedId = undefined
            }
          })
        }
      })
    }

    if (this.#components.indexOf(component) !== -1) {
      this.#components.splice(this.#components.indexOf(component), 1)
    }
  }

  getComponent(mouseX, mouseY) {
    for (let i = this.#components.length - 1; i >= 0; i--) {
      const component = this.#components[i];
      if (this.isPointInComponent(mouseX, mouseY, component)) {
        return component;
      }
    }
    return null;
  }

  getPinId(mouseX, mouseY) {
    for (let i = this.#components.length - 1; i >= 0; i--) {
      const component = this.#components[i];
      for (let pin of component.pins) {
        if (this.isPointInPin(mouseX, mouseY, pin, component)) {
          return pin.id;
        }
      }
    }
    return null;
  }

  connectPin(pinid1, pinid2) {
    const pin1 = this.getPinById(pinid1);
    const pin2 = this.getPinById(pinid2);
    if (pin1 && pin2 && pin1.connectedId === undefined && pin2.connectedId === undefined) {
      pin1.connectedId = pinid2;
      pin2.connectedId = pinid1;
      this.#ctx.beginPath()
      this.#ctx.moveTo(pin1.position.x, pin1.position.y)
      this.#ctx.lineTo(pin2.position.x, pin2.position.y)
      this.#ctx.stroke(); // 进行绘制
    }
  }

  // 辅助函数：检查点是否在组件内
  isPointInComponent(mouseX, mouseY, component) {
    const x = mouseX - component.centerX;
    const y = mouseY - component.centerY;
    return Math.pow(x, 2) + Math.pow(y, 2) <= Math.pow(component.width / 2, 2);
  }

  // 辅助函数：检查点是否在引脚上
  isPointInPin(mouseX, mouseY, pin, component) {
    const pinX = mouseX - (component.centerX + pin.to_offsetX);
    const pinY = mouseY - (component.centerY + pin.to_offsetY);
    return Math.pow(pinX, 2) + Math.pow(pinY, 2) <= Math.pow(5, 2); // 假设引脚半径为5
  }

  // 辅助函数：根据id获取引脚
  getPinById(pinId) {
    for (const component of this.#components) {
      for (const pin of component.pins) {
        if (pin.id === pinId) {
          return pin;
        }
      }
    }
    return null;
  }

  render() {
    this.#components.forEach(component => {
      component.draw(this.#ctx);
    });

    this.#components.forEach(component => {
      if(component&&component.pins){
        component.pins.forEach(pin => {
          if (pin.connectedId !== undefined) {
            const connectedPin = this.getPinById(pin.connectedId);
            if (connectedPin) {
              this.#ctx.beginPath();
              this.#ctx.moveTo(pin.position.x, pin.position.y);
              this.#ctx.lineTo(connectedPin.position.x, connectedPin.position.y);
              this.#ctx.stroke();
            }
          }
        });
      }
    });
  }
}


class Line implements LineType {
  from_X: number;
  from_Y: number;
  to_X: number;
  to_Y: number;
  toolTip: {
    offsetX: number;
    offsetY: number;
    content: string;
    show: boolean;
  };
  type: "line" = "line";
  constructor(
    from_X: number, 
    from_Y: number, 
    to_X: number, 
    to_Y: number, 
    toolTip: {
      offsetX: number;
      offsetY: number;
      content: string;
      show: boolean;
    }
  ){
    this.from_X = from_X
    this.from_Y = from_Y
    this.to_X = to_X
    this.to_Y = to_Y
    this.toolTip = toolTip
  }

  preview(mouseX: number, mouseY: number){
    this.to_X = mouseX
    this.to_Y = mouseY
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.from_X,this.from_Y)
    ctx.lineTo(this.to_X,this.to_Y)
    ctx.stroke();

    if (this.toolTip.show && this.toolTip.content) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.toolTip.content, (this.from_X+this.to_X)/2 + this.toolTip.offsetX, (this.from_Y+this.to_Y)/2 + this.toolTip.offsetY);
    }
  }

}

class Rect implements RectType {
  id: number | undefined;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  toolTip: {
    offsetX: number;
    offsetY: number;
    content: string;
    show: boolean;
  };
  pins: Array<{
    id: number | undefined;
    from_offsetX: number;
    from_offsetY: number;
    to_offsetX: number;
    to_offsetY: number;
    connectedId?: number;
    position: {
      x: number;
      y: number;
    }
  }>;
  type: "rect" = "rect";

  constructor(
    centerX: number, centerY: number, width: number, height: number,
    toolTip: { offsetX: number; offsetY: number; content: string; show: boolean; },
    pins: Array<{
      id: number | undefined; from_offsetX: number; from_offsetY: number; to_offsetX: number; to_offsetY: number; connectedId?: number;
    }>
  ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.toolTip = toolTip;
    this.pins = pins.map(pin => {
      const newPin = {
        ...pin,
        position: {
          x: centerX + pin.to_offsetX,
          y: centerY + pin.to_offsetY
        }
      };
      return newPin;
    });
  }

  addPin(from_offsetX, from_offsetY, to_offsetX, to_offsetY) {
    this.pins.push({
      id: undefined,
      from_offsetX,
      from_offsetY,
      to_offsetX,
      to_offsetY,
      connectedId: undefined,
      position: {
        x: to_offsetX,
        y: to_offsetY
      }
    })
  }

  changePos(newX: number, newY: number) {
    this.centerX = newX
    this.centerY = newY
    this.pins.forEach((pin) => {
      pin.position!.x = this.centerX + pin.to_offsetX
      pin.position!.y = this.centerY + pin.to_offsetY
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 绘制矩形
    ctx.rect(this.centerX - this.width / 2, this.centerY - this.height / 2, this.width, this.height);
    ctx.stroke();
    // 绘制引脚
    this.pins.forEach(pin => {
      ctx.beginPath();
      let bitX = 0
      let bitY = 0
      if (pin.to_offsetX - pin.from_offsetX > 0) {
        bitX = -2
      } else if (pin.to_offsetX - pin.from_offsetX < 0) {
        bitX = 2
      } else {
        if (pin.to_offsetY - pin.from_offsetY > 0) {
          bitY = -2
        } else {
          bitY = 2
        }
      }
      ctx.moveTo(this.centerX + pin.from_offsetX, this.centerY + pin.from_offsetY);
      ctx.lineTo(this.centerX + pin.to_offsetX + bitX, this.centerY + pin.to_offsetY + bitY);
      ctx.stroke();
      ctx.beginPath()
      ctx.arc(this.centerX + pin.to_offsetX, this.centerY + pin.to_offsetY, 2, 0, Math.PI * 2)
      ctx.stroke();
    });
    //绘制tooltip
    if (this.toolTip.show && this.toolTip.content) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.toolTip.content, this.centerX + this.toolTip.offsetX, this.centerY + this.toolTip.offsetY);
    }
  }
}


class Triangle implements TriangleType {
  id: number | undefined;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  toolTip: {
    offsetX: number;
    offsetY: number;
    content: string;
    show: boolean;
  };
  pins: Array<{
    id: number | undefined;
    from_offsetX: number;
    from_offsetY: number;
    to_offsetX: number;
    to_offsetY: number;
    connectedId?: number;
    position: {
      x: number;
      y: number;
    }
  }>;
  type: "triangle" = "triangle";

  constructor(centerX: number, centerY: number, width: number, height: number, toolTip: { offsetX: number; offsetY: number; content: string; show: boolean; }, pins: Array<{ id: number | undefined; from_offsetX: number; from_offsetY: number; to_offsetX: number; to_offsetY: number; connectedId?: number; }>) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.toolTip = toolTip;
    this.pins = pins.map(pin => {
      const newPin = {
        ...pin,
        position: {
          x: centerX + pin.to_offsetX,
          y: centerY + pin.to_offsetY
        }
      };
      return newPin;
    });
  }

  addPin(from_offsetX, from_offsetY, to_offsetX, to_offsetY) {
    this.pins.push({
      id: undefined,
      from_offsetX,
      from_offsetY,
      to_offsetX,
      to_offsetY,
      connectedId: undefined,
      position: {
        x: to_offsetX,
        y: to_offsetY
      }
    })
  }

  changePos(newX: number, newY: number) {
    this.centerX = newX
    this.centerY = newY
    this.pins.forEach((pin) => {
      pin.position!.x = this.centerX + pin.to_offsetX
      pin.position!.y = this.centerY + pin.to_offsetY
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 绘制三角形
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY - this.height / 2)
    ctx.lineTo(this.centerX - this.width / 2, this.centerY + this.height / 2)
    ctx.lineTo(this.centerX + this.width / 2, this.centerY + this.height / 2)
    ctx.closePath();
    ctx.stroke();
    // 绘制引脚
    this.pins.forEach(pin => {
      ctx.beginPath();
      let bitX = 0
      let bitY = 0
      if (pin.to_offsetX - pin.from_offsetX > 0) {
        bitX = -2
      } else if (pin.to_offsetX - pin.from_offsetX < 0) {
        bitX = 2
      } else {
        if (pin.to_offsetY - pin.from_offsetY > 0) {
          bitY = -2
        } else {
          bitY = 2
        }
      }
      ctx.moveTo(this.centerX + pin.from_offsetX, this.centerY + pin.from_offsetY);
      ctx.lineTo(this.centerX + pin.to_offsetX + bitX, this.centerY + pin.to_offsetY + bitY);
      ctx.stroke();
      ctx.beginPath()
      ctx.arc(this.centerX + pin.to_offsetX, this.centerY + pin.to_offsetY, 2, 0, Math.PI * 2)
      ctx.stroke();
    });
    //绘制tooltip
    if (this.toolTip.show && this.toolTip.content) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.toolTip.content, this.centerX + this.toolTip.offsetX, this.centerY + this.toolTip.offsetY);
    }
  }
}

export {
  Diagram,
  Rect,
  Triangle,
  Line
};