
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

var showjax = {
  frameall: [],
  framedone: [],
  frameidx: 0,
  infodiv: null,
  infotimer: 0,
  mobile: false,
  oldstyles: [],
  showarea: null
};

showjax.startPresent = function() {
  var showarea = this.showarea;
  var i, node;
  this.frameall = [], this.frameidx = 0;
  for (i = 0; i < showarea.childNodes.length; i++) {
    node = showarea.childNodes[i];
    if (/\bframe|maketitle\b/.test(node.className)) {
      this.frameall.push(i);
    } else {
      node.style.display = "none";
    }
  }
  //console.log(this.frameall);
  if (this.frameall.length == 0) {
    alert("There isn't any beamer frame!");
    jaxedit.doResize();
  } else {
    this.initShow();
    this.resizeShow();
    MathJax.Hub.config.showProcessingMessages = false;
    MathJax.Hub.Rerender(showarea); //"Rerender" vs "Reprocess"
    MathJax.Hub.Queue([showjax, function(){
      this.frameidx = 0;
      this.framedone[0] = true;
      for (i = 1; i < this.frameall.length; i++) {
        showarea.childNodes[this.frameall[i]].style.display = "none";
      }
    }]);
    window.onresize = function(){showjax.resizeShow()};
    document.onclick = document.onkeydown = document.onmousemove = document.ongesturestart = function(event){showjax.navigateShow(event)};
  }
};

showjax.initShow = function() {
  var body = document.body, showarea = this.showarea;
  var parent, childs, chd, i, node = showarea;
  var styles = [];
  do {
    parent = node.parentNode;
    childs = parent.childNodes;
    for (var i = 0; i < childs.length; i++) {
      chd = childs[i];
      if (chd.nodeType != 1) continue;
      if (chd == node) {
        styles.push(chd, [
          "height", "100%", "width", "100%",
          "margin", "0px", "padding", "0px",
          "border", "none"
        ]);
      } else {
        styles.push(chd, ["display", "none"]);
      }
    }
    node = parent;
  } while (parent != body);

  styles.push(body, ["backgroundColor", "black"]);

  var frameall = this.frameall;
  for (var i = 0; i < frameall.length; i++) {
    styles.push(showarea.childNodes[frameall[i]], [
      "width", "96%",
      "height", "96%",
      "padding", "2%",
      "border", "none",
      "margin", "0px"
    ]);
  }

  styles.push(showarea, [
    "fontSize", "250%",
    "margin", "0px", "border", "none",
    "overflow", "hidden",
    "cursor", "pointer" /* fix for click event in ios */
  ]);
  this.setupStyle(styles);
};

showjax.resizeShow = function() {
  var showarea = this.showarea;
  var pageWidth = window.innerWidth;
  var pageHeight = window.innerHeight;
  if (typeof pageWidth != "number" ){
     if (document.compatMode == "CSS1Compat"){
        pageWidth = document.documentElement.clientWidth;
        pageHeight = document.documentElement.clientHeight;
     } else {
        pageWidth = document.body.clientWidth;
        pageHeight = document.body.clientHeight;
     }
  }

  if (pageWidth > 4 * pageHeight / 3) {
    showHeight = pageHeight;
    showWidth = 4 * showHeight / 3;
  } else {
    showWidth = pageWidth;
    showHeight = 3 * showWidth / 4;
  }

  showarea.style.width = showWidth + "px"; showarea.style.height = showHeight + "px";
  showarea.style.marginLeft = showarea.style.marginRight = (pageWidth - showWidth) / 2 + "px";
};

showjax.setupStyle = function(styles) {
  var i, j, el, st, old = [];
  for (i = 0; i < styles.length; i = i + 2) {
    el = styles[i]; st = styles[i + 1];
    old.push([el, el.style.cssText]);
    for (j = 0; j < st.length; j = j + 2) {
      el.style[st[j]] = st[j + 1];
    }
  }
  this.oldstyles = old;
  //console.log(old);
}

showjax.resetStyle = function(elemStyles) {
  for (var i = 0; i < elemStyles.length; i++) {
    elemStyles[i][0].style.cssText = elemStyles[i][1];
  }
};

showjax.quitShow = function() {
  document.body.removeChild(this.infodiv);
  jsquick.removeStyles("showjax-style");
  this.resetStyle(this.oldstyles);
  var showarea = this.showarea, childs = showarea.childNodes;
  for (var i = 0; i < childs.length; i++) {
    if (childs[i].nodeType == 1 && !/preamble/.test(childs[i].className)) {
      childs[i].style.display = "block";
    }
  }
  jaxedit.doResize();
  MathJax.Hub.Rerender(showarea);
  window.onresize = function(){jaxedit.doResize()};
  document.onclick = document.onkeydown = document.onmousemove = document.ongesturestart = null;
};

showjax.navigateShow = function(event) {
  var ev = event ? event : window.event;
  var k = showjax.frameidx;
  var showarea = showjax.showarea;
  var infodiv = showjax.infodiv;
  switch (ev.type) {
    case "click":
      showjax.frameidx = (k + 1 == showjax.frameall.length) ? 0 : k + 1;
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
      break;
    case "keydown":
      switch(ev.keyCode) {
        case 27: // escape
          showjax.quitShow();
          return;
        case 37: case 63234:  // left arrow
        case 38: case 63232:  // up arrow
          showjax.frameidx = (k == 0) ? showjax.frameall.length - 1 : k - 1;
          ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
          break;
        case 39: case 63235:  // right arrow
        case 40: case 63233:  // down arrow
          showjax.frameidx = (k + 1 == showjax.frameall.length) ? 0 : k + 1;
          ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
          break;
      }
      break;
    case "mousemove":
      if (!showjax.mobile) {
        if (ev.clientY < 50) {
          clearTimeout(showjax.infotimer);
          showjax.infotimer = 0;
          infodiv.style.display = "block";
        } else {
          if (!showjax.infotimer) {
            showjax.infotimer = setTimeout(function(){infodiv.style.display = "none";}, 2000);
          }
        }
      }
      break;
    case "gesturestart":
      if (showjax.mobile) {
        clearTimeout(showjax.infotimer);
        infodiv.style.display = "block";
        showjax.infotimer = setTimeout(function(){infodiv.style.display = "none";}, 3000);
      }
      ev.preventDefault();
      break;
  }
  //console.log(k, showjax.frameidx);
  showarea.childNodes[showjax.frameall[k]].style.display = "none";
  showarea.childNodes[showjax.frameall[showjax.frameidx]].style.display = "block";
  showarea.childNodes[showjax.frameall[showjax.frameidx]].style.border = "none";
  //if (!showjax.framedone[showjax.frameidx]) {
  if (showjax.frameidx !== k) {
    MathJax.Hub.Rerender(showarea);
    showjax.framedone[showjax.frameidx] = true;
  }
  //}
};

showjax.addInfotip = function() {
  var shortcut, showinfo;
  switch (jsquick.system) {
    case 'windows':
    case 'linux':
      shortcut = 'F11';
      break;
    case 'macos':
      if (jsquick.browser.safari) {
        return;
      } else {
        shortcut = 'Cmd+Shift+F';
      }
      break;
  }
  showinfo = document.createElement("div");
  showinfo.id = "infodiv";
  if (shortcut) {
    this.mobile = false;
    fullinfo = "Press Esc to quit. Press " + shortcut + " for fullscreen";
    showinfo.innerHTML = "<span>" + fullinfo + "</span>";
  } else {
    this.mobile = true;
    showinfo.innerHTML = "<span>Exit</span>";
    showinfo.onclick = function(){showjax.quitShow();}
  }
  document.body.appendChild(showinfo);
  this.infodiv = showinfo;
  setTimeout(function(){showinfo.style.display = "none";}, 5000);
};

showjax.doPresent = function(showarea){
  this.showarea = showarea;
  this.startPresent();
  this.addInfotip();
};
