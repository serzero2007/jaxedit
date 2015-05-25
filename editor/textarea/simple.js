
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2014 JaxEdit project
 * License: GNU Lesser General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

jaxedit.doChange = function () {
	var agent = $.agent;
	var childs = jaxedit.childs,
		codearea = childs.codearea,
		lbot = childs.lbot,
		showarea = childs.showarea;
	var data = jaxedit.textdata;
	var oldtextvalue = data.oldtextvalue,
		oldtextsize = data.oldetextsize,
		oldselstart = data.oldselstart,
		oldselend = data.oldselend,
		oldseltext = data.oldseltext,
		newtextvalue = data.newtextvalue,
		newtextsize = data.newtextsize,
		newselstart = data.newselstart,
		newselend = data.newselend,
		newseltext = data.newseltext;

	oldtextvalue = newtextvalue;
	oldtextsize = newtextsize;


	newtextvalue = jaxedit.editor.getValue();
	newtextsize = newtextvalue.length;
	
	var delstart = 0,
		delend = 0,
		deltext = "";
	var insstart = 0,
		insend = 0,
		instext = "";

	delstart = (oldselstart < newselstart) ? oldselstart : newselstart;
	delend = (oldtextsize - oldselend < newtextsize - newselend) ? oldselend : oldtextsize - newtextsize + newselend;


	delstart = (delstart - 64 > 0) ? delstart - 64 : 0;
	delend = (delend + 64 < oldtextsize) ? delend + 64 : oldtextsize;


	// we should always keep these two equalities
	insstart = delstart;
	insend = newtextsize - oldtextsize + delend;
	while (newtextvalue.charAt(delstart) == oldtextvalue.charAt(delstart) && delstart < delend && insstart < insend) {
		delstart += 1;
		insstart += 1;
	}
	while (newtextvalue.charAt(delend - 1) == oldtextvalue.charAt(delend - 1) && delstart < delend && insstart < insend) {
		delend -= 1;
		insend -= 1;
	}

	deltext = oldtextvalue.substring(delstart, delend);
	instext = newtextvalue.substring(insstart, insend);

	//console.log("textsize:" + newtextsize + "; selection:" + oldselstart + "-" + oldselend + " to " +  newselstart + "-" + newselend + "; change: " + delstart + " to " + delend + "; event:" + ev.type + "; deltext:" + deltext + " ;instext:" + instext);
	lbot.innerHTML = "size: " + newtextsize + "; selection: " + oldselstart + "-" + oldselend + " to " + newselstart + "-" + newselend;

	data.oldtextvalue = oldtextvalue;
	data.oldetextsize = oldtextsize;
	data.newtextvalue = newtextvalue;
	data.newtextsize = newtextsize;
	data.newselstart = newselstart;
	data.newselend = newselend;
	data.newseltext = newseltext;

	if (window.localStorage) {
		if (deltext != "" || instext != "") {
			//IE8 sometimes crashes when writing empty value to a localStorage item
			if (codearea.value != "") { localStorage.setItem("texcode", codearea.value);} 
			else {localStorage.removeItem("texcode");}
		}
	}

	typejax.updater.putTask(delstart, delend, deltext, instext, newtextsize, showarea);
};

jaxedit.addEditor = function () {
	var codearea = this.childs.codearea;
	var editorCM = CodeMirror.fromTextArea( codearea , {
			height: "350px",
		    continuousScanning: 500,
			lineNumbers: true,
			lineWrapping: true
		});
	
			
	this.editor = {
		getWrapperElement : function () { return editorCM;},
		getValue : function () { return editorCM.getValue(); },
		setValue : function (value) { editorCM.setValue(value); },
		setReadOnly : function (bool) {  },
		scrollTo : function (x, y) {  },
		getScrollInfo : function () { return {}; },
	};
};

jaxedit.addHandler = function () {
	var codearea = this.childs.codearea,
		showarea = this.childs.showarea;
	this.editor.getWrapperElement().on("change", function (cm) { jaxedit.doChange(); });
};
