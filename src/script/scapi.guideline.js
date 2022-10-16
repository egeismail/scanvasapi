
/**
 * @typedef {import('./scapi')} 
 */
/**@typedef {{parent:!SCAPI,spos:?Vector,epos:?Vector,midpos:?Vector,length:?number,dimensional:?boolean,dimension:?number,thickness:number,temporary:boolean}} SCGuidelineOptions */

class SCGuideline{
    /**
     * @param {SCGuidlineOptions} parent
     */
    constructor({parent,spos=null,epos=null,midpos=null,length=null,dimensional = false, dimension = 0,thickness = 1,color="#42f5f5",temporary=true} = options ){
        this.id = -1
        /**@type {SCAPI} */
        this.parent = parent
        this.options = this.options
        this.color = color
        this.temporary = temporary
        this.thickness = thickness
        if(spos !== null & epos !== null){
            this.type = 1
            /**@type {Vector} */
            this.startPos = spos
            /**@type {Vector} */
            this.endPos = epos
        }else if(midpos !== null & ((length !== null && dimension !== null) || (dimensional === true && dimension !== null))){
            if(midpos !== null && length !== null){
                this.type = 2
                this.dimension =dimension
                this.midPos = midpos
                if(dimension === 0){ //x 
                    /**@type {Vector} */
                    this.startPos = new Vector(
                        midpos.x-length/2,
                        midpos.y
                    )
                    /**@type {Vector} */
                    this.endPos = new Vector(
                        midpos.x+length/2,
                        midpos.y
                    )
                    console.log("ST POS",this.startPos,this.endPos)
                }else if(dimension === 1){ //y
                    this.startPos = new Vector(
                        midpos.x,
                        midpos.y-length/2
                    )
                    /**@type {Vector} */
                    this.endPos = new Vector(
                        midpos.x,
                        midpos.y+length/2
                    )
                }
                /**@type {number} */
                this.length = length
            }else{
                this.type = 3
                /**@type {Vector} */
                this.midPos = midpos
                /**@type {number} */
                this.dimension = dimension
                if(dimension === 0){ //x 
                    /**@type {Vector} */
                    this.startPos = midpos
                    /**@type {Vector} */
                    this.endPos = midpos
                }else if(dimension === 1){ //y
                    this.startPos = this.midPos
                    /**@type {Vector} */
                    this.endPos = midpos
                }
            }
        }else{
            throw Error("Not valid guidline options");
        }
        /**
        *@type {Vector}
        *@private
        */
        this.viewMatrix = new Vector(1,-1)
    }
    init(){
      
        this.parent.registerGuideline(this)

    }
    draw(){
        let context = this.parent.context 
        
        context.strokeStyle = this.color
        context.lineWidth = this.thickness
        context.beginPath()
        if(this.type === 3){
            let midPoint = this.parent.utils.viewToClient(this.midPos)
            if(this.dimension === 0){ // x guideline
                context.moveTo(
                    0,
                    midPoint.y
                )
                context.lineTo(
                    this.parent.width,
                    midPoint.y
                )
            }else{ // y guideline
                context.moveTo(
                    midPoint.x,
                    0
                )
                context.lineTo(
                    midPoint.x,
                    this.parent.height,
                )
            }
        }else{
            let sPos = this.parent.utils.viewToClient(this.startPos)
            let ePos = this.parent.utils.viewToClient(this.endPos)
            context.moveTo(sPos.x,sPos.y)
            context.lineTo(ePos.x,ePos.y)
        }
        context.stroke();
    }
    
    
}