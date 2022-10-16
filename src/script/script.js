/**
* @typedef {import('./scapi')}
*/


$(document).ready(()=>{
    let target = document.querySelector("canvas#testCanvas")
    
 console.log("Attaching to ",target)
    let scapi = window.scapi = new SCAPI({
        target:target,
        width:600,
        height:600
    })
    loadScene(window.scapi,1);
    console.log("gds",scapi.guideLines)
})
