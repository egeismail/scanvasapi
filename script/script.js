/**
*@author Septillioner
*/
/**@typedef {import("./jquery")} JQuery*/
/**@typedef {import("./vector")} JQuery*/

class SCEntity{
    /**@type {{parent:SCAPI,pos:Vector}} SCEntityOptions */
    constructor({parent,pos} = options){

    }
}
class SCAPI{
    /**@typedef {{target:Element,width:number,height:number}} SCAPIOptions */
    /**
     * 
     * @param {SCAPIOptions} param0 
     */
    constructor( { target,width,height} = options){
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
        this.target.addClass("scapi-canvas")
        this.initialize()
    }
    initialize(){
        this.attachEvents()
        this.makeGrid()
    }
    makeGrid(gCount){
        // const bw = this.width
        // const bh = this.height
        // const lw = 1              // box border
        // const divs = 10         // how many boxes
        // const divYSize = bh/divs
        // const divXSize = bw/divs
        // this.context.strokeStyle = "rgba(255,255,255,0.4)"
        // for (let sy = 0; sy < divs; sy++) {
        //     let sypos = sy*divYSize
        //     this.context.strokeRect(0,sypos,bw,divYSize)
        // }
        // for (let sx = 0; sx < divs; sx++) {
        //     let sxpos = sx*divXSize
        //     this.context.strokeRect(sxpos,0,divXSize,bh)
        // }
        const bw = this.width
  const bh =this.height
  const lw = 1              // box border
  const boxRow = 5         // how many boxes
  const box = bw / boxRow   // box size
  this.context.lineWidth = lw
  this.context.strokeStyle = 'rgb(2,7,159)'
  for (let x=0;x<bw;x+=box)
  {
    for (let y=0;y<bh;y+=box)
    {
      this.context.strokeRect(x,y,box,box)
    }
  }
    }
    events = {
        mouseMove:(e)=>{

        },
        mouseDown:(e)=>{

        },
        mouseUp:(e)=>{

        }
    }
    attachEvents(){
        this.target.on("mousemove",this.events.mouseMove)
        this.target.on("mousedown",this.events.mouseDown)
        this.target.on("mouseup",this.events.mouseUp)
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
