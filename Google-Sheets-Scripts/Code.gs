function $and() {
  var args = argPairs(arguments);
  
  var filters = args.filter(isFilter);
  var queries = args.filter(isNotFilter);
  
  var lists = queries.map(resolveQuery(filters));

  var ret = intersect(lists);
  if (ret.length > 0) return ret;
  return "(None.)";  
};

function $syns(w) {
  var result = UrlFetchApp.fetch("http://synonyms.pickfor.us/"+w+"/s");
  return JSON.parse(result.getContentText());
};

function $qat(w){
  var result = UrlFetchApp.fetch("http://www.quinapalus.com/cgi-bin/qat?pat="+encodeURIComponent(w)+"&ent=Search&dict=0");
  var rbody  = result.getContentText().split("\n");
  var matches = [];
  
  var inWords = false;
  for (var i=1;i<rbody.length;i++){
    if (!inWords && rbody[i-1].match(/<b>Length \d+<\/b>/)){
      inWords = true;
    }
    if (inWords) {
      rbody[i].replace("<br>","").split(/\s+/).forEach(function(match){
        matches.push(match);
      });

      if (rbody[i].match(/<br>/)) {
        inWords = false;
      }
    }
  }
  return matches;
};

function $wiki(w){  
  var result = UrlFetchApp.fetch("http://en.wikipedia.org/wiki/"+w);
  var r  = result.getContentText();
  var words = r.replace(/^[\s\S]*?From Wikipedia, the free encyclopedia/g, "")
               .replace(/Navigation menu[\s\S]*$/, "")
               .replace(/<.*?>/g, "")
               .replace(/[\s]+/g, " ")
               .split(/\W+/g)
               .filter(function(w){return w.length  >3;})
               .map(function(w){return w.toLowerCase();});
  var wordHash = {};
  words.forEach(function(w){wordHash[w] = true;});
  return Object.keys(wordHash).sort(); 
};

function isFilter(t){ return t[0] === "regex"; };
function isNotFilter(t){ return !isFilter(t); };

function resolveQuery(filters){
  return function(q){
    var name = q[0];
    var val = q[1];
    return eval("$"+name)(val).filter(function(v){
      var passes = true;
      filters.forEach(function(f){
        var fRegExp = new RegExp(f[1]);
        if (!(passes && v.match(fRegExp))){ passes = false;}
      });
      return passes;
    });
  };
};

function intersect(lists){
  var res = {};
  lists[0].forEach(function(v){
    res[v] = true;
  });

  for (var i=1; i<lists.length; i++) {
    var vs = lists[i].filter(function(v){
      return res[v] === true;
    });
    res = {};
    vs.forEach(function(v){
      res[v] = true;
    });
  };
  return Object.keys(res).sort();
};

function argList(args){
  var ret = [];
  for (var i=0; i<args.length; i++){
    ret.push(args[i]);
  }
  return ret;
}

function argPairs(args) {
  var args = argList(args);
  var ret = [];
  for (var i=0;i<args.length;i+=2){
    ret.push([args[i], args[i+1]]);
  }  
  return ret;
}
