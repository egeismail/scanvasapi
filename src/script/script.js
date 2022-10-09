/**
*@author Septillioner
*/
/**@typedef {import("./jquery")} JQuery*/
/**@typedef {import("./vector")} JQuery*/

class SCEntity{
    /**@type {{parent:SCAPI,pos:Vector}} SCEntityOptions */
    constructor({parent,pos} = options){
        /**@type {SCAPI} */
        this.parent = parent
        this.pos = pos
    }
    draw(){
    }
}
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
        /**@
         * 
         */
        this.entityList = []
        /**@type {Array<Function>} */
        this.debugTexts = []
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
    utils = {
        fitOrigin:()=>{
            this.origin = new Vector(
                this.width/2,
                this.height/2
            )
        }
    }
    _draw = {
        makeGrid:()=>{
            let cGrid = (counts=10,opacity="0.4",invert=false)=>{
                let distance = (this.width/counts)/this.zoom
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
                for (let j = 0; j <= this.height; j += distance ) {
                    this.context.beginPath();
                    this.context.moveTo(0, j+this._origin.y%distance ); 
                    this.context.lineTo(this.width, j +this._origin.y%distance);
                    this.context.closePath();
                    this.context.stroke();
                }
            }
            cGrid(10,"0.1")
            cGrid(100,"0.05")
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

        },
        draw:()=>{
            let stime = performance.now()
            this.context.fillStyle = "#000"
            this.context.fillRect(0,0,this.width,this.height)
            this._draw.makeGrid()
            this._draw.drawOrigin()
            this._draw.drawDebugTexts()
            let etime = performance.now()
            let elapsed = etime-stime
            this.frametime = elapsed.toFixed(2)
            this.FPS = ((1/(elapsed/1000))).toFixed(1)
        }
    }
    events = {
        /**@type {Array<JQuery.TypeEventHandler>}*/mouseEvents:[],
        __mouseMove:(e)=>{
            this.events.mouseEvents.forEach(_e=>_e(e))
        },
        __mouseDown:(e)=>{
            this.events.mouseEvents.forEach(_e=>_e(e))
        },
        __mouseUp:(e)=>{
            this.events.mouseEvents.forEach(_e=>_e(e))
        }
    }
    /**@param {MouseEvent} mEvent */
    registerMouseEvent(mEvent){
        this.events.mouseEvents.push(mEvent)
    }
    attachEvents(){
        this.target.on("mousemove",this.events.__mouseMove)
        this.target.on("mousedown",this.events.__mouseDown)
        this.target.on("mouseup",this.events.__mouseUp)
        this.target.on('wheel', (event)=>{
            // deltaY obviously records vertical scroll, deltaX and deltaZ exist too
            if(event.originalEvent.deltaY < 0){
                // wheeled up
                this.zoom = this.zoom*0.818933027098955175
            }
            else {
                // wheeled down
                this.zoom = this.zoom/0.818933027098955175
            }
        });
        // Dragging
        
        let isDragOpen = false
        let sx,sy;
        let sox,soy;
        let se_x,se_y;
        /**
         * @param {MouseEvent} e 
         */
        let dragging = (e)=>{

            switch (e.type) {
                case "mousedown":
                    if(e.which===2){
                        isDragOpen = true
                        this.target.css("cursor","grab")
                        sx = e.offsetX
                        sy = e.offsetY
                        sox = this.origin.x
                        soy = this.origin.y
                    };
                    //open drag
                    break;
                case "mouseup":
                    if(e.which===2){
                        this.target.css("cursor","default")
                        isDragOpen = false
                        se_x = e.offsetX-sx
                        se_y = e.offsetY-sy
                        console.log("Mouse drag ended on",e.offsetX-sx,e.offsetY-sy,"now origin is",this.origin.x,this.origin.y)

                    };
                    //close drag
                    break;
                case "mousemove":
                    if(isDragOpen){
                        se_x=e.offsetX-sx
                        se_y=e.offsetY-sy
                        this.origin = new Vector(sox+se_x,soy+se_y)
                    }
                    //move drag
                    break;
            }
        }
        this.events.mouseEvents.push(dragging)
    }
}
$(document).ready(()=>{
    let target = document.querySelector("canvas#testCanvas")
 console.log("Attaching to ",target)
    window.scapi = new SCAPI({
        target:target,
        width:1280,
        height:768
    })   
})
