
/// GLOBAL FIXED VARIABLES
const body = document.body;
const vh = window.innerHeight / 100;
const templateUI = document.querySelector('#ui');

/// GLOBAL VARIABLES
let combat;

/// LOG
const log = (val)=>{ console.log(val); }

/// SOCKET.IO
const socket = io();
let roomname = null;
let ss = null;
const join = () => { 
    socket.emit('unjoin'); 
    socket.emit('join_server', 'My Username'); 
    ss = newElm('div', 'searching', body)
    let loadingTxt = newElm('div', 'flex', ss)
    'Searching for booty...'.split('').forEach((l, i)=>loadingTxt.innerHTML += `<p style="animation-delay: ${100 * i}ms;">${l}</p>`);
    let cancelJoin = newElm ('button', '', ss);
    cancelJoin.innerText = 'Cancel'
    cancelJoin.addEventListener('click', unjoin)
}
const unjoin = () => {
    socket.emit('unjoin');
    ss.remove();
}
const sendmsg = () => socket.emit('message', roomname, 'hi player');
socket.on('found', (rn)=>{
    ss.innerHTML = 'Pirates located!!!'
    roomname = rn;
    console.log('Found a player: ' + rn);
    socket.emit('join_room', rn)
})
socket.on('msg', (msg)=>{
    console.log(msg);
})


/// DRAG ELEMENTS
function dragElement(el) {
    let sx = 0, sy = 0, tsx = 0, tsy = 0, tpx = 0, tpy = 0, lasso = undefined, d = 0;
    el.onmousedown = dragMouse;
    el.ontouchstart = dragTouch;

    function dragMouse(e){
        combat.tiles.forEach(ti=>ti.resetClass())
        // lasso = newElm('div', 'lasso', el);
        el.classList.add('dragging');
        tsx = e.clientX;
        tsy = e.clientY;
        sx = parseInt(el.getAttribute('data-x'));
        sy = parseInt(el.getAttribute('data-y'));

        let range = 2;
        let rollOptions = [combat.tilesArr[sy][sx]]
        for(i = 0; i < range; i++){
            rollOptions.forEach(ro=>{
                ro.buren.forEach(b=>{
                    if(b && !b.e.dice) {
                        b.e.classList.add('roll-option');
                        rollOptions.push(b)
                    }
                })  
            })
        }
        el.obj.faces[el.obj.value].forEach(pip=>{
            pip.dragStart(combat.tilesArr[sy][sx]);
        })
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function dragTouch(e){
        selectAll('.tile').forEach(ti=>ti.classList.remove('roll-option', 'valid-target', 'invalid-target'))
        el.classList.add('dragging');
        tsx = e.targetTouches[0].pageX;
        tsy = e.targetTouches[0].pageY;

        sx = parseInt(el.getAttribute('data-x'));
        sy = parseInt(el.getAttribute('data-y'));

        let range = 2;
        let rollOptions = [combat.tilesArr[sy][sx]]
        for(i = 0; i < range; i++){
            rollOptions.forEach(ro=>{
                ro.buren.forEach(b=>{
                    if(b && !b.e.dice) {
                        b.e.classList.add('roll-option');
                        rollOptions.push(b);
                    }
                })  
            })
        }
        el.obj.faces[el.obj.value].forEach(pip=>{
            pip.dragStart(combat.tilesArr[sy][sx]);
        })
        document.ontouchend = closeDragElement;
        document.ontouchmove = dragMobile;
    }
    function dragMobile(e){
        tpx = e.targetTouches[0].pageX;
        tpy = e.targetTouches[0].pageY;
        let a = angle(tsx, tsy, tpx, tpy);
        el.style.rotate = a + 'deg'
        d = distance(tsx, tsy, tpx, tpy);
        getHoverTarget('tile');
    }
    function elementDrag(e){
        tpx = e.clientX;
        tpy = e.clientY;
        let a = angle(tsx, tsy, tpx, tpy);
        el.style.rotate = a + 'deg'
        d = distance(tsx, tsy, tpx, tpy);
        getHoverTarget('tile');
    }
    async function closeDragElement(e){
        document.onmouseup = null;
        document.ontouchend = null;
        document.onmousemove = null;
        document.ontouchmove = null;

        el.classList.remove('dragging');
        let target = select('.tile.hover');
        if(!target) return;
        target.classList.remove('hover')
        if(target) {
            
            if(true){
            // if(!target.dice&&target.classList.contains('roll-option')){
                // target.classList.add('occupied')
                // el.obj.tile.classList.remove('occupied')
                // select(`.tile.x${el.getAttribute('data-x')}.y${el.getAttribute('data-y')}`).dice = null;
                el.setAttribute('data-x',target.x);
                el.setAttribute('data-y',target.y);
                el.obj.roll();
                // target.dice = el
                // el.obj.tile = target;
            } else if (target.classList.contains('valid-target')){
                el.obj.use(target.dice, tpx, tpy, d)
            }
        }
        combat.tiles.forEach(ti=>ti.resetClass())
    }
    /// GET HOVER TARGET
    function getHoverTarget(cl){
        selectAll(`.${cl}`).forEach(d=>{
            let b = d.getBoundingClientRect();
            if(tpx > b.left && tpy > b.top && tpx < b.left + b.width && tpy < b.top + b.height) d.classList.add('hover');
            else d.classList.remove('hover');
        })
    }
  }

  /// GENERATE SEED
  const newSeed = () => {
    let seed = '';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 9; i++) {
      seed += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return seed;
  };

/// AWAIT SLEEP
const sleep = async (ms)=>{
    return new Promise((r)=>{
        setTimeout(()=>{r()}, ms);
    })
}

/// NEXT ROUND
const endTurn = ()=>{
    game.pl1.rerolls = 3;
    game.nextRound();
}
/// NEW ELEMENT
const newElm = (e, c, p)=>{
    let elm = document.createElement(e);
    elm.classList = c;
    if (p) p.append(elm);
    return elm;
}
/// CHECK COLLISION
function isCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
  
    return !(
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom ||
      rect1.right < rect2.left ||
      rect1.left > rect2.right
    );
}
/// DOCUMENT QUERYSELECTOR
const select = (cl)=> document.querySelector(cl);
const selectAll = (cl)=> document.querySelectorAll(cl);
/// CALCULATE ANGLE
const angle = (cx, cy, ex, ey) =>  90 + Math.atan2(ey - cy, ex - cx) * 180 / Math.PI;

/// CALCULATE DISTANCE
const distance = (cx, cy, ex, ey) => {
    let a = cx - ex;
    let b = cy - ey;
    return Math.sqrt( a*a + b*b );
}
///HIGHLIGHT PIP
const highlightPip = async (e)=>{
    e.classList.add('highlight')
    await sleep(200);
    e.classList.remove('highlight')
}

/// ADD LOG
const addLog = (val)=>{
    document.querySelector('#logs').innerHTML += `<li>${val}</li>`
}