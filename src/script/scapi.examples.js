function loadScene(scapi,scene){
    switch (scene) {
        case 1:
            scene_1(scapi)
            break;
    
        default:
            break;
    }
}

function scene_1(scapi) {
    let sposx = 0,sposy=0
    let width = 10
    let height = 10
    let margin = 10
    let degree = 0
    let rows = 10
    let cols = 10
    let itemCount = rows*cols
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      }
    let maxX = 0
    for (let r = 0; r < rows; r++) {
        for (let index = 0; index < cols; index++) {
            let e1 = new SCEntity({parent:scapi,pos:new Vector(sposx,sposy)});
            let color = hslToHex(degree,100,50)
            // console.log("color is ",color)
            e1.objects.rectangle.setup(
                width=width,
                height=height,
                color=color
                )
            
            e1.init()
            sposx += width + margin
            degree+=360/itemCount
            
        }
        maxX = Math.max(maxX,sposx)
        sposx = 0
        sposy += height + margin
        
    }
    maxX -= width
    sposy -= height

    let tGL = new SCGuideline({
        parent:window.scapi,
        spos:new Vector(0,sposy),
        epos:new Vector(maxX,sposy),
        color:"#fd7000",
        temporary:false
    }).init()
    let rGL = new SCGuideline({
        parent:window.scapi,
        spos:new Vector(maxX,sposy),
        epos:new Vector(maxX,0),
        color:"#fd7000",
        temporary:false
    }).init()
    let bGL = new SCGuideline({
        parent:window.scapi,
        spos:new Vector(maxX,0),
        epos:new Vector(0,0),
        color:"#fd7000",
        temporary:false
    }).init()
    let lGL = new SCGuideline({
        parent:window.scapi,
        spos:new Vector(0,0),
        epos:new Vector(0,sposy),
        color:"#fd7000",
        temporary:false
    }).init()
    let mTest = new SCGuideline({
        parent:window.scapi,
        midpos:new Vector(100, -10),
        length:100,
        dimension:0,
        color:"#0000ff",
        temporary:false
    }).init()
}