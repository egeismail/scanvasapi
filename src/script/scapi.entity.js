
/**
 * @typedef {import('./scapi')} 
 * @callback ColliderFunction
 * @param {Vector} pos
 * @return {boolean}
 */

class SCEntity{
    /**@type {{parent:SCAPI,pos:Vector}} SCEntityOptions */
    constructor({parent,pos} = options){
        /**@type {SCAPI} */
        this.parent = parent
        this.id = -1
        /**
        *@type {Vector}
        *@private
        */
        this.viewMatrix = new Vector(1,-1)
        this._pos = pos
    }
    get pos(){
        return this._pos
    }
    get posScaled(){
        return this._pos.clone().dot(this.viewMatrix).mul(this.parent.zoom)
    }
    /**@param {Vector} val */
    set pos(val){
        this._pos[0] = val.x
        this._pos[1] = val.y
        this.parent._draw.draw()
    }
    init(){
        this.parent.registerEntity(this)
    }
    /**
    * This function need for event calculation if you do not define then any events could not work
     * @type {ColliderFunction}
     */
    isColliding = (pos)=>{
        return false
    }
    /**
    * @namespace SCEntityEventSet
    * @memberof SCEntity
     */
    events={
        /** @type {?SCMouseEventBase}*/mousedown:null,
        /** @type {?SCMouseEventBase}*/mouseup:null,
        /** @type {?SCMouseEventBase}*/click:null,
        /** @type {?SCMouseEventBase}*/dbclick:null,
        /** @type {?SCMouseEventBase}*/hover:null,
    }
    execute=()=>undefined
    draw(){
        this.execute()
    }
    /**@param {!ColliderFunction} Collider */
    registerCollider(Collider){
        this.isColliding = Collider
    }
    objects = {
        rectangle:{
            setup:(width=100,height=100,color="#00ff00")=>{
                this.width = width
                this.height = height
                this.color = color
                this.registerCollider((pos)=>{
                    let xC = this.pos.x<=pos.x && pos.x<=this.pos.x+this.width
                    let yC = this.pos.y<=pos.y && pos.y<=this.pos.y+this.height
                    return xC && yC
                })
                this.execute = this.objects.rectangle.execute
            },
            execute:()=>{
                let ctx = this.parent.context
                ctx.fillStyle = this.color
                let hsz = this.height*this.parent.zoom
                let wsz =this.width*this.parent.zoom 
                ctx.fillRect(
                    this.parent.origin.x+this.posScaled.x,
                    this.parent.origin.y+this.posScaled.y-hsz,
                    wsz,hsz
                )
            }
        }
    }
    //

    
}