/**
* @typedef {import('./scapi')}
*/

$(document).ready(()=>{
    let target = document.querySelector("canvas#testCanvas")
    
 console.log("Attaching to ",target)
    window.scapi = new SCAPI({
        target:target,
        width:800,
        height:800
    })
    let scapi = window.scapi
    let e1 = new SCEntity({parent:window.scapi,pos:new Vector(100,100)});
    e1.objects.rectangle.setup()
    e1.init()
})
