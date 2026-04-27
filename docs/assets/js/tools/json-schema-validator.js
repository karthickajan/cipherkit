(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
  };
  function $(id){return document.getElementById(id);}
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.code+'</div><h2 id="t-heading">JSON Schema Validator</h2></div><span class="tc-badge tc-badge-purple">Validate</span></div><div class="tc-body" role="region" aria-labelledby="t-heading">'
    +'<div class="tool-two-col">'
    +'<div class="field"><div class="field-hdr"><label for="t-schema">JSON Schema</label></div><textarea id="t-schema" placeholder="Paste JSON Schema\u2026" rows="10" class="mono"></textarea></div>'
    +'<div class="field"><div class="field-hdr"><label for="t-data">JSON Data</label></div><textarea id="t-data" placeholder="Paste JSON data to validate\u2026" rows="10" class="mono"></textarea></div>'
    +'</div>'
    +'<button type="button" class="act-btn act-purple" id="btn-val">'+IC.check+' <span>Validate</span></button>'
    +'<div class="inline-error" id="t-err" role="alert"></div>'
    +'<div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">'+IC.copy+' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Validation result will appear here\u2026</div></div>'
    +'</div></div></div>';
  function validateSchema(schema,data,path){
    var errors=[];
    if(schema.type){
      var t=schema.type;
      if(t==='object'&&(typeof data!=='object'||data===null||Array.isArray(data)))errors.push(path+': expected object');
      else if(t==='array'&&!Array.isArray(data))errors.push(path+': expected array');
      else if(t==='string'&&typeof data!=='string')errors.push(path+': expected string');
      else if(t==='number'&&typeof data!=='number')errors.push(path+': expected number');
      else if(t==='integer'&&(typeof data!=='number'||data%1!==0))errors.push(path+': expected integer');
      else if(t==='boolean'&&typeof data!=='boolean')errors.push(path+': expected boolean');
    }
    if(schema.required&&typeof data==='object'&&data){schema.required.forEach(function(k){if(!(k in data))errors.push(path+'.'+k+': required');});}
    if(schema.properties&&typeof data==='object'&&data){Object.keys(schema.properties).forEach(function(k){if(k in data)errors=errors.concat(validateSchema(schema.properties[k],data[k],path+'.'+k));});}
    if(schema.items&&Array.isArray(data)){data.forEach(function(item,i){errors=errors.concat(validateSchema(schema.items,item,path+'['+i+']'));});}
    if(schema.minimum!==undefined&&typeof data==='number'&&data<schema.minimum)errors.push(path+': minimum '+schema.minimum);
    if(schema.maximum!==undefined&&typeof data==='number'&&data>schema.maximum)errors.push(path+': maximum '+schema.maximum);
    if(schema.minLength!==undefined&&typeof data==='string'&&data.length<schema.minLength)errors.push(path+': minLength '+schema.minLength);
    if(schema.maxLength!==undefined&&typeof data==='string'&&data.length>schema.maxLength)errors.push(path+': maxLength '+schema.maxLength);
    if(schema.pattern&&typeof data==='string'&&!new RegExp(schema.pattern).test(data))errors.push(path+': does not match pattern');
    if(schema.enum&&schema.enum.indexOf(data)===-1)errors.push(path+': not in enum ['+schema.enum.join(', ')+']');
    return errors;
  }
  $('btn-val').addEventListener('click',function(){
    $('t-err').textContent='';$('t-err').style.display='none';
    var s=$('t-schema').value.trim(),d=$('t-data').value.trim();
    if(!s||!d){$('t-err').textContent='Both schema and data are required.';$('t-err').style.display='block';return;}
    try{var schema=JSON.parse(s);}catch(e){$('t-err').textContent='Invalid JSON Schema: '+e.message;$('t-err').style.display='block';return;}
    try{var data=JSON.parse(d);}catch(e){$('t-err').textContent='Invalid JSON Data: '+e.message;$('t-err').style.display='block';return;}
    var errs=validateSchema(schema,data,'$');
    if(errs.length===0){$('t-result').className='out-body mono g';$('t-result').textContent='\u2713 Valid — JSON data matches the schema.';CK.toast('Validation passed');}
    else{$('t-result').className='out-body mono err';$('t-result').textContent='\u2717 Invalid — '+errs.length+' error(s):\n\n'+errs.join('\n');CK.toast('Validation failed','err');}
  });
  CK.wireCopy($('btn-cp'),function(){var t=$('t-result').textContent;return t.indexOf('appear')===-1?t:'';});
  CK.wireDownload($('btn-dl'),function(){var t=$('t-result').textContent;return t.indexOf('appear')===-1?t:'';}, 'json-schema-validation.txt');
  CK.wireCtrlEnter('btn-val');
  CK.setUsageContent('<ol><li>Paste your <strong>JSON Schema</strong> on the left.</li><li>Paste the <strong>JSON data</strong> to validate on the right.</li><li>Click <strong>Validate</strong> to check compliance.</li></ol><p>Supports type, required, properties, items, minimum/maximum, minLength/maxLength, pattern, and enum validation. All client-side.</p>');
})();