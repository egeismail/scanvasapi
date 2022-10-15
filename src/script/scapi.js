/**
*@author Septillioner
@typedef {import("./jquery")} JQuery
@typedef {import("./vector")} Vector
@typedef {import("./scapi.entity")}
**/

/**
*@callback SCMouseEventBase
*@param {JQuery.MouseEventBase} e
*@returns {void}

*@callback SCMouseDownEvent
*@param {JQuery.MouseDownEvent} e
*@returns {void}

*@callback SCMouseUpEvent
*@param {JQuery.MouseUpEvent} e
*@returns {void}

*@callback SCMouseMoveEvent
*@param {JQuery.MouseMoveEvent} e
*@returns {void}

*@callback SCMouseWheelEvent
*@param {WheelEvent} e
*@returns {void}
/**

*/
/** @typedef {{mousemove:?SCMouseMoveEvent,mousedown:?SCMouseDownEvent,mouseup:?SCMouseDownEvent,wheel:?SCMouseWheelEvent}} SCEventSet*/

class SCAPI{
    /**@typedef {{target:Element,width:number,height:number,debug:boolean}} SCAPIOptions */
    /**
     * 
     * @param {SCAPIOptions} param0 
     */
    constructor( { target,width,height,debug=true} = options){
        /**@type {JQuery} */
        this.target = $(target)
        if(this.target.length === 0) throw Error("[SCAPI]Target not found");
        /**@type {CanvasRenderingContext2D} */
        this.context = this.target[0].getContext('2d')
        this.target.css("width",`${width}px`)
        this.target.css("height",`${height}px`)
        this.target[0].width = width
        this.target[0].height = height
        this.width = width
        this.height = height
        this.debug = debug
        this.target.addClass("scapi-canvas")
        this._origin = new Vector()
        this._zoom = 1
        this.frametime = 0
        this.FPS = 0
        /**@type {SCEntity[]}*/
        this.entityList = []
        this.entityIdCounter = 0
        /**@type {Function[]} */ this.debugTexts = []
        this.debugTexts.push(()=>`Frametime : ${this.frametime} ms`)
        this.debugTexts.push(()=>`FPS : ${this.FPS}`)
        this.initialize()
    }
    initialize(){

        this.attachEvents()
        this.utils.fitOrigin()
    }
    get zoom(){
        return this._zoom
    }
    set zoom(val){
        this._zoom = val
        this._draw.draw()
    }
    get origin(){
        return this._origin
    }
    /**@param {Vector} */   
    set origin(val){
        this._origin[0] = val.x 
        this._origin[1] = val.y
        this._draw.draw()
    }
    /**
     * 
     * @param {SCEntity} ent 
     */
    registerEntity(ent){
        ent.id = ent.parent.entityIdCounter++;
        ent._pos[2] = ent.id
        ent.pos = ent._pos
        this.entityList.push(ent)
        this.events.updateWatchList()
        this._draw.draw()
    }
    utils = {
        fitOrigin:()=>{
            this.origin = new Vector(
                this.width/2,
                this.height/2
            )
        },
        /**
         * @param {Vector} pos 
         */
        setOriginByPos:(pos)=>{
            let offset = this.utils.getAbsoluteOffsetByPos(pos)
            this.origin = new Vector(
                this.width/2+offset.x,
                this.height/2+offset.y
            )
        },
        setOriginByOffset:(offsetX,offsetY)=>{
            this.origin = new Vector(
                offsetX,
                offsetY
            )
        },
        /**@returns {Vector} */
        clientToView: (offsetX,offsetY)=>{
            return new Vector(
                -(this.origin.x-offsetX)/this.zoom,
                (this.origin.y-offsetY)/this.zoom
            )
        },
        /**@param {Vector} pos */
        viewToClient: (pos)=>{
            return {
                x:this.width-(this.origin.x-pos.x*this.zoom),
                y:this.origin.y-pos.y*this.zoom
            }
        },
        /**@param {Vector} pos */
        getAbsoluteOffsetByPos: (pos)=>{
            return {
                x:pos.x*this.zoom,
                y:pos.y*this.zoom
            }
        }
    }
    _draw = {
        makeGrid:()=>{
            let sGrid = (size=10,opacity="0.4",invert=false)=>{
                let distance = (size)*this.zoom
                // console.log("dst",distance)
                this.context.lineWidth = 1
                this.context.strokeStyle = `rgba(${invert ? "0,0,0":"255,255,255"},${opacity})`
                //Verticals
                for(let i = 0; i < this.width+distance; i += distance) {
                    this.context.beginPath();
                    this.context.moveTo(i+this._origin.x%distance , 0);
                    this.context.lineTo(i+this._origin.x%distance, this.height);
                    this.context.closePath();
                    this.context.stroke();
                  }
                //Horizontals
                for (let j = 0; j <= this.height+distance; j += distance ) {
                    this.context.beginPath();
                    this.context.moveTo(0, j+this._origin.y%distance ); 
                    this.context.lineTo(this.width, j +this._origin.y%distance);
                    this.context.closePath();
                    this.context.stroke();
                }
            }
            sGrid(10,"0.05")
            sGrid(100,"0.1")
        },
        drawOrigin:()=>{
            let xSize = 18, ySize=18,strokeSize = 2
            this.context.strokeStyle = "#aaaaaaff";
            this.context.lineWidth = strokeSize
            this.context.beginPath();
            this.context.moveTo(this._origin.x-xSize/2, this._origin.y); 
            this.context.lineTo(this._origin.x+xSize/2,this._origin.y);
            this.context.closePath();
            this.context.stroke();
            this.context.beginPath();
            this.context.moveTo( this._origin.x,this._origin.y-ySize/2); 
            this.context.lineTo(this._origin.x,this._origin.y+ySize/2);
            this.context.closePath();
            this.context.stroke();
        },
        drawDebugTexts:()=>{
            let size = 15,spaceBetween=3,marginX=5,marginY=5
            this.context.font=`${size}px Arial`;
            this.context.fillStyle = "#0f0"
            this.debugTexts.map((dText,i)=>this.context.fillText(
                dText(),
                marginX,
                (
                    marginY+
                    (i+1)*(size+spaceBetween)
                )
            ))
        },
        drawEntities:()=>{
            for (let index = 0; index < this.entityList.length; index++) {
                const entity = this.entityList[index];
                entity.draw()
            }
        },
        draw:()=>{
            let stime = performance.now()
            this.context.fillStyle = "#000"
            this.context.fillRect(0,0,this.width,this.height)
            this._draw.makeGrid()
            this._draw.drawOrigin()
            this._draw.drawEntities()
            this._draw.drawDebugTexts()
            let etime = performance.now()
            let elapsed = etime-stime
            this.frametime = elapsed.toFixed(2)
            this.FPS = ((1/(elapsed/1000))).toFixed(1)
        }
    }
    /**
     *@namespace
     */
    events = {
        /**@property {SCEventSet[]}*/mouseEvents:[],
        /**@property {SCEventSet}*/defaultEventSet:{
            mousemove:null,
            mousedown:null,
            mouseup:null,
            wheel:null
        },
        /**@property {JQuery.TypeEventHandler[]}*/ __mouseMove:e=>this.events.mouseEvents.forEach(_e=>_e.mousemove !== null && _e.mousemove(e)),
        /**@property {JQuery.TypeEventHandler[]}*/ __mouseDown:e=>this.events.mouseEvents.forEach(_e=>_e.mousedown !== null && _e.mousedown(e)),
        /**@property {JQuery.TypeEventHandler[]}*/ __mouseUp:e=>this.events.mouseEvents.forEach(_e=>_e.mouseup !== null && _e.mouseup(e)),
        /**@property {JQuery.TypeEventHandler[]}*/ __wheel:e=>this.events.mouseEvents.forEach(_e=>_e.wheel !== null && _e.wheel(e)),
        /**@property {Array<SCEntity>}*/___mouseMoveWatchlist:[],
        /**@property {Array<SCEntity>}*/___mouseDownWatchlist:[],
        /**@property {Array<SCEntity>}*/___mouseUpWatchlist:[],
        /**@property {Array<SCEntity>}*/__mouseMoveWatchlist:[],
        /**@property {Array<SCEntity>}*/__mouseDownWatchlist:[],
        /**@property {Array<SCEntity>}*/__mouseUpWatchlist:[],
        updateWatchList:()=>{
            this.events.___mouseDownWatchlist = this.entityList.filter(ent=>
                ent.events.click !== null
                || ent.events.dbclick !== null
                || ent.events.mousedown !== null
                ).sort((enta,entb)=>enta._pos.z)
            this.events.___mouseUpWatchlist = this.entityList.filter(ent=>
                ent.events.click !== null
                || ent.events.dbclick !== null
                || ent.events.mouseup !== null
                ).sort((enta,entb)=>enta._pos.z)
            this.events.___mouseMoveWatchlist = this.entityList.filter(ent=>
                ent.events.hover !== null
                ).sort((enta,entb)=>enta._pos.z)
            this.events.__mouseDownWatchlist = this.entityList.sort((enta,entb)=>enta._pos.z)
            this.events.__mouseUpWatchlist = this.entityList.sort((enta,entb)=>enta._pos.z)
            this.events.__mouseMoveWatchlist = this.entityList.sort((enta,entb)=>enta._pos.z)
        },
        run:()=>{
            this.target.on("mousemove",this.events.__mouseMove)
            this.target.on("mousedown",this.events.__mouseDown)
            this.target.on("mouseup",this.events.__mouseUp)
            this.target.on("wheel",this.events.__wheel)
        }
    }
    /**@param {SCEventSet} mEvent */
    registerMouseEvent(mEvent){
        this.events.mouseEvents.push({
            ...this.events.defaultEventSet,
            ...mEvent
        })
    }
    
    attachEvents(){
        this.events.run()
        this.attachMouseControls()
        this.attachCollider()
    }
    attachCollider(){
        // User Events
        this.registerMouseEvent({
            mousedown:(e)=>{
                //MouseDown
                let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                for (let index = 0; index < this.events.___mouseDownWatchlist.length; index++) {
                    /**@type {SCEntity} */
                    const ent = this.events.___mouseDownWatchlist[index];
                    ent.isColliding(pos)&&ent.events.mousedown()
                }
            },
            mouseup:(e)=>{
                //MouseUp
                let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                for (let index = 0; index < this.events.___mouseUpWatchlist.length; index++) {
                    /**@type {SCEntity} */
                    const ent = this.events.___mouseUpWatchlist[index];
                    ent.isColliding(pos)&&ent.events.mouseup()
                }

            },
            mousemove:(e)=>{
                //Hovering
                let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                for (let index = 0; index < this.events.___mouseMoveWatchlist.length; index++) {
                    /**@type {SCEntity} */
                    const ent = this.events.___mouseMoveWatchlist[index];
                    ent.isColliding(pos)&&ent.events.hover()
                }
            }
        })
    }
    attachZoom(){
        this.registerMouseEvent({
           
        })
    }
    __lastState = "default"
    setCursor(cursorType){
        this.__lastState = cursorType
        this.target.css("cursor",cursorType)
    }
    setCursorDefaultState(){
        this.setCursor(this.__lastState)
    }
    attachMouseControls(){
        /**
         * @type {?SCEntity}
         */
        let SelectedEntity = null;
        let lastColliding = null;
        let isEntityDragging = false
        let draggingPosition =null
        let draggingOffset =null
        //Entity dragging
        this.registerMouseEvent({
            mousedown:(e)=>{
                //MouseDown
                let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                for (let index = 0; index < this.events.__mouseDownWatchlist.length; index++) {
                    /**@type {SCEntity} */
                    const ent = this.events.__mouseDownWatchlist[index];
                    if(ent.isColliding(pos)){
                        lastColliding = ent
                        SelectedEntity = ent
                        isEntityDragging = true
                        draggingPosition = pos
                        draggingOffset = draggingPosition.sub(ent.pos)
                        this.setCursor("grabbing")
                        break;
                    }
                }
            },
            mouseup:(e)=>{
                let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                //MouseUp
                if(isEntityDragging && SelectedEntity !== null){
                    // Entity must close
                    isEntityDragging = false
                    this.setCursor("grab")
                }

            },
            mousemove:(e)=>{
                //Hovering
                if(SelectedEntity !== null && isEntityDragging){
                    // Entity Dragging State
                    let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                    SelectedEntity.pos = pos.sub(draggingOffset)
                }else{
                    // Hovering state
                    let pos = this.utils.clientToView(e.offsetX,e.offsetY)
                    for (let index = 0; index < this.events.__mouseDownWatchlist.length; index++) {
                        /**@type {SCEntity} */
                        const ent = this.events.__mouseDownWatchlist[index];
                        if(ent.isColliding(pos) && lastColliding === null){
                            //mouse enter
                            lastColliding = ent;
                            this.setCursor("grab")
                            return
                        }else if(ent.isColliding(pos) && lastColliding === ent){
                            // Entity mousemove
                            return
                        }
                    }
                    if(lastColliding !== null){
                        // Entity mouseleft
                        lastColliding = null
                        this.setCursor("default")
                    }else{
                        // mousemove on space
                    }
                }
            }
        })
        // Dragging
        let isDragOpen = false
        let sx,sy;
        let sox,soy;
        let se_x,se_y;
        $().mousedown(
            (e)=>{
                e.ctr
        })
        this.registerMouseEvent({
            mousedown:(e)=>{
                //open drag
                if(e.which!==2)return;
                isDragOpen = true
                this.setCursor("move")
                sx = e.offsetX
                sy = e.offsetY
                sox = this.origin.x
                soy = this.origin.y
            },
            mouseup:(e)=>{
                if(e.which!==2)return;
                this.setCursorDefaultState()
                isDragOpen = false
                se_x = e.offsetX-sx
                se_y = e.offsetY-sy
                console.log("Mouse drag ended on",e.offsetX-sx,e.offsetY-sy,"now origin is",this.origin.x,this.origin.y)
            },
            mousemove:(e)=>{
                if(!isDragOpen) return;
                se_x=e.offsetX-sx
                se_y=e.offsetY-sy
                this.origin = new Vector(sox+se_x,soy+se_y)
            },
            wheel:(e)=>{
                let pos = this.utils.clientToView(event.offsetX,event.offsetY)
                if(e.originalEvent.deltaY < 0){
                    // wheeled up
                    this.zoom = this.zoom/0.818933027098955175
                    if(!e.shiftKey)
                    this.utils.setOriginByPos(pos);
                }
                else {
                    // wheeled down
                    this.zoom = this.zoom*0.818933027098955175
                }
                
            }
        })
    }
}