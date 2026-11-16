(function(root){
  function groups(skills){const result=[],byId=new Map();(skills||[]).forEach((skill,index)=>{const key=String(skill.parentSkillId??skill.id);let group=byId.get(key);if(!group){group={key,items:[]};byId.set(key,group);result.push(group)}group.items.push({skill,index})});return result.map(group=>({...group,items:group.items.sort((a,b)=>(a.skill.variantOrder??0)-(b.skill.variantOrder??0)||a.index-b.index)}))}
  function fallback(skill){const name=skill?.iconFile;return typeof name==='string'&&/^[A-Za-z0-9_-]+\.webp$/.test(name)?`https://thucthanluc.io.vn/skill-icons/${encodeURIComponent(name)}`:''}
  root.SkillUtils={groups,fallback};if(typeof module!=='undefined')module.exports=root.SkillUtils;
})(typeof globalThis!=='undefined'?globalThis:this);
