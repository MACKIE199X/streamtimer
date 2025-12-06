let timers = {
  A: { end:null, running:false, rem:0 },
  B: { end:null, running:false, rem:0 },
  C: { end:null, running:false, rem:0 }
};

// Load from localStorage
if(typeof localStorage !== "undefined"){
  let saved = localStorage.getItem("timers");
  if(saved){
    timers = JSON.parse(saved);
    for(let id of ["A","B","C"]){
      if(timers[id].running){
        timers[id].end = Date.now() + timers[id].rem;
      }
    }
  }
}

function fmt(ms){
  if(ms<=0) return "00:00:00";
  let s=Math.floor(ms/1000);
  let h=Math.floor(s/3600);
  let m=Math.floor((s%3600)/60);
  s=s%60;
  return [h,m,s].map(n=>String(n).padStart(2,'0')).join(":");
}

setInterval(()=>{
  let now = Date.now();

  for(let id of ["A","B","C"]){
    let t = timers[id];

    if(t.running && t.end){
      let rem = t.end - now;
      if(rem <= 0){
        rem = 0;
        t.running = false;
      }
      t.rem = rem;
    }
  }

  postMessage({
    A: fmt(timers.A.rem),
    B: fmt(timers.B.rem),
    C: fmt(timers.C.rem)
  });

}, 200);

onmessage = function(e){
  let msg = e.data;
  let id = msg.id;
  let now = Date.now();

  switch(msg.cmd){

    case "toggle":
      if(timers[id].running){
        timers[id].rem = timers[id].end - now;
        timers[id].running = false;
      } else {
        timers[id].end = now + timers[id].rem;
        timers[id].running = true;
      }
      break;

    case "stop":
      timers[id] = { end:null, running:false, rem:0 };
      break;

    case "add":
      if(!timers[id].end) timers[id].end = now;
      timers[id].end += msg.sec * 1000;
      timers[id].running = true;
      break;

    case "save":
      if(typeof localStorage !== "undefined"){
        localStorage.setItem("timers", JSON.stringify(timers));
      }
      break;
  }
};
