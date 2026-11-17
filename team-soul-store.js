(function(root){
  const OPTIONS={2:['spd','atk','hp','def'],4:['atk','hp','def','hit','res'],6:['atk','hp','def','crit','critdmg']};
  function validBuild(build){return build===null || !!build&&typeof build==='object'&&/^\d+$/.test(build.soulId)&&(!build.secondaryId||/^\d+$/.test(build.secondaryId))&&(build.note===undefined||(typeof build.note==='string'&&build.note.length<=500))&&!!build.mainStats&&Object.entries(OPTIONS).every(([slot,options])=>build.mainStats[slot]===''||options.includes(build.mainStats[slot]));}
  function validBuilds(builds){return Array.isArray(builds)&&builds.length===10&&builds.every(validBuild);}
  function empty(){return Array(10).fill(null);}
  function copy(builds){return builds.map(x=>x?{soulId:x.soulId,secondaryId:x.secondaryId||'',note:x.note||'',mainStats:{...x.mainStats}}:null);}
  function bonus(build){return build?.mainStats?.['2']==='spd'?57:0;}
  function total(base,build){return typeof base==='number'&&Number.isFinite(base)&&base>0?base+bonus(build):null;}
  function swap(builds,a,b){const out=copy(builds);[out[a],out[b]]=[out[b],out[a]];return out;}
  root.TeamSoulStore={OPTIONS,validBuild,validBuilds,empty,copy,bonus,total,swap};
  if(typeof module!=='undefined')module.exports=root.TeamSoulStore;
})(typeof globalThis!=='undefined'?globalThis:this);
